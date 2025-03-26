const ModelHelper = require("./helpers/ModelHelper");

const Models = {
  Address: new ModelHelper(require("./features/address/address.model")),
  Bank: new ModelHelper(require("./features/bank/bank.model")),
  Category: new ModelHelper(require("./features/category/category.model")),
  Discount: new ModelHelper(require("./features/discount/discount.model")),
  Email: new ModelHelper(require("./features/settings/email/email.model")),
  Notification: new ModelHelper(require("./features/notification/notification.model")),
  Order: new ModelHelper(require("./features/order/order.model")),
  Permission: new ModelHelper(require("./features/permission/permission.model")),
  Plan: new ModelHelper(require("./features/plan/plan.model")),
  Product: new ModelHelper(require("./features/product/product.model")),
  ProductReview: new ModelHelper(require("./features/product-review/product-review.model")),
  Role: new ModelHelper(require("./features/role/role.model")),
  Storefront: new ModelHelper(require("./features/storefront/storefront.model")),
  Subscription: new ModelHelper(require("./features/subscription/subscription.model")),
  Support: new ModelHelper(require("./features/support/support.model")),
  User: new (require("./features/user/UserHelper"))(),
};

module.exports = Models;
