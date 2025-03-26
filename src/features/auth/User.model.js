const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const UserTypes = require("../../constants/UserTypes");
const { AuthState } = require("../../constants");

const userSchema = new mongoose.Schema(
  {
    // basic details
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      select: false,
    },
    address: {
      type: String,
    },
    phone: {
      type: String,
    },
    avatar: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: Object.values(UserTypes),
      default: UserTypes.Admin,
    },
    // auth state
    authState: {
      type: String,
      enum: Object.values(AuthState),
      default: AuthState.BasicDetails,
    },
    // email verification
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
