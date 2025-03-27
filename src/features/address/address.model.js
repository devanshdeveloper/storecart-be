const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    streetAddress: {
      type: String,
      required: [true, "Street address is required"],
      trim: true,
      minlength: [5, "Street address must be at least 5 characters long"],
      maxlength: [100, "Street address cannot exceed 100 characters"],
    },
    apartment: {
      type: String,
      trim: true,
      maxlength: [20, "Apartment/Suite number cannot exceed 20 characters"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      minlength: [2, "City name must be at least 2 characters long"],
      maxlength: [50, "City name cannot exceed 50 characters"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      minlength: [2, "State name must be at least 2 characters long"],
      maxlength: [50, "State name cannot exceed 50 characters"],
    },
    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true,
      match: [/^[0-9]{5}(-[0-9]{4})?$/, "Please enter a valid postal code"],
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      minlength: [2, "Country name must be at least 2 characters long"],
      maxlength: [50, "Country name cannot exceed 50 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for frequently queried fields
addressSchema.index({ user: 1, isActive: 1 });

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
