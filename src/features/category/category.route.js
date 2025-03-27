const express = require("express");
const router = express.Router();
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { permissionMiddleware } = require("../permission/permission.middleware");
const {
  ResponseHelper,
  RequestHelper,
  validator,
  FileUploadHelper,
  idValidatorMiddleware,
  FileSystemHelper,
} = require("../../helpers");
const { ErrorMap, UserTypes, Operations, Modules } = require("../../constants");
const { Category } = require("../../models");


const upload = new FileUploadHelper().configureImageUpload({
  destination: (req, file) => {
    return `uploads/${req.user._id}/category/`;
  },
});

router.post(
  "/create-one",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.CREATE,
    Modules: Modules.Category,
  }),
  upload.single("image"),
  validatorMiddleware({
    body: {
      name: [validator.required(), validator.string(), validator.minLength(2)],
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
        image: requestHelper.getFilePath(),
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
    Modules: Modules.Category,
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
      return responseHelper.body(category.toJSON()).send();
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
    Modules: Modules.Category,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Category.paginate(
        { deletedAt: null, user: req.user._id },
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
    Modules: Modules.Category,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Category.dropdown(
        { deletedAt: null, user: req.user._id },
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
    Modules: Modules.Category,
  }),
  upload.single("image"),
  idValidatorMiddleware(),
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
      const imagePath = requestHelper.getFilePath();
      // delete old image if new image is uploaded
      const updates = { ...body, user: req.user._id };
      if (imagePath) {
        updates.image = imagePath;
      }
      const category = await Category.findByIdAndUpdate(
        id,
        { ...body, user: req.user._id, image: requestHelper.getFilePath() },
        { new: false }
      );
      if (imagePath) {
        await FileSystemHelper.removeImage(category.image);
      }
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
    Modules: Modules.Category,
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
      if (category.image) {
        await FileSystemHelper.removeImage(category.image);
      }
      return responseHelper.body(category).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;
