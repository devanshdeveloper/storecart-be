const express = require("express");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { permissionMiddleware } = require("../permission/permission.middleware");
const { Discount } = require("./discount.model");
const { ResponseHelper, RequestHelper, validator } = require("../../helpers");
const { ErrorMap, UserTypes, Operations, Modules } = require("../../constants");

const router = express.Router();

router.post(
  "/create-one",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.CREATE,
    Modules: Modules.Discounts,
  }),
  validatorMiddleware({
    body: {
      name: [validator.required(), validator.string(), validator.minLength(2)],
      description: [validator.string()],
      percentage: [validator.required(), validator.number(), validator.min(0), validator.max(100)],
      validFrom: [validator.required(), validator.date()],
      validTo: [validator.required(), validator.date()],
      products: [validator.required(), validator.array()],
      storefront: [validator.required(), validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const body = requestHelper.body();
      const discount = await Discount.create(body);
      return responseHelper.status(201).body(discount).send();
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
    Modules: Modules.Discounts,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const discount = await Discount.findById(id).populate("products");
      if (!discount) {
        return responseHelper
          .status(404)
          .error(ErrorMap.NOT_FOUND)
          .send();
      }
      return responseHelper.body(discount).send();
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
    Modules: Modules.Discounts,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Discount.paginate(
        { deletedAt: null },
        requestHelper.getPaginationParams()
      );
      return responseHelper.body({ discounts: data.data }).paginate(data.meta).send();
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
    Modules: Modules.Discounts,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Discount.dropdown(
        { deletedAt: null, select: "name percentage" },
        requestHelper.getPaginationParams()
      );
      return responseHelper.body({ discounts: data.data }).paginate(data.meta).send();
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
    Modules: Modules.Discounts,
  }),
  validatorMiddleware({
    body: {
      name: [validator.string(), validator.minLength(2)],
      description: [validator.string()],
      percentage: [validator.number(), validator.min(0), validator.max(100)],
      validFrom: [validator.date()],
      validTo: [validator.date()],
      products: [validator.array()],
      storefront: [validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const body = requestHelper.body();
      const discount = await Discount.findByIdAndUpdate(id, body, { new: true });
      if (!discount) {
        return responseHelper
          .status(404)
          .error(ErrorMap.NOT_FOUND)
          .send();
      }
      return responseHelper.body(discount).send();
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
    Modules: Modules.Discounts,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const discount = await Discount.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        { new: true }
      );
      if (!discount) {
        return responseHelper
          .status(404)
          .error(ErrorMap.NOT_FOUND)
          .send();
      }
      return responseHelper.body(discount).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;