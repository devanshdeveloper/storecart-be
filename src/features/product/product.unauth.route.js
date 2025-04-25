const express = require("express");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { ResponseHelper, RequestHelper, validator } = require("../../helpers");
const { Product } = require("../../models");
const { permissionMiddleware } = require("../permission/permission.middleware");
const { Modules, Operations, UserTypes } = require("../../constants");

const router = express.Router();

function makeFilter(req) {
  const { status, search, start, end } = req.query;
  const searchFields = ["name", "description", "category"];
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
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    }));
  }

  return filter;
}

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
      const filter = makeFilter(req);
      const data = await Product.paginate(filter, {
        ...requestHelper.getPaginationParams(),
        populate: "category",
      });
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
  "/featured",
  // validatorMiddleware(),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Product.paginate(
        makeFilter(req),
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
  "/read-one/:id",
  validatorMiddleware({
    params: {
      id: [validator.required(), validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const product = await Product.findById(requestHelper.params("id"))
        .populate("category")
        .where("deletedAt")
        .equals(null);

      if (!product) {
        return responseHelper.status(404).error("Product not found").send();
      }

      return responseHelper.body({ product }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;

// product.unauth.route.js
