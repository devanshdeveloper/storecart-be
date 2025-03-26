const { Schema, model } = require("mongoose");

const planSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      currency: {
        type: String,
        required: true,
        default: "USD",
        enum: ["USD", "EUR", "GBP"],
      },
      billingCycle: {
        type: String,
        required: true,
        enum: ["monthly", "yearly"],
      },
    },
    features: [
      {
        name: {
          type: String,
          required: true,
        },
        description: String,
        enabled: {
          type: Boolean,
          default: true,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    trialDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    permissions: {
      type: Schema.Types.ObjectId,
      ref: "Permission",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to update the updatedAt timestamp
planSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to check if a plan has a specific feature
planSchema.methods.hasFeature = function (featureName) {
  return this.features.some(
    (feature) => feature.name === featureName && feature.enabled
  );
};

// Static method to find active plans
planSchema.statics.findActivePlans = function () {
  return this.find({ isActive: true });
};

const Plan = model("Plan", planSchema);

module.exports = Plan;
