const mongoose = require("mongoose");
const { Schema } = mongoose;

const bankSchema = new Schema(
  {
    name: {
      type: Schema.Types.String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    bankName: {
      type: Schema.Types.String,
      trim: true,
      maxlength: 100,
    },
    branch: {
      type: Schema.Types.String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    branchAddress: {
      type: Schema.Types.String,
      trim: true,
      maxlength: 200,
    },
    accountType: {
      type: Schema.Types.String,
      trim: true,
      enum: ["Savings", "Current", "Salary"],
      default: "Savings",
    },
    accountNumber: {
      type: Schema.Types.String,
      required: true,
      trim: true,
      unique: true,
      validate: {
        validator: function(v) {
          return /^\d{9,18}$/.test(v);
        },
        message: "Account number must be between 9 and 18 digits"
      }
    },
    IFSCCode: {
      type: Schema.Types.String,
      required: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v);
        },
        message: "Invalid IFSC code format"
      }
    },
    paymentPrefrence: {
      type: Schema.Types.String,
      enum: ["NEFT", "RTGS", "IMPS"],
      default: "NEFT",
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Bank = mongoose.model("Bank", bankSchema);

module.exports = Bank;