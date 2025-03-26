// import express
const express = require("express");

// import middlewares
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { permissionMiddleware } = require("../permission/permission.middleware");

// import models
const { User } = require("../../models");

// import helpers
const { ResponseHelper, RequestHelper, validator } = require("../../helpers");

// import constants
const { ErrorMap, UserTypes } = require("../../constants");

const router = express.Router();

// Create a new user
router.post(
  "/create-one",
  permissionMiddleware({ UserTypes: [UserTypes.SuperAdmin] }),
  validatorMiddleware({
    body: {
      name: [
        validator.required(),
        validator.string(),
        validator.minLength(2),
        validator.maxLength(50),
      ],
      email: [validator.required(), validator.string(), validator.email()],
      password: [
        validator.required(),
        validator.string(),
        validator.minLength(8),
      ],
      type: [validator.required(), validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const userData = requestHelper.body();

      // Check if user with email already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        return responseHelper
          .status(400)
          .error({
            ...ErrorMap.DUPLICATE_ENTRY,
            message: "Email already exists",
          })
          .send();
      }

      const user = await User.create(userData);

      return responseHelper
        .status(201)
        .body({
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        })
        .send();
    } catch (error) {
      responseHelper.error(error).send();
    }
  }
);

// Get user by ID
router.get(
  "/read-one/:id",
  permissionMiddleware({ UserTypes: [UserTypes.SuperAdmin] }),
  async (req, res) => {
    const responseHelper = new ResponseHelper(res);
    try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "User not found" })
          .send();
      }
      return responseHelper.status(200).body({ user }).send();
    } catch (error) {
      responseHelper.error(error).send();
    }
  }
);

// Get all users with pagination
router.get(
  "/paginate",
  permissionMiddleware({ UserTypes: [UserTypes.SuperAdmin] }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const page = parseInt(requestHelper.query("page", 1));
      const limit = parseInt(requestHelper.query("limit", 10));
      const skip = (page - 1) * limit;

      const users = await User.find({})
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments({});

      return responseHelper
        .status(200)
        .body({
          users,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        })
        .send();
    } catch (error) {
      responseHelper.error(error).send();
    }
  }
);

// Update user
router.put(
  "/update-one/:id",
  permissionMiddleware([UserTypes.SuperAdmin]),
  validatorMiddleware({
    body: {
      name: [
        validator.string(),
        validator.minLength(2),
        validator.maxLength(50),
      ],
      email: [validator.string(), validator.email()],
      role: [validator.string()],
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
          _id: { $ne: req.params.id },
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
        req.params.id,
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
      responseHelper.error(error).send();
    }
  }
);

// Delete user
router.delete(
  "/delete-one/:id",
  async (req, res) => {
    const responseHelper = new ResponseHelper(res);
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "User not found" })
          .send();
      }

      // Prevent deletion of super admin
      if (user.role === UserTypes.SuperAdmin) {
        return responseHelper
          .status(403)
          .error({
            ...ErrorMap.FORBIDDEN,
            message: "Cannot delete super admin user",
          })
          .send();
      }

      await User.findByIdAndDelete(req.params.id);

      return responseHelper
        .status(200)
        .body({ message: "User deleted successfully" })
        .send();
    } catch (error) {
      responseHelper.error(error).send();
    }
  }
);

module.exports = router;
