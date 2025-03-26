const express = require("express");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { permissionMiddleware } = require("../permission/permission.middleware");
const { Variant } = require("../../models");
const { ResponseHelper, RequestHelper, validator } = require("../../helpers");
const { ErrorMap, UserTypes, Operations, Modules } = require("../../constants");

const router = express.Router();

// Create variant
router.post(
  "/create-one",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.CREATE,
    Modules: Modules.Products,
  }),
  validatorMiddleware({
    body: {
      product: [validator.required(), validator.string()],
      type: [validator.required(), validator.string()],
      value: [validator.required(), validator.string()],
      price: [validator.required(), validator.number(), validator.min(0)],
      stock: [validator.required(), validator.number(), validator.min(0)],
      sku: [validator.optional(), validator.string()],
      storefront: [validator.required(), validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const body = requestHelper.body();
      const variant = await Variant.create(body);
      return responseHelper.status(201).body(variant).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Read one variant
router.get(
  "/read-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.READ,
    Modules: Modules.Products,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const variant = await Variant.findById(id).populate("product storefront");
      if (!variant) {
        return responseHelper
          .status(404)
          .error(ErrorMap.NOT_FOUND)
          .send();
      }
      return responseHelper.body(variant).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Paginate variants
router.get(
  "/paginate",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.READ,
    Modules: Modules.Products,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Variant.paginate(
        { deletedAt: null },
        requestHelper.getPaginationParams()
      );
      return responseHelper.body({ variants: data.data }).paginate(data.meta).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Update variant
router.put(
  "/update-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.UPDATE,
    Modules: Modules.Products,
  }),
  validatorMiddleware({
    body: {
      type: [validator.optional(), validator.string()],
      value: [validator.optional(), validator.string()],
      price: [validator.optional(), validator.number(), validator.min(0)],
      stock: [validator.optional(), validator.number(), validator.min(0)],
      sku: [validator.optional(), validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const body = requestHelper.body();
      const variant = await Variant.findByIdAndUpdate(id, body, { new: true });
      if (!variant) {
        return responseHelper
          .status(404)
          .error(ErrorMap.NOT_FOUND)
          .send();
      }
      return responseHelper.body(variant).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Delete variant (soft delete)
router.delete(
  "/delete-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.DELETE,
    Modules: Modules.Products,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const variant = await Variant.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        { new: true }
      );
      if (!variant) {
        return responseHelper
          .status(404)
          .error(ErrorMap.NOT_FOUND)
          .send();
      }
      return responseHelper.body(variant).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;