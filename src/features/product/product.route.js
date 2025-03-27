const express = require("express");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { permissionMiddleware } = require("../permission/permission.middleware");
const {
  ResponseHelper,
  RequestHelper,
  validator,
  FileUploadHelper,
  FileSystemHelper,
} = require("../../helpers");
const { ErrorMap, UserTypes, Operations, Modules } = require("../../constants");
const { Product } = require("../../models");

const upload = new FileUploadHelper().configureImageUpload({
  destination: (req, file) => {
    return `uploads/${req.user._id}/product/`;
  },
});

const router = express.Router();

router.post(
  "/create-one",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.CREATE,
    Modules: Modules.Product,
  }),
  upload.array("images"),
  validatorMiddleware({
    body: {
      name: [validator.required(), validator.string()],
      description: [validator.required(), validator.string()],
      price: [validator.required()],
      category: [validator.required(), validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const body = requestHelper.body();
      const imagePaths = requestHelper.getFilePaths();
      const product = await Product.create({
        ...body,
        images: imagePaths,
        user: req.user._id,
      });
      return responseHelper.status(201).body(product).send();
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
    Modules: Modules.Product,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const product = await Product.findById(id).populate("category");
      return responseHelper.body(product).send();
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
    Modules: Modules.Product,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Product.paginate(
        {},
        requestHelper.getPaginationParams()
      );
      return responseHelper
        .body({ products: data.data })
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
    Modules: Modules.Product,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Product.dropdown(
        {},
        { ...requestHelper.getPaginationParams(), select: "_id name price" }
      );
      return responseHelper
        .body({ products: data.data })
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
    Modules: Modules.Product,
  }),
  upload.array("images"),
  validatorMiddleware({
    body: {
      name: [validator.string()],
      description: [validator.string()],
      price: [validator.number()],
      category: [validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const body = requestHelper.body();
      const imagePaths = requestHelper.getFilePaths();

      const oldProduct = await Product.findById(id);
      if (!oldProduct) {
        return responseHelper.status(404).error(ErrorMap.NOT_FOUND).send();
      }

      const updates = { ...body };
      if (imagePaths && imagePaths.length > 0) {
        updates.images = imagePaths;
        // Clean up old images
        if (oldProduct.images && oldProduct.images.length > 0) {
          await Promise.all(
            oldProduct.images.map((image) =>
              FileSystemHelper.removeImage(image)
            )
          );
        }
      }

      const product = await Product.findByIdAndUpdate(id, updates, {
        new: true,
      });
      return responseHelper.body(product).send();
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
    Modules: Modules.Product,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const product = await Product.findById(id);
      if (!product) {
        return responseHelper.status(404).error(ErrorMap.NOT_FOUND).send();
      }

      // Clean up images before marking as deleted
      if (product.images && product.images.length > 0) {
        await Promise.all(
          product.images.map((image) => FileSystemHelper.removeImage(image))
        );
      }

      await Product.findByIdAndUpdate(id, { deletedAt: new Date() });
      return responseHelper.status(204).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;
