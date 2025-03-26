const express = require("express");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { permissionMiddleware } = require("../permission/permission.middleware");
const { ResponseHelper, RequestHelper, validator } = require("../../helpers");
const { ErrorMap, UserTypes, Operations, Modules } = require("../../constants");
const Order = require("./order.model");

const router = express.Router();

router.post(
  "/create-one",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.CREATE,
    Modules: Modules.Orders,
  }),
  validatorMiddleware({
    body: {
      customer: [validator.required(), validator.string()],
      storefront: [validator.required(), validator.string()],
      products: [validator.required(), validator.array()],
      amount: [validator.required(), validator.number()],
      address: [validator.required(), validator.string()],
      paymentMethod: [validator.required(), validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const body = requestHelper.body();
      const order = await Order.create(body);
      return responseHelper.status(201).body(order).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

router.get(
  "/read-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.READ,
    Modules: Modules.Orders,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const order = await Order.findById(id)
        .populate("customer")
        .populate("storefront")
        .populate("products.product")
        .populate("address");
      return responseHelper.body(order).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

router.get(
  "/paginate",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.READ,
    Modules: Modules.Orders,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Order.paginate(
        { filter: {} },
        requestHelper.getPaginationParams()
      );
      return responseHelper.body({ orders: data.data }).paginate(data.meta).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

router.get(
  "/dropdown",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.READ,
    Modules: Modules.Orders,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Order.dropdown(
        { select: "_id status amount" },
        requestHelper.getPaginationParams()
      );
      return responseHelper.body({ orders: data.data }).paginate(data.meta).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

router.put(
  "/update-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.UPDATE,
    Modules: Modules.Orders,
  }),
  validatorMiddleware({
    body: {
      status: [validator.string()],
      paymentStatus: [validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const body = requestHelper.body();
      const order = await Order.findByIdAndUpdate(id, body, { new: true });
      return responseHelper.body(order).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

router.delete(
  "/delete-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.DELETE,
    Modules: Modules.Orders,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      await Order.findByIdAndUpdate(id, { deletedAt: new Date() });
      return responseHelper.status(204).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;