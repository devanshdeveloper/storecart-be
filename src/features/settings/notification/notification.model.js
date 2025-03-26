const mongoose = require("mongoose");

// Define the notification settings schema that will be embedded in the User model
const notificationSettingsSchema = new mongoose.Schema(
  {
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    inAppNotifications: {
      type: Boolean,
      default: true,
    },
    notificationFrequency: {
      type: String,
      enum: ["immediate", "daily", "weekly"],
      default: "immediate",
    },
    pushNotifications: {
      type: Boolean,
      default: false,
    },
    emailDigest: {
      type: String,
      enum: ["daily", "weekly", "never"],
      default: "daily",
    },
  },
  { _id: false }
);

// Add the notification settings schema to the User model
const User = mongoose.model("User");
User.schema.add({
  notificationSettings: {
    type: notificationSettingsSchema,
    default: () => ({}),
  },
});

module.exports = notificationSettingsSchema;