const { Bank } = require("../models");

const bankSeeds = {
  Model: Bank,
  data: [
    {
      name: "John Smith",
      bankName: "Chase Bank",
      branch: "Manhattan Branch",
      branchAddress: "456 Wall Street, New York, NY 10005",
      accountType: "Savings",
      accountNumber: "123456789012",
      IFSCCode: "CHAS0123456",
      paymentPrefrence: "NEFT",
      balance: 5000,
      user: "507f1f77bcf86cd799439011"
    },
    {
      name: "Sarah Johnson",
      bankName: "Bank of America",
      branch: "Downtown LA Branch",
      branchAddress: "789 Grand Avenue, Los Angeles, CA 90017",
      accountType: "Current",
      accountNumber: "987654321098",
      IFSCCode: "BOFA0654321",
      paymentPrefrence: "RTGS",
      balance: 15000,
      user: "507f1f77bcf86cd799439012"
    },
    {
      name: "Michael Brown",
      bankName: "Wells Fargo",
      branch: "Chicago Loop Branch",
      branchAddress: "321 Michigan Avenue, Chicago, IL 60601",
      accountType: "Salary",
      accountNumber: "456789012345",
      IFSCCode: "WFAR0987654",
      paymentPrefrence: "IMPS",
      balance: 8000,
      user: "507f1f77bcf86cd799439013"
    }
  ]
};

module.exports = bankSeeds;