const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    redirect: {
      type: String,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      enum: ["mention", "like", "follow", "comment", "system"],
      default: "system",
    },
    color: {
      type: String,
      enum: ["primary", "danger", "success", "warning", "default"],
      default: "primary",
    },
    avatar: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Create indexes
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ read: 1 });

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
