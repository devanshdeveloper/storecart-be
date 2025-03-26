const { Permission } = require("../models");
const { Modules, Operations } = require("../constants");

const permissionSeeds = {
  Model: Permission,
  data: [
    {
      permissions: [
        [Modules.Users, [Operations.READ, Operations.CREATE, Operations.UPDATE, Operations.DELETE], Infinity, Infinity],
        [Modules.Teachers, [Operations.READ, Operations.CREATE, Operations.UPDATE, Operations.DELETE], Infinity, Infinity],
        [Modules.Students, [Operations.READ, Operations.CREATE, Operations.UPDATE, Operations.DELETE], Infinity, Infinity],
        [Modules.Materials, [Operations.READ, Operations.CREATE, Operations.UPDATE, Operations.DELETE], Infinity, Infinity]
      ]
    },
    {
      permissions: [
        [Modules.Users, [Operations.READ], 100, 1000],
        [Modules.Teachers, [Operations.READ], 100, 1000],
        [Modules.Students, [Operations.READ], 100, 1000],
        [Modules.Materials, [Operations.READ, Operations.CREATE], 50, 500]
      ]
    },
    {
      permissions: [
        [Modules.Users, [Operations.READ], 10, 100],
        [Modules.Teachers, [Operations.READ], 10, 100],
        [Modules.Students, [Operations.READ], 10, 100],
        [Modules.Materials, [Operations.READ], 20, 200]
      ]
    }
  ]
};

module.exports = permissionSeeds;