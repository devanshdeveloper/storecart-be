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

// Get user profile
router.get("/read-one", async (req, res) => {
  const responseHelper = new ResponseHelper(res);
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return responseHelper
        .status(404)
        .error({ ...ErrorMap.NOT_FOUND, message: "User not found" })
        .send();
    }
    return responseHelper.status(200).body({ user }).send();
  } catch (error) {
    return responseHelper.error(error).send();
  }
});

// Update user profile
router.put(
  "/update-one",
  validatorMiddleware({
    body: {
      name: [
        validator.string(),
        validator.minLength(2),
        validator.maxLength(50),
      ],
      email: [validator.string(), validator.email()],
      phone: [validator.string()],
      address: [validator.string(), validator.minLength(10)],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const updates = requestHelper.body();

      // Check if email is being updated and if it already exists
      if (updates.email) {
        const existingUser = await User.findOne({
          email: updates.email,
          _id: { $ne: req.user._id },
        });
        if (existingUser) {
          return responseHelper
            .status(400)
            .error({
              ...ErrorMap.DUPLICATE_ENTRY,
              message: "Email already exists",
            })
            .send();
        }
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true }
      ).select("-password");

      if (!user) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "User not found" })
          .send();
      }

      return responseHelper.status(200).body({ user }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;