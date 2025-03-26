const express = require("express");
const router = express.Router();
const { Bank } = require("../../models");
const { ResponseHelper, RequestHelper, validator } = require("../../helpers");
const { ErrorMap, Operations, Modules, UserTypes } = require("../../constants");
const { permissionMiddleware } = require("../permission/permission.middleware");
const validatorMiddleware = require("../../middleware/validatorMiddleware");

// Create a new bank account
router.post(
  "/create-one",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.CREATE,
    Modules: Modules.Banks,
  }),
  validatorMiddleware({
    body: {
      name: [
        validator.required(),
        validator.string(),
        validator.minLength(2),
        validator.maxLength(100),
      ],
      bankName: [validator.string(), validator.maxLength(100)],
      branch: [
        validator.required(),
        validator.string(),
        validator.maxLength(100),
      ],
      branchAddress: [validator.string(), validator.maxLength(200)],
      accountType: [validator.string()],
      accountNumber: [validator.required(), validator.string()],
      IFSCCode: [validator.required(), validator.string()],
      paymentPrefrence: [validator.string()],
      balance: [validator.number(), validator.min(0)],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const bankData = requestHelper.body();

      // Check if account number already exists
      const existingBank = await Bank.findOne({
        accountNumber: bankData.accountNumber,
      });
      if (existingBank) {
        return responseHelper
          .status(400)
          .error({
            ...ErrorMap.DUPLICATE_ENTRY,
            message: "Account number already exists",
          })
          .send();
      }

      const bank = await Bank.create({
        ...bankData,
        user: req.user._id,
      });

      return responseHelper.status(201).body({ bank }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Get bank account by ID
router.get(
  "/read-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.READ,
    Modules: Modules.Banks,
  }),
  async (req, res) => {
    const responseHelper = new ResponseHelper(res);
    try {
      const bank = await Bank.findById(req.params.id);
      if (!bank) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "Bank account not found" })
          .send();
      }
      return responseHelper.status(200).body({ bank }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Get all bank accounts with pagination
router.get(
  "/paginate",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.READ,
    Modules: Modules.Banks,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const { sortField, sortOrder } = requestHelper.getSortParams();
      const searchFilter = requestHelper.getSearchParams(
        "name",
        "bankName",
        "branch",
        "accountNumber",
        "IFSCCode"
      );

      const data = await Bank.paginate(
        { 
          sort: { [sortField]: sortOrder },
          filter: searchFilter
        },
        requestHelper.getPaginationParams()
      );

      return responseHelper
        .status(200)
        .body({ banks: data.data })
        .paginate(data.meta)
        .send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Get banks dropdown
router.get(
  "/dropdown",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.READ,
    Modules: Modules.Banks,
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const data = await Bank.dropdown(
        { sort: { name: 1 }, select: "name bankName accountNumber" },
        requestHelper.getPaginationParams()
      );

      return responseHelper
        .status(200)
        .body({ banks: data.data })
        .paginate(data.meta)
        .send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Update bank account
router.put(
  "/update-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.UPDATE,
    Modules: Modules.Banks,
  }),
  validatorMiddleware({
    body: {
      name: [validator.string(), validator.minLength(2), validator.maxLength(100)],
      bankName: [validator.string(), validator.maxLength(100)],
      branch: [validator.string(), validator.maxLength(100)],
      branchAddress: [validator.string(), validator.maxLength(200)],
      accountType: [validator.string()],
      accountNumber: [validator.string()],
      IFSCCode: [validator.string()],
      paymentPrefrence: [validator.string()],
      balance: [validator.number(), validator.min(0)],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const updates = requestHelper.body();

      // Check if account number is being updated and if it already exists
      if (updates.accountNumber) {
        const existingBank = await Bank.findOne({
          accountNumber: updates.accountNumber,
          _id: { $ne: req.params.id },
        });
        if (existingBank) {
          return responseHelper
            .status(400)
            .error({
              ...ErrorMap.DUPLICATE_ENTRY,
              message: "Account number already exists",
            })
            .send();
        }
      }

      const bank = await Bank.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true }
      );

      if (!bank) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "Bank account not found" })
          .send();
      }

      return responseHelper.status(200).body({ bank }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Delete bank account
router.delete(
  "/delete-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.DELETE,
    Modules: Modules.Banks,
  }),
  async (req, res) => {
    const responseHelper = new ResponseHelper(res);
    try {
      const bank = await Bank.findByIdAndDelete(req.params.id);
      if (!bank) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "Bank account not found" })
          .send();
      }
      return responseHelper.status(200).body({ bank }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Validate IFSC code
router.get(
  "/ifsc/:ifsc",
  permissionMiddleware({
    UserTypes: [UserTypes.Admin, UserTypes.SuperAdmin],
    Operations: Operations.READ,
    Modules: Modules.Banks,
  }),
  validatorMiddleware({
    params: {
      ifsc: [validator.required(), validator.string(), validator.matches(/^[A-Z]{4}0[A-Z0-9]{6}$/)],
    },
  }),
  async (req, res) => {
    const responseHelper = new ResponseHelper(res);
    try {
      const response = await fetch(`https://ifsc.razorpay.com/${req.params.ifsc}`);
      if (!response.ok) {
        return responseHelper
          .status(400)
          .error({ ...ErrorMap.INVALID_INPUT, message: "Invalid IFSC code" })
          .send();
      }
      const data = await response.json();
      return responseHelper.status(200).body({ bank_details: data }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

module.exports = router;