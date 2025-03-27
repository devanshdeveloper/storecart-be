const express = require('express');
const router = express.Router();
const { validatorMiddleware, permissionMiddleware } = require('../../middleware');
const { ResponseHelper, RequestHelper, validator } = require('../../helpers');
const { PromoCode } = require('./promo.model');
const Cart = require('../cart/cart.model');
const { ErrorMap, UserTypes, Operations, Modules } = require('../../constants');

router.post(
  '/create',
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.CREATE,
    Modules: Modules.Promotion
  }),
  validatorMiddleware({
    body: {
      code: [validator.required(), validator.string(), validator.minLength(4)],
      type: [validator.required(), validator.in(['percentage', 'fixed'])],
      value: [validator.required(), validator.number().min(0)],
      minPurchase: [validator.number().min(0)],
      maxUses: [validator.number().min(0)],
      validFrom: [validator.required(), validator.date()],
      validTo: [validator.required(), validator.date()]
    }
  }),
  async (req, res) => {
    const helper = new ResponseHelper(res);
    try {
      const promo = await PromoCode.create({
        ...new RequestHelper(req).body(),
        storefront: req.user.storefront
      });
      helper.status(201).body(promo).send();
    } catch (error) {
      helper.error(error).send();
    }
  }
);

router.post(
  '/apply-to-cart/:cartId',
  permissionMiddleware({
    UserTypes: [UserTypes.Customer, UserTypes.Admin],
    Operations: Operations.UPDATE,
    Modules: Modules.Promotion
  }),
  validatorMiddleware({
    params: { cartId: [validator.required(), validator.objectId()] },
    body: { code: [validator.required(), validator.string()] }
  }),
  async (req, res) => {
    const helper = new ResponseHelper(res);
    try {
      const requestHelper = new RequestHelper(req);
      const cart = await Cart.findById(req.params.cartId)
        .populate('products.product')
        .populate('appliedPromoCodes.promo');

      if (!cart || cart.deletedAt) {
        return helper.status(404).error(ErrorMap.NOT_FOUND).send();
      }

      const promoCode = await PromoCode.findOne({
        code: requestHelper.body('code'),
        storefront: req.user.storefront,
        deletedAt: null,
        validFrom: { $lte: new Date() },
        validTo: { $gte: new Date() },
        $or: [
          { usageLimit: { $exists: false } },
          { usageCount: { $lt: '$usageLimit' } }
        ]
      });

      if (!promoCode) {
        return helper.status(400).error(ErrorMap.INVALID_PROMO).send();
      }

      const subtotal = cart.subtotal;

      if (promoCode.minPurchaseAmount > subtotal) {
        return helper.status(400).error({
          ...ErrorMap.INVALID_PROMO,
          message: 'Minimum purchase amount not met'
        }).send();
      }

      let discount = promoCode.type === 'percentage'
        ? subtotal * (promoCode.value / 100)
        : promoCode.value;

      if (promoCode.maxDiscountAmount) {
        discount = Math.min(discount, promoCode.maxDiscountAmount);
      }

      cart.appliedPromoCodes.push({
        promo: promoCode._id,
        discount: discount
      });

      cart.amount = Math.max(subtotal - discount, 0);
      await cart.save();

      promoCode.usageCount += 1;
      await promoCode.save();

      helper.body(cart).send();
    } catch (error) {
      helper.error(error).send();
    }
  }
);

module.exports = router;