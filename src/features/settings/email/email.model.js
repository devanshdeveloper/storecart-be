const mongoose = require("mongoose");

const EmailSettingsSchema = new mongoose.Schema(
  {
    smtpHost: {
      type: String,
      required: true,
    },
    smtpPort: {
      type: Number,
      required: true,
    },
    smtpUsername: {
      type: String,
      required: true,
    },
    smtpPassword: {
      type: String,
      required: true,
    },
    fromEmail: {
      type: String,
      required: true,
    },
    fromName: {
      type: String,
      required: true,
    },
    encryption: {
      type: String,
      enum: ["none", "ssl", "tls"],
      default: "tls",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailSettings", EmailSettingsSchema);
