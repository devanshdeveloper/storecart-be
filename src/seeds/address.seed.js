const { Address } = require("../models");

const addressSeeds = {
  Model: Address,
  data: [
    {
      streetAddress: "123 Main Street",
      apartment: "Suite 101",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "United States",
      isActive: true
    },
    {
      streetAddress: "456 Park Avenue",
      apartment: "Apt 2B",
      city: "Los Angeles",
      state: "CA",
      postalCode: "90001",
      country: "United States",
      isActive: true
    },
    {
      streetAddress: "789 Oak Road",
      city: "Chicago",
      state: "IL",
      postalCode: "60601",
      country: "United States",
      isActive: true
    }
  ]
};

module.exports = addressSeeds;