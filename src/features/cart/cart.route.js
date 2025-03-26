const express = require("express");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { permissionMiddleware } = require("../permission/permission.middleware");
const Cart = require("./cart.model");
const { ResponseHelper, RequestHelper, validator } = require("../../helpers");
const { ErrorMap, UserTypes, Operations, Modules } = require("../../constants");

const router = express.Router();

// Create cart
router.post(
  "/create-one",
  permissionMiddleware({
    UserTypes: [UserTypes.Customer],
    Operations: Operations.CREATE,
    Modules: Modules.Cart,
  }),
  validatorMiddleware({
    body: {
      products: [
        validator.required(),
        validator.array({
          product: [validator.required(), validator.mongoId()],
          quantity: [validator.required(), validator.number(), validator.min(1)],
          price: [validator.required(), validator.number(), validator.min(0)],
        }),
      ],
      totalAmount: [validator.required(), validator.number(), validator.min(0)],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const body = requestHelper.body();
      body.user = req.user._id;

      const cart = await Cart.create(body);
      return responseHelper.status(201).body(cart).send();
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
      const cart = await Cart.findOne({
        _id: requestHelper.params("id"),
        user: req.user._id,
        deletedAt: null,
      }).populate("products.product");

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
      return responseHelper.body({ carts: data.data }).paginate(data.meta).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Update cart
router.put(
  "/update-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.Customer],
    Operations: Operations.UPDATE,
    Modules: Modules.Cart,
  }),
  validatorMiddleware({
    body: {
      products: [
        validator.required(),
        validator.array({
          product: [validator.required(), validator.mongoId()],
          quantity: [validator.required(), validator.number(), validator.min(1)],
          price: [validator.required(), validator.number(), validator.min(0)],
        }),
      ],
      totalAmount: [validator.required(), validator.number(), validator.min(0)],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const body = requestHelper.body();
      const cart = await Cart.findOneAndUpdate(
        { _id: requestHelper.params("id"), user: req.user._id, deletedAt: null },
        body,
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
        { _id: requestHelper.params("id"), user: req.user._id, deletedAt: null },
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

module.exports = router;