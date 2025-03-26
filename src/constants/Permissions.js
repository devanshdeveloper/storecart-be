const Modules = require("./Modules");
const Operations = require("./Operations");

const Permissions = [
  // [ModuleName, ActionsAllowed, MonthlyLimit, YearlyLimit]
  [Modules.Dashboard, Operations.CRUD, Infinity, Infinity],
  [Modules.Teachers, Operations.CRUD, Infinity, Infinity],
  [Modules.Students, Operations.CRUD, Infinity, Infinity],
  [Modules.Classrooms, Operations.CRUD, Infinity, Infinity],
  [Modules.Attendence, Operations.CRUD, Infinity, Infinity],
  [Modules.Tests, Operations.CRUD, Infinity, Infinity],
  [Modules.Fees, Operations.CRUD, Infinity, Infinity],
  [Modules.Settings, Operations.CRUD, Infinity, Infinity],
  [Modules.Materials, Operations.CRUD, Infinity, Infinity],
];

module.exports = Permissions;
