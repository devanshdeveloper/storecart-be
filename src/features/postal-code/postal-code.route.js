const express = require("express");
const router = express.Router();
const { ResponseHelper, RequestHelper } = require("../../helpers");
const axios = require("axios");

// Get location details by postal code
router.get("/:pincode", async (req, res) => {
  const requestHelper = new RequestHelper(req);
  const responseHelper = new ResponseHelper(res);

  try {
    const pincode = requestHelper.params("pincode");

    // Validate pincode format
    if (!/^\d{6}$/.test(pincode)) {
      return responseHelper
        .error({
          message: "Invalid pincode format. Must be 6 digits.",
          status: 400,
        })
        .send();
    }

    // Call India Post API
    const response = await axios.get(
      `https://api.postalpincode.in/pincode/${pincode}`
    );

    const data = response.data[0];

    // Check if the API request was successful
    if (data.Status !== "Success" || data.PostOffice.length === 0) {
      return responseHelper
        .error({
          message: "No location found for the provided pincode",
          status: 404,
        })
        .send();
    }

    // Extract the first post office data since all post offices in same pincode
    // will have same city, state and country
    const locationInfo = data.PostOffice[0];

    return responseHelper
      .body({
        city: locationInfo.District,
        state: locationInfo.State,
        country: locationInfo.Country,
      })
      .send();
  } catch (error) {
    return responseHelper.error(error).send();
  }
});

module.exports = router;
