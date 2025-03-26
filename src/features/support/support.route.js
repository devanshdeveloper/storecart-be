const express = require("express");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { permissionMiddleware } = require("../permission/permission.middleware");
const { ResponseHelper, RequestHelper, validator } = require("../../helpers");
const { ErrorMap, UserTypes, Operations, Modules } = require("../../constants");
const { Support, SupportRequestTypes } = require("./support.model");

const router = express.Router();

router.post(
  "/create-one",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.CREATE,
    Modules: Modules.Support,
  }),
  validatorMiddleware({
    body: {
      name: [validator.required(), validator.string(), validator.minLength(2)],
      email: [validator.required(), validator.string(), validator.email()],
      subject: [validator.required(), validator.string()],
      requestType: [validator.required(), validator.string(), validator.enum(Object.values(SupportRequestTypes))],
      description: [validator.required(), validator.string()],
      attachments: [validator.array()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const body = requestHelper.body();
      const support = await Support.create(body);
      return responseHelper.status(201).body(support).send();
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
    Modules: Modules.Support,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const support = await Support.findById(id);
      if (!support) {
        return responseHelper
          .status(404)
          .error(ErrorMap.NOT_FOUND)
          .send();
      }
      return responseHelper.body(support).send();
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
    Modules: Modules.Support,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Support.paginate(
        { deletedAt: null },
        requestHelper.getPaginationParams()
      );
      return responseHelper.body({ supports: data.data }).paginate(data.meta).send();
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
    Modules: Modules.Support,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Support.dropdown(
        { deletedAt: null, select: "subject requestType" },
        requestHelper.getPaginationParams()
      );
      return responseHelper.body({ supports: data.data }).paginate(data.meta).send();
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
    Modules: Modules.Support,
  }),
  validatorMiddleware({
    body: {
      name: [validator.string(), validator.minLength(2)],
      email: [validator.string(), validator.email()],
      subject: [validator.string()],
      requestType: [validator.string(), validator.enum(Object.values(SupportRequestTypes))],
      description: [validator.string()],
      attachments: [validator.array()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const body = requestHelper.body();
      const support = await Support.findByIdAndUpdate(id, body, { new: true });
      if (!support) {
        return responseHelper
          .status(404)
          .error(ErrorMap.NOT_FOUND)
          .send();
      }
      return responseHelper.body(support).send();
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
    Modules: Modules.Support,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const support = await Support.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        { new: true }
      );
      if (!support) {
        return responseHelper
          .status(404)
          .error(ErrorMap.NOT_FOUND)
          .send();
      }
      return responseHelper.body(support).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;