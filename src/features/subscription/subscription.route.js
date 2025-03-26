const express = require("express");
const router = express.Router();

// Import middlewares
const validatorMiddleware = require("../../middleware/validatorMiddleware");
const { permissionMiddleware } = require("../permission/permission.middleware");

// Import models
const { SubscriptionPlan, UserSubscription } = require("./subscription.model");
const { User } = require("../../models");

// Import helpers
const { ResponseHelper, RequestHelper, validator } = require("../../helpers");

// Import constants
const { ErrorMap, Operations, Modules, UserTypes } = require("../../constants");

// Create subscription plan
router.post(
  "/plan/create-one",
  permissionMiddleware({
    UserTypes: [UserTypes.SuperAdmin],
    Operations: Operations.CREATE,
    Modules: Modules.Subscriptions,
  }),
  validatorMiddleware({
    body: {
      name: [
        validator.required(),
        validator.string(),
        validator.minLength(2),
        validator.maxLength(50),
      ],
      description: [validator.required(), validator.string(), validator.maxLength(500)],
      price: [validator.required(), validator.number(), validator.min(0)],
      duration: [validator.required(), validator.number(), validator.min(1)],
      features: [validator.required(), validator.array()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const planData = requestHelper.body();
      planData.createdBy = req.user._id;

      const plan = await SubscriptionPlan.create(planData);
      return responseHelper.status(201).body({ plan }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Get subscription plan by ID
router.get(
  "/plan/read-one/:id",
  validatorMiddleware({
    params: {
      id: [validator.required(), validator.string()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const plan = await SubscriptionPlan.findById(requestHelper.params("id"));
      if (!plan) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "Subscription plan not found" })
          .send();
      }
      return responseHelper.status(200).body({ plan }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Get paginated subscription plans
router.get("/plan/paginate", async (req, res) => {
  const requestHelper = new RequestHelper(req);
  const responseHelper = new ResponseHelper(res);
  try {
    const data = await SubscriptionPlan.paginate(
      { isActive: true },
      requestHelper.getPaginationParams()
    );
    return responseHelper.body({ plans: data.data }).paginate(data.meta).send();
  } catch (error) {
    return responseHelper.error(error).send();
  }
});

// Update subscription plan
router.put(
  "/plan/update-one/:id",
  permissionMiddleware({
    UserTypes: [UserTypes.SuperAdmin],
    Operations: Operations.UPDATE,
    Modules: Modules.Subscriptions,
  }),
  validatorMiddleware({
    params: {
      id: [validator.required(), validator.string()],
    },
    body: {
      name: [validator.string(), validator.minLength(2), validator.maxLength(50)],
      description: [validator.string(), validator.maxLength(500)],
      price: [validator.number(), validator.min(0)],
      duration: [validator.number(), validator.min(1)],
      features: [validator.array()],
      isActive: [validator.boolean()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const updates = requestHelper.body();
      updates.updatedBy = req.user._id;

      const plan = await SubscriptionPlan.findByIdAndUpdate(
        requestHelper.params("id"),
        { $set: updates },
        { new: true }
      );

      if (!plan) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "Subscription plan not found" })
          .send();
      }

      return responseHelper.status(200).body({ plan }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Subscribe user to a plan
router.post(
  "/subscribe",
  validatorMiddleware({
    body: {
      planId: [validator.required(), validator.string()],
      autoRenew: [validator.boolean()],
    },
  }),
  async (req, res) => {
    const requestHelper = new RequestHelper(req);
    const responseHelper = new ResponseHelper(res);
    try {
      const { planId, autoRenew = false } = requestHelper.body();

      // Check if plan exists and is active
      const plan = await SubscriptionPlan.findOne({ _id: planId, isActive: true });
      if (!plan) {
        return responseHelper
          .status(404)
          .error({ ...ErrorMap.NOT_FOUND, message: "Subscription plan not found or inactive" })
          .send();
      }

      // Check if user already has an active subscription
      const activeSubscription = await UserSubscription.findOne({
        user: req.user._id,
        status: "active",
      });

      if (activeSubscription) {
        return responseHelper
          .status(400)
          .error({
            ...ErrorMap.INVALID_REQUEST,
            message: "User already has an active subscription",
          })
          .send();
      }

      // Create new subscription
      const subscription = await UserSubscription.create({
        user: req.user._id,
        plan: planId,
        startDate: new Date(),
        endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000),
        autoRenew,
      });

      return responseHelper.status(201).body({ subscription }).send();
    } catch (error) {
      return responseHelper.error(error).send();
    }
  }
);

// Get user's current subscription
router.get("/my-subscription", async (req, res) => {
  const responseHelper = new ResponseHelper(res);
  try {
    const subscription = await UserSubscription.findOne({
      user: req.user._id,
      status: "active",
    }).populate("plan");

    return responseHelper.status(200).body({ subscription }).send();
  } catch (error) {
    return responseHelper.error(error).send();
  }
});

// Cancel subscription
router.put("/cancel-subscription", async (req, res) => {
  const responseHelper = new ResponseHelper(res);
  try {
    const subscription = await UserSubscription.findOneAndUpdate(
      { user: req.user._id, status: "active" },
      { $set: { status: "cancelled", autoRenew: false } },
      { new: true }
    );

    if (!subscription) {
      return responseHelper
        .status(404)
        .error({ ...ErrorMap.NOT_FOUND, message: "No active subscription found" })
        .send();
    }

    return responseHelper.status(200).body({ subscription }).send();
  } catch (error) {
    return responseHelper.error(error).send();
  }
});

module.exports = router;