const mongoose = require("mongoose");
const Modules = require("../../constants/Modules");
const Operations = require("../../constants/Operations");

const permissionSchema = new mongoose.Schema(
  {
    permissions: [
      {
        type: [mongoose.Schema.Types.Mixed],
        required: true,
        validate: {
          validator: function (permission) {
            return (
              Array.isArray(permission) &&
              permission.length === 4 &&
              Object.values(Modules).includes(permission[0]) &&
              Array.isArray(permission[1]) &&
              permission[1].every((op) =>
                Object.values(Operations).flat().includes(op)
              ) &&
              (permission[2] === Infinity ||
                (Number.isFinite(permission[2]) && permission[2] >= 0)) &&
              (permission[3] === Infinity ||
                (Number.isFinite(permission[3]) && permission[3] >= 0))
            );
          },
          message:
            "Invalid permission format. Expected [ModuleName, Operations, MonthlyLimit, YearlyLimit]",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add a method to check if a module has permission for an operation
permissionSchema.methods.hasPermission = function (moduleName, operation) {
  const modulePermission = this.permissions.find((p) => p[0] === moduleName);
  return modulePermission && modulePermission[1].includes(operation);
};

// Add a method to check write limits
permissionSchema.methods.checkWriteLimit = function (
  moduleName,
  period = "monthly"
) {
  const modulePermission = this.permissions.find((p) => p[0] === moduleName);
  if (!modulePermission) return false;

  const limit =
    period === "monthly" ? modulePermission[2] : modulePermission[3];
  if (limit === Infinity) return true;

  // In a real application, you would implement logic here to track and check actual usage
  // against the specified limit
  return true; // Placeholder return
};

// Static method to create permission from configuration
permissionSchema.statics.createFromConfig = async function (permissions) {
  return await this.create({ permissions });
};

const Permission = mongoose.model("Permission", permissionSchema);

module.exports = Permission;
