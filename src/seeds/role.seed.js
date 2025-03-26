const { Role } = require("../models");
const { UserTypes } = require("../constants");

const roleSeeds = {
  Model: Role,
  data: [
    {
      name: UserTypes.SuperAdmin,
      description: "Full system access with unlimited permissions"
    },
    {
      name: UserTypes.Admin,
      description: "Department level access with limited permissions"
    },
    {
      name: UserTypes.Teacher,
      description: "Basic access for teaching staff"
    },
    {
      name: UserTypes.Student,
      description: "Limited access for enrolled students"
    },
    {
      name: UserTypes.Parent,
      description: "Access for viewing student information"
    },
    {
      name: UserTypes.User,
      description: "Basic system access"
    }
  ]
};

module.exports = roleSeeds;