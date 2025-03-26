const express = require("express");
const router = express.Router();

// Import middlewares
const validatorMiddleware = require("../../middleware/validatorMiddleware");

// Import models
const { Notification } = require("../../models");

// Import helpers
const {
  ResponseHelper,
  RequestHelper,
  validator,
  idValidatorMiddleware,
} = require("../../helpers");

// Import constants
const { ErrorMap } = require("../../constants");

// Create a notification
router.post(
  "/create-one",
  validatorMiddleware({
    body: {
      title: [validator.required(), validator.string()],
      description: [validator.required(), validator.string()],
      redirect: [validator.string()],
      icon: [validator.string()],
      avatar: [validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const notification = new Notification({
        ...requestHelper.body(),
        user: req.user._id,
      });
      await notification.save();
      return responseHelper.status(201).body({ notification }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Get user notifications with pagination
router.get("/paginate", async (req, res) => {
  const requestHelper = new RequestHelper(req);
  const responseHelper = new ResponseHelper(res);
  try {
    const data = await Notification.paginate(
      { user: req.user._id },
      requestHelper.getPaginationParams()
    );
    return responseHelper
      .body({ notifications: data.data })
      .paginate(data.meta)
      .send();
  } catch (error) {
    return responseHelper.error(error).send();
  }
});

// Mark notification as read
router.put("/mark-as-read/:id", idValidatorMiddleware(), async (req, res) => {
  const requestHelper = new RequestHelper(req);
  const responseHelper = new ResponseHelper(res);
  try {

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) {
      return responseHelper
        .status(404)
        .error({ ...ErrorMap.NOT_FOUND, message: "Notification not found" })
        .send();
    }
    return responseHelper.body({ notification }).send();
  } catch (error) {
    return responseHelper.error(error).send();
  }
});

// Mark all notifications as read
router.put("/mark-all-as-read", async (req, res) => {
  const responseHelper = new ResponseHelper(res);
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );
    return responseHelper.status(200).send();
  } catch (error) {
    return responseHelper.error(error).send();
  }
});

// Delete a notification
router.delete("/delete-one/:id", async (req, res) => {
  const responseHelper = new ResponseHelper(res);
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!notification) {
      return responseHelper
        .status(404)
        .error({ ...ErrorMap.NOT_FOUND, message: "Notification not found" })
        .send();
    }
    return responseHelper.status(204).send();
  } catch (error) {
    return responseHelper.error(error).send();
  }
});

module.exports = router;
