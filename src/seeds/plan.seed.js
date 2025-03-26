const { Plan } = require("../models");

const planSeeds = {
  Model: Plan,
  data: [
    {
      name: "Basic Student Plan",
      description: "Essential features for students",
      price: {
        amount: 9.99,
        currency: "USD",
        billingCycle: "monthly"
      },
      features: [
        {
          name: "Course Access",
          description: "Access to enrolled courses",
          enabled: true
        },
        {
          name: "Assignment Submission",
          description: "Submit assignments online",
          enabled: true
        }
      ],
      isActive: true,
      trialDays: 30,
      permissions: "507f1f77bcf86cd799439011"
    },
    {
      name: "Teacher Pro Plan",
      description: "Complete toolkit for educators",
      price: {
        amount: 29.99,
        currency: "USD",
        billingCycle: "monthly"
      },
      features: [
        {
          name: "Course Management",
          description: "Create and manage courses",
          enabled: true
        },
        {
          name: "Grade Management",
          description: "Manage student grades",
          enabled: true
        },
        {
          name: "Resource Library",
          description: "Access teaching resources",
          enabled: true
        }
      ],
      isActive: true,
      trialDays: 14,
      permissions: "507f1f77bcf86cd799439012"
    },
    {
      name: "Admin Enterprise Plan",
      description: "Complete school management solution",
      price: {
        amount: 99.99,
        currency: "USD",
        billingCycle: "monthly"
      },
      features: [
        {
          name: "User Management",
          description: "Manage all users",
          enabled: true
        },
        {
          name: "Analytics Dashboard",
          description: "Access to analytics",
          enabled: true
        },
        {
          name: "Financial Management",
          description: "Manage school finances",
          enabled: true
        },
        {
          name: "System Configuration",
          description: "Configure system settings",
          enabled: true
        }
      ],
      isActive: true,
      trialDays: 7,
      permissions: "507f1f77bcf86cd799439013"
    },
    {
      name: "Parent Basic Plan",
      description: "Stay connected with your child's education",
      price: {
        amount: 4.99,
        currency: "USD",
        billingCycle: "monthly"
      },
      features: [
        {
          name: "Progress Tracking",
          description: "Track student progress",
          enabled: true
        },
        {
          name: "Communication",
          description: "Communicate with teachers",
          enabled: true
        }
      ],
      isActive: true,
      trialDays: 30,
      permissions: "507f1f77bcf86cd799439014"
    }
  ]
};

module.exports = planSeeds;