const express = require("express");
const router = express.Router();
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { permissionMiddleware } = require("../permission/permission.middleware");
const { ResponseHelper, RequestHelper, validator, FileUploadHelper } = require("../../helpers");
const { ErrorMap, UserTypes, Operations, Modules } = require("../../constants");
const { Category } = require("../../models");
const upload = new FileUploadHelper().configureImageUpload();


router.post(
  "/create-one",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.CREATE,
    Modules: Modules.Category,
  }),
  validatorMiddleware({
    body: {
      name: [validator.required(), validator.string(), validator.minLength(2)],
      image: [validator.required()],
      description: [validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const body = requestHelper.body();
      const category = await Category.create({
        ...body,
        user: req.user._id,
      });
      return responseHelper.status(201).body(category).send();
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
    Modules: Modules.Categories,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const category = await Category.findById(id);
      if (!category) {
        return responseHelper.status(404).error(ErrorMap.NOT_FOUND).send();
      }
      return responseHelper.body(category).send();
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
    Modules: Modules.Categories,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Category.paginate(
        { deletedAt: null },
        requestHelper.getPaginationParams()
      );
      return responseHelper
        .body({ categories: data.data })
        .paginate(data.meta)
        .send();
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
    Modules: Modules.Categories,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Category.dropdown(
        { deletedAt: null, select: "name" },
        requestHelper.getPaginationParams()
      );
      return responseHelper
        .body({ categories: data.data })
        .paginate(data.meta)
        .send();
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
    Modules: Modules.Categories,
  }),
  validatorMiddleware({
    body: {
      name: [validator.string(), validator.minLength(2)],
      image: [validator.string()],
      description: [validator.string()],
      storefront: [validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const body = requestHelper.body();
      const category = await Category.findByIdAndUpdate(id, body, {
        new: true,
      });
      if (!category) {
        return responseHelper.status(404).error(ErrorMap.NOT_FOUND).send();
      }
      return responseHelper.body(category).send();
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
    Modules: Modules.Categories,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const category = await Category.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        { new: true }
      );
      if (!category) {
        return responseHelper.status(404).error(ErrorMap.NOT_FOUND).send();
      }
      return responseHelper.body(category).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;
