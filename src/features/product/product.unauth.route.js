const express = require("express");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { ResponseHelper, RequestHelper, validator } = require("../../helpers");
const { Product } = require("../../models");

const router = express.Router();

router.get(
  "/paginate",
  // validatorMiddleware(),
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
  "/featured",
  // validatorMiddleware(),
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
