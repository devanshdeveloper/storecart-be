const { UserTypes } = require("../constants");
const { AuthHelper } = require("../helpers");
const { User } = require("../models");
const authHelper = new AuthHelper();


const userSeeds = async () => ({
  Model: User,
  data: [
    {
      name: "Super Admin",
      email: "superadmin@superadmin.com",
      password: await authHelper.hashPassword("12345678"),
      type: UserTypes.SuperAdmin,
    },
    {
      name: "Admin",
      email: "admin@admin.com",
      password: await authHelper.hashPassword("12345678"),
      type: UserTypes.Admin,
    },
    {
      name: "User",
      email: "user@user.com",
      password: await authHelper.hashPassword("12345678"),
      type: UserTypes.User,
    },
    {
      name: "Teacher",
      email: "teacher@teacher.com",
      password: await authHelper.hashPassword("12345678"),
      type: UserTypes.Teacher,
    },
    {
      name: "Student",
      email: "student@student.com",
      password: await authHelper.hashPassword("12345678"),
      type: UserTypes.Student,
    },
    {
      name: "Parent",
      email: "parent@parent.com",
      password: await authHelper.hashPassword("12345678"),
      type: UserTypes.Parent,
    },
  ],
});
module.exports = userSeeds;
