const express = require("express");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { permissionMiddleware } = require("../permission/permission.middleware");
const { ResponseHelper, RequestHelper, validator } = require("../../helpers");
const { ErrorMap, UserTypes, Operations, Modules } = require("../../constants");
const Storefront = require("./storefront.model");

const router = express.Router();

router.post(
  "/create-one",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.CREATE,
    Modules: Modules.Storefronts,
  }),
  validatorMiddleware({
    body: {
      name: [validator.required(), validator.string(), validator.minLength(2)],
      description: [validator.string()],
      createdBy: [validator.required(), validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const body = requestHelper.body();
      const storefront = await Storefront.create(body);
      return responseHelper.status(201).body(storefront).send();
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
    Modules: Modules.Storefronts,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const storefront = await Storefront.findById(id).populate("createdBy");
      if (!storefront) {
        return responseHelper
          .status(404)
          .error(ErrorMap.NOT_FOUND)
          .send();
      }
      return responseHelper.body(storefront).send();
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
    Modules: Modules.Storefronts,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Storefront.paginate(
        { deletedAt: null },
        requestHelper.getPaginationParams()
      );
      return responseHelper.body({ storefronts: data.data }).paginate(data.meta).send();
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
    Modules: Modules.Storefronts,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Storefront.dropdown(
        { deletedAt: null, select: "name" },
        requestHelper.getPaginationParams()
      );
      return responseHelper.body({ storefronts: data.data }).paginate(data.meta).send();
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
    Modules: Modules.Storefronts,
  }),
  validatorMiddleware({
    body: {
      name: [validator.string(), validator.minLength(2)],
      description: [validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const body = requestHelper.body();
      const storefront = await Storefront.findByIdAndUpdate(id, body, { new: true });
      if (!storefront) {
        return responseHelper
          .status(404)
          .error(ErrorMap.NOT_FOUND)
          .send();
      }
      return responseHelper.body(storefront).send();
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
    Modules: Modules.Storefronts,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const storefront = await Storefront.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        { new: true }
      );
      if (!storefront) {
        return responseHelper
          .status(404)
          .error(ErrorMap.NOT_FOUND)
          .send();
      }
      return responseHelper.body(storefront).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;