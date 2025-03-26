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

// Get user email settings
router.get("/read-one", async (req, res) => {
  const responseHelper = new ResponseHelper(res);
  try {
    const user = await User.findById(req.user._id).select("emailSettings");
    if (!user) {
      return responseHelper
        .status(404)
        .error({ ...ErrorMap.NOT_FOUND, message: "User not found" })
        .send();
    }
    return responseHelper.status(200).body({ emailSettings: user.emailSettings || {} }).send();
  } catch (error) {
    return responseHelper.error(error).send();
  }
});

// Update user email settings
router.put(
  "/update-one",
  validatorMiddleware({
    body: {
      emailNotifications: [validator.boolean()],
      emailFrequency: [validator.string()],
      emailDigest: [validator.string()],
      subscribeToNewsletter: [validator.boolean()],
      marketingEmails: [validator.boolean()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const updates = {
        emailSettings: requestHelper.body()
      };

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true }
      ).select("emailSettings");

      if (!user) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "User not found" })
          .send();
      }

      return responseHelper.status(200).body({ emailSettings: user.emailSettings }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;