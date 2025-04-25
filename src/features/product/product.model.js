const mongoose = require("mongoose");
const { SERVER_URL } = require("../../constants/env");
const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
      },
    ],
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    variants: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        value: {
          type: String,
          required: true,
          trim: true,
        },
        stock: {
          type: Number,
          required: true,
          min: 0,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        images: [
          {
            type: String,
          },
        ],
      },
    ],
    taxes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tax",
        required: true,
      },
    ],
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.deletedAt;
        delete ret.id;
        return ret;
      },
    },
    toObject: { virtuals: true, id: false },
  }
);

ProductSchema.virtual("imageUrls").get(function () {
  if (!this.images || !this.images.length) return [];
  return this.images.map((image) => `${SERVER_URL}${image}`);
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
