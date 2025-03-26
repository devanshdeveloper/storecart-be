const express = require("express");
const router = express.Router();
const { Plan } = require("../../models");
const { ResponseHelper, RequestHelper } = require("../../helpers");
const ErrorMap = require("../../constants/ErrorMap");

// Paginate plans
router.get("/paginate", async (req, res) => {
  const requestHelper = new RequestHelper(req);
  const responseHelper = new ResponseHelper(res);
  try {
    const data = await Plan.paginate(
      { sort: { price: 1 } },
      requestHelper.getPaginationParams(),
    );
    return responseHelper.body({ plans: data.data }).paginate(data.meta).send();
  } catch (error) {
    return responseHelper.error(error).send();
  }
});

router.get("/dropdown", async (req, res) => {
  const requestHelper = new RequestHelper(req);
  const responseHelper = new ResponseHelper(res);
  try {
    const data = await Plan.dropdown(
      { sort: { price: 1 } },
      requestHelper.getPaginationParams(),
    );
    return responseHelper.body({ plans: data.data }).paginate(data.meta).send();
  } catch (error) {
    return responseHelper.error(error).send();
  }
});

// Read one plan
router.get("/read-one/:id", async (req, res) => {
  const requestHelper = new RequestHelper(req);
  const responseHelper = new ResponseHelper(res);
  try {
    const plan = await Plan.findById(requestHelper.params("id"));
    if (!plan) {
      return responseHelper.error(ErrorMap.NOT_FOUND).send();
    }
    return responseHelper.body({ plan }).send();
  } catch (error) {
    return responseHelper.error(error).send();
  }
});

module.exports = router;
