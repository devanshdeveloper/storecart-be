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

function makeFilter(req) {
  const { status, search, start, end } = req.query;
  const searchFields = ["name", "description"];
  const filter = {};

  if (status) {
    filter.status = status;
  }

  // Date range filter
  if (start || end) {
    filter.createdAt = {};
    if (start) filter.createdAt.$gte = new Date(start);
    if (end) filter.createdAt.$lte = new Date(end);
  }

  // Search filter
  if (search && searchFields) {
    filter.$or = searchFields.map(field => ({
      [field]: { $regex: search, $options: "i" }
    }));
  }

  return filter;
}

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

router.get(
  "/schema",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.READ,
    Modules: Modules.Product,
  }),
  async (req, res) => {
    const responseHelper = new ResponseHelper(res);
    try {
      return responseHelper.body({ schema: Product.schema() }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

router.delete(
  "/delete-many",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.DELETE,
    Modules: Modules.Product,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const { ids } = requestHelper.body();
      let filter = {};

      if (ids && Array.isArray(ids) && ids.length !== 0) {
        filter._id = { $in: ids };
      } else {
        filter = makeFilter(req);
      }

      // Find products to delete for image cleanup
      const products = await Product.find(filter);
      
      // Clean up images
      await Promise.all(
        products.flatMap(product => 
          product.images?.map(image => FileSystemHelper.removeImage(image)) || []
        )
      );

      const result = await Product.deleteMany(filter);

      if (result.deletedCount === 0) {
        return responseHelper
          .status(404)
          .error({
            ...ErrorMap.NOT_FOUND,
            message: "No items found"
          })
          .send();
      }

      return responseHelper
        .status(200)
        .message(`Successfully deleted ${result.deletedCount} items`)
        .send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

router.post(
  "/export",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.READ,
    Modules: Modules.Product,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const { ids } = requestHelper.body();
      let filter = {};

      if (ids && Array.isArray(ids) && ids.length !== 0) {
        filter._id = { $in: ids };
      } else {
        filter = makeFilter(req);
      }

      const items = await Product.find(filter).populate("category");
      return responseHelper.status(200).body({ items }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;
