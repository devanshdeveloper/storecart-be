const express = require("express");
const ResponseHelper = require("../../helpers/ResponseHelper");

const router = express.Router();

router.get("/", (req, res) => {
  return new ResponseHelper(res).message("Storecart API is running").send();
});

module.exports = router;
