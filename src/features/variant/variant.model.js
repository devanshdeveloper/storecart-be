const { model, Schema } = require("mongoose");

const variantSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ["size", "color", "material", "style"],
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    sku: {
      type: String,
      trim: true,
    },
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

const Variant = model("Variant", variantSchema);

module.exports = Variant;