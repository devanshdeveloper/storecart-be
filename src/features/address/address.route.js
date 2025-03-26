const express = require("express");
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { permissionMiddleware } = require("../permission/permission.middleware");
const { User } = require("../../models");
const Address = require("./address.model");
const { ResponseHelper, RequestHelper, validator } = require("../../helpers");
const { ErrorMap, UserTypes, Operations, Modules } = require("../../constants");

const router = express.Router();

// Create address
router.post(
  "/create-one",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin, UserTypes.User],
    Operations: Operations.CREATE,
    Modules: Modules.Address,
  }),
  validatorMiddleware({
    body: {
      streetAddress: [validator.required(), validator.string(), validator.minLength(5), validator.maxLength(100)],
      apartment: [validator.string(), validator.maxLength(20)],
      city: [validator.required(), validator.string(), validator.minLength(2), validator.maxLength(50)],
      state: [validator.required(), validator.string(), validator.minLength(2), validator.maxLength(50)],
      postalCode: [validator.required(), validator.string(), validator.matches(/^[0-9]{5}(-[0-9]{4})?$/)],
      country: [validator.required(), validator.string(), validator.minLength(2), validator.maxLength(50)],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const body = requestHelper.body();
      body.user = req.user._id;

      const address = await Address.create(body);
      return responseHelper.status(201).body(address).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Read one address
router.get(
  "/read-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin, UserTypes.User],
    Operations: Operations.READ,
    Modules: Modules.Address,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const address = await Address.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!address) {
        return responseHelper
          .status(404)
          .error({
            ...ErrorMap.NOT_FOUND,
            message: "Address not found",
          })
          .send();
      }

      return responseHelper.body(address).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Paginate addresses
router.get(
  "/paginate",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin, UserTypes.User],
    Operations: Operations.READ,
    Modules: Modules.Address,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Address.paginate(
        { user: req.user._id },
        requestHelper.getPaginationParams()
      );

      return responseHelper.body({ addresses: data.data }).paginate(data.meta).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Dropdown
router.get(
  "/dropdown",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin, UserTypes.User],
    Operations: Operations.READ,
    Modules: Modules.Address,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const data = await Address.dropdown(
        { user: req.user._id },
        requestHelper.getPaginationParams()
      );

      return responseHelper.body({ addresses: data.data }).paginate(data.meta).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Update address
router.put(
  "/update-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin, UserTypes.User],
    Operations: Operations.UPDATE,
    Modules: Modules.Address,
  }),
  validatorMiddleware({
    body: {
      streetAddress: [validator.string(), validator.minLength(5), validator.maxLength(100)],
      apartment: [validator.string(), validator.maxLength(20)],
      city: [validator.string(), validator.minLength(2), validator.maxLength(50)],
      state: [validator.string(), validator.minLength(2), validator.maxLength(50)],
      postalCode: [validator.string(), validator.matches(/^[0-9]{5}(-[0-9]{4})?$/)],
      country: [validator.string(), validator.minLength(2), validator.maxLength(50)],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const body = requestHelper.body();
      const address = await Address.findOneAndUpdate(
        { _id: req.params.id, user: req.user._id },
        body,
        { new: true, runValidators: true }
      );

      if (!address) {
        return responseHelper
          .status(404)
          .error({
            ...ErrorMap.NOT_FOUND,
            message: "Address not found",
          })
          .send();
      }

      return responseHelper.body(address).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Delete address
router.delete(
  "/delete-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin, UserTypes.User],
    Operations: Operations.DELETE,
    Modules: Modules.Address,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);

    try {
      const address = await Address.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!address) {
        return responseHelper
          .status(404)
          .error({
            ...ErrorMap.NOT_FOUND,
            message: "Address not found",
          })
          .send();
      }

      return responseHelper.body(address).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;