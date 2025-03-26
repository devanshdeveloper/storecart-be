const express = require("express");
const router = express.Router();

// Import middlewares
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { permissionMiddleware } = require("../permission/permission.middleware");

// Import models
const { Role } = require("../../models");

// Import helpers
const { ResponseHelper, RequestHelper, validator } = require("../../helpers");

// Import constants
const { ErrorMap, Operations, Modules, UserTypes } = require("../../constants");

// Create a new role
router.post(
  "/create-one",
  permissionMiddleware({
    UserTypes: [UserTypes.SuperAdmin],
    Operations: Operations.CREATE,
    Modules: Modules.Roles,
  }),
  validatorMiddleware({
    body: {
      name: [
        validator.required(),
        validator.string(),
        validator.minLength(2),
        validator.maxLength(50),
      ],
      description: [validator.string(), validator.maxLength(200)],
      permissions: [validator.required(), validator.string()],
      user: [validator.required(), validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const roleData = requestHelper.body();
      
      // Check if role with name already exists
      const existingRole = await Role.findOne({ name: roleData.name });
      if (existingRole) {
        return responseHelper
          .status(400)
          .error({
            ...ErrorMap.DUPLICATE_ENTRY,
            message: "Role name already exists",
          })
          .send();
      }

      // Add user if not provided
      if (!roleData.user) {
        roleData.user = req.user._id;
      }

      const role = await Role.create(roleData);

      return responseHelper.status(201).body({ role }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Get role by ID
router.get(
  "/read-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.SuperAdmin],
    Operations: Operations.READ,
    Modules: Modules.Roles,
  }),
  validatorMiddleware({
    params: {
      id: [validator.required(), validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const role = await Role.findById(requestHelper.params("id"));
      if (!role) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "Role not found" })
          .send();
      }
      return responseHelper.status(200).body({ role }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Get paginated roles
router.get(
  "/paginate",
  permissionMiddleware({
    UserTypes: [UserTypes.SuperAdmin],
    Operations: Operations.READ,
    Modules: Modules.Roles,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const data = await Role.paginate(
        { sort: { name: 1 } },
        requestHelper.getPaginationParams()
      );
      return responseHelper.body({ roles: data.data }).paginate(data.meta).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Get roles dropdown
router.get(
  "/dropdown",
  permissionMiddleware({
    UserTypes: [UserTypes.SuperAdmin],
    Operations: Operations.READ,
    Modules: Modules.Roles,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const data = await Role.dropdown(
        { sort: { name: 1 }, select: "name" },
        requestHelper.getPaginationParams()
      );
      return responseHelper.body({ roles: data.data }).paginate(data.meta).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Update role
router.put(
  "/update-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.SuperAdmin],
    Operations: Operations.UPDATE,
    Modules: Modules.Roles,
  }),
  validatorMiddleware({
    params: {
      id: [validator.required(), validator.string()],
    },
    body: {
      name: [
        validator.string(),
        validator.minLength(2),
        validator.maxLength(50),
      ],
      description: [validator.string(), validator.maxLength(200)],
      permissions: [validator.string()],
      user: [validator.string()],
      isActive: [validator.boolean()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const updates = requestHelper.body();
      const roleId = requestHelper.params("id");

      // Check if name is being updated and if it already exists
      if (updates.name) {
        const existingRole = await Role.findOne({
          name: updates.name,
          _id: { $ne: roleId },
        });
        if (existingRole) {
          return responseHelper
            .status(400)
            .error({
              ...ErrorMap.DUPLICATE_ENTRY,
              message: "Role name already exists",
            })
            .send();
        }
      }

      // Add updated by
      updates.updatedBy = req.user._id;

      const role = await Role.findByIdAndUpdate(
        roleId,
        { $set: updates },
        { new: true }
      );

      if (!role) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "Role not found" })
          .send();
      }

      return responseHelper.status(200).body({ role }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Delete role
router.delete(
  "/delete-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.SuperAdmin],
    Operations: Operations.DELETE,
    Modules: Modules.Roles,
  }),
  validatorMiddleware({
    params: {
      id: [validator.required(), validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const role = await Role.findByIdAndDelete(requestHelper.params("id"));
      if (!role) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "Role not found" })
          .send();
      }
      return responseHelper
        .status(200)
        .body({ message: "Role deleted successfully" })
        .send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;