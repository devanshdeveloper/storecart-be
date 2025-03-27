const express = require("express");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { permissionMiddleware } = require("../permission/permission.middleware");
const { Cart } = require("../../models");
const { ResponseHelper, RequestHelper, validator } = require("../../helpers");
const { ErrorMap, UserTypes, Operations, Modules } = require("../../constants");

const router = express.Router();

// Add item to existing cart
router.post(
  "/add-item",
  permissionMiddleware({
    UserTypes: [UserTypes.Customer],
    Operations: Operations.UPDATE,
    Modules: Modules.Cart,
  }),
  validatorMiddleware({
    body: {
      product: [validator.required(), validator.mongoId()],
      quantity: [validator.required(), validator.number(), validator.min(1)],
      price: [validator.required(), validator.number(), validator.min(0)],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    console.log("req.user._id", req.user._id);
    console.log("req.body", req.body);
    try {
      const cart = await Cart.findOneAndUpdate(
        {
          user: req.user._id,
          deletedAt: null,
        },
        {
          $push: {
            products: {
              product: requestHelper.body("product"),
              quantity: requestHelper.body("quantity"),
              price: requestHelper.body("price"),
            },
          },
        },
        { new: true, runValidators: true, upsert: true }
      ).populate("products.product");

      if (!cart) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "Cart not found" })
          .send();
      }

      return responseHelper.body(cart).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Read one cart
router.get(
  "/read-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.Customer],
    Operations: Operations.READ,
    Modules: Modules.Cart,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const cart = await Cart.findOne(
        {
          _id: requestHelper.params("id"),
          user: req.user._id,
          deletedAt: null,
        },
        { upsert: true }
      ).populate("products.product");

      if (!cart) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "Cart not found" })
          .send();
      }

      return responseHelper.body(cart).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Paginate carts
router.get(
  "/paginate",
  permissionMiddleware({
    UserTypes: [UserTypes.Customer],
    Operations: Operations.READ,
    Modules: Modules.Cart,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Cart.paginate(
        { user: req.user._id, deletedAt: null },
        requestHelper.getPaginationParams()
      );
      return responseHelper
        .body({ carts: data.data })
        .paginate(data.meta)
        .send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);


// Delete cart (soft delete)
router.delete(
  "/delete-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.Customer],
    Operations: Operations.DELETE,
    Modules: Modules.Cart,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const cart = await Cart.findOneAndUpdate(
        {
          _id: requestHelper.params("id"),
          user: req.user._id,
          deletedAt: null,
        },
        { deletedAt: new Date() },
        { new: true }
      );

      if (!cart) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "Cart not found" })
          .send();
      }

      return responseHelper.body(cart).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Update product quantity in cart
router.post(
  "/update-quantity",
  permissionMiddleware({
    UserTypes: [UserTypes.Customer],
    Operations: Operations.UPDATE,
    Modules: Modules.Cart,
  }),
  validatorMiddleware({
    body: {
      product: [validator.required(), validator.mongoId()],
      quantity: [validator.required(), validator.number(), validator.min(1)]
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const cart = await Cart.findOneAndUpdate(
        {
          user: req.user._id,
          deletedAt: null,
          'products.product': requestHelper.body('product')
        },
        {
          $set: {
            'products.$.quantity': requestHelper.body('quantity')
          }
        },
        { new: true, runValidators: true }
      ).populate('products.product');

      if (!cart) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "Cart not found" })
          .send();
      }

      return responseHelper.body(cart).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Remove item from cart
router.post(
  "/remove-item",
  permissionMiddleware({
    UserTypes: [UserTypes.Customer],
    Operations: Operations.DELETE,
    Modules: Modules.Cart,
  }),
  validatorMiddleware({
    body: {
      product: [validator.required(), validator.mongoId()]
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const cart = await Cart.findOneAndUpdate(
        {
          user: req.user._id,
          deletedAt: null
        },
        {
          $pull: {
            products: { product: requestHelper.body('product') }
          }
        },
        { new: true }
      ).populate('products.product');

      if (!cart) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "Cart not found" })
          .send();
      }

      return responseHelper.body(cart).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;
