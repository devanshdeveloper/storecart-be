const mongoose = require("mongoose");
const { SERVER_URL } = require("../../constants/env");
const { Schema } = mongoose;

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
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
      versionKey: false, // removes __v
      transform: (doc, ret) => {
        // remove fields you don't want
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.deletedAt;
        // remove id if still present (should already be absent due to id: false)
        delete ret.id;
        return ret;
      },
    },
    toObject: { virtuals: true, id: false },
  }
);

CategorySchema.virtual("imageUrl").get(function () {
  if (!this.image) return null;
  return `${SERVER_URL}${this.image}`;
});

const Category = mongoose.model("Category", CategorySchema);

module.exports = Category;
