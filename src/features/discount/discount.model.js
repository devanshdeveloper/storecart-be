const mongoose = require("mongoose");
const { Schema } = mongoose;

const DiscountSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    validFrom: {
      type: Date,
      required: true,
    },
    validTo: {
      type: Date,
      required: true,
    },
    products: [{
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    }],
    storefront: {
      type: Schema.Types.ObjectId,
      ref: "Storefront",
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Discount = mongoose.model("Discount", DiscountSchema);

module.exports = { Discount };