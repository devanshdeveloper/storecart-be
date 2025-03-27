const express = require("express");
const router = express.Router();
const { AuthHelper } = require("../helpers");
const authHelper = new AuthHelper();

// Mount routes - Alphabetically ordered
router.use(
  "/address",
  authHelper.authenticate(),
  require("../features/address/address.route")
);

router.use(
  "/cart",
  authHelper.authenticate(),
  require("../features/cart/cart.route")
);

router.use(
  "/bank",
  authHelper.authenticate(),
  require("../features/bank/bank.route")
);

router.use(
  "/category",
  authHelper.authenticate(),
  require("../features/category/category.route")
);

router.use(
  "/dashboard",
  authHelper.authenticate(),
  require("../features/dashboard/dashboard.route")
);

router.use(
  "/discount",
  authHelper.authenticate(),
  require("../features/discount/discount.route")
);

router.use(
  "/email-settings",
  authHelper.authenticate(),
  require("../features/settings/email/email.route")
);

router.use(
  "/notification",
  authHelper.authenticate(),
  require("../features/notification/notification.route")
);

router.use(
  "/order",
  authHelper.authenticate(),
  require("../features/order/order.route")
);

router.use(
  "/plan",
  authHelper.authenticate(),
  require("../features/plan/plan.route")
);

router.use(
  "/postal-code",
  authHelper.authenticate(),
  require("../features/postal-code/postal-code.route")
);

router.use(
  "/product",
  authHelper.authenticate(),
  require("../features/product/product.route")
);

router.use(
  "/product-review",
  authHelper.authenticate(),
  require("../features/product-review/product-review.route")
);

router.use(
  "/role",
  authHelper.authenticate(),
  require("../features/role/role.route")
);

router.use(
  "/settings/account",
  authHelper.authenticate(),
  require("../features/settings/account/account.route")
);

router.use(
  "/settings/notification",
  authHelper.authenticate(),
  require("../features/settings/notification/notification.route")
);

router.use(
  "/storefront",
  authHelper.authenticate(),
  require("../features/storefront/storefront.route")
);

router.use(
  "/subscription",
  authHelper.authenticate(),
  require("../features/subscription/subscription.route")
);

router.use(
  "/support",
  authHelper.authenticate(),
  require("../features/support/support.route")
);

router.use(
  "/user",
  authHelper.authenticate(),
  require("../features/user/user.route")
);

module.exports = router;
