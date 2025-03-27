const express = require('express');
const router = express.Router();


// Mount routes
router.use('/auth', require('../features/auth/auth.route'));
router.use('/plan', require('../features/plan/plan.unauth.route'));
router.use('/product', require('../features/product/product.unauth.route'));
router.use("/example" , require("../features/example/example.route"))

module.exports = router;
