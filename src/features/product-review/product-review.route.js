const express = require("express");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { permissionMiddleware } = require("../permission/permission.middleware");
const { ResponseHelper, RequestHelper, validator } = require("../../helpers");
const { ErrorMap, UserTypes, Operations, Modules } = require("../../constants");
const ProductReview = require("./product-review.model");

const router = express.Router();

router.post(
  "/create-one",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.CREATE,
    Modules: Modules.ProductReviews,
  }),
  validatorMiddleware({
    body: {
      product: [validator.required(), validator.string()],
      user: [validator.required(), validator.string()],
      rating: [validator.required(), validator.number(), validator.min(1), validator.max(5)],
      comment: [validator.required(), validator.string()],
      storefront: [validator.required(), validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const body = requestHelper.body();
      const review = await ProductReview.create(body);
      return responseHelper.status(201).body(review).send();
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
    Modules: Modules.ProductReviews,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const review = await ProductReview.findById(id)
        .populate("product")
        .populate("user")
        .populate("storefront");
      return responseHelper.body(review).send();
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
    Modules: Modules.ProductReviews,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await ProductReview.paginate(
        { deletedAt: null },
        requestHelper.getPaginationParams()
      );
      return responseHelper.body({ reviews: data.data }).paginate(data.meta).send();
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
    Modules: Modules.ProductReviews,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await ProductReview.dropdown(
        { deletedAt: null, select: "rating comment" },
        requestHelper.getPaginationParams()
      );
      return responseHelper.body({ reviews: data.data }).paginate(data.meta).send();
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
    Modules: Modules.ProductReviews,
  }),
  validatorMiddleware({
    body: {
      rating: [validator.number(), validator.min(1), validator.max(5)],
      comment: [validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      const body = requestHelper.body();
      const review = await ProductReview.findByIdAndUpdate(id, body, { new: true });
      return responseHelper.body(review).send();
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
    Modules: Modules.ProductReviews,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const id = requestHelper.params("id");
      await ProductReview.findByIdAndUpdate(id, { deletedAt: new Date() });
      return responseHelper.status(204).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;