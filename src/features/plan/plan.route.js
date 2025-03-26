const express = require("express");
const router = express.Router();
const { Plan } = require("../../models");
const { ResponseHelper, RequestHelper } = require("../../helpers");
const ErrorMap = require("../../constants/ErrorMap");

// Create one plan
router.post("/create-one", async (req, res) => {
  const requestHelper = new RequestHelper(req);
  const responseHelper = new ResponseHelper(res);
  try {
    const plan = new Plan(requestHelper.body());
    await plan.save();
    return responseHelper.status(201).body({ plan }).send();
  } catch (error) {
    return responseHelper.error(error).send();
  }
});



// Update one plan
router.put("/update-one/:id", async (req, res) => {
  const requestHelper = new RequestHelper(req);
  const responseHelper = new ResponseHelper(res);
  try {
    const plan = await Plan.findByIdAndUpdate(
      requestHelper.params("id"),
      { $set: requestHelper.body() },
      { new: true, runValidators: true }
    );
    if (!plan) {
      return responseHelper.error(ErrorMap.NOT_FOUND).send();
    }
    return responseHelper.body({ plan }).send();
  } catch (error) {
    return responseHelper.error(error).send();
  }
});

// Delete one plan
router.delete("/delete-one/:id", async (req, res) => {
  const requestHelper = new RequestHelper(req);
  const responseHelper = new ResponseHelper(res);
  try {
    const plan = await Plan.findByIdAndDelete(requestHelper.params("id"));
    if (!plan) {
      return responseHelper.error(ErrorMap.NOT_FOUND).send();
    }
    return responseHelper.body({ plan }).send();
  } catch (error) {
    return responseHelper.error(error).send();
  }
});

module.exports = router;
