const express = require("express");
const router = express.Router();

// Import middlewares
const validatorMiddleware = require("../../../middleware/validatorMiddleware");

// Import models
const { User } = require("../../../models");

// Import helpers
const { ResponseHelper, RequestHelper, validator } = require("../../../helpers");

// Import constants
const { ErrorMap } = require("../../../constants");

// Get user notification settings
router.get("/read-one", async (req, res) => {
  const responseHelper = new ResponseHelper(res);
  try {
    const user = await User.findById(req.user._id).select("notificationSettings");
    if (!user) {
      return responseHelper
        .status(404)
        .error({ ...ErrorMap.NOT_FOUND, message: "User not found" })
        .send();
    }
    return responseHelper.status(200).body({ notificationSettings: user.notificationSettings || {} }).send();
  } catch (error) {
    return responseHelper.error(error).send();
  }
});

// Update user notification settings
router.put(
  "/update-one",
  validatorMiddleware({
    body: {
      emailNotifications: [validator.boolean()],
      inAppNotifications: [validator.boolean()],
      notificationFrequency: [validator.string()],
      pushNotifications: [validator.boolean()],
      emailDigest: [validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const updates = {
        notificationSettings: requestHelper.body()
      };

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true }
      ).select("notificationSettings");

      if (!user) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "User not found" })
          .send();
      }

      return responseHelper.status(200).body({ notificationSettings: user.notificationSettings }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;