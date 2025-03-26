const { model, Schema } = require("mongoose");

const SupportRequestTypes = {
  GENERAL: "GENERAL",
  TECHNICAL: "TECHNICAL",
  BILLING: "BILLING",
  PRODUCT: "PRODUCT",
  OTHER: "OTHER",
};

const SupportSchema = Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    requestType: {
      type: String,
      required: true,
      enum: Object.values(SupportRequestTypes),
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        type: String,
        required: false,
      },
    ],
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = {
  Support: model("Support", SupportSchema),
  SupportRequestTypes,
};