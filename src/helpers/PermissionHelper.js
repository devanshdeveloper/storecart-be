const Permissions = require("../constants/Permissions");
const Modules = require("../constants/Modules");

class PermissionHelper {
  constructor() {
    this.permissions = new Map(
      Permissions.map(([module, operations, read, write]) => [
        module,
        { operations, read, write }
      ])
    );
  }

  /**
   * Check if user has permission to access a specific module
   * @param {string} module - The module to check
   * @param {string} operation - The operation to check (C/R/U/D)
   * @param {number} userLevel - The user's permission level
   * @returns {boolean} - Whether the user has permission
   */
  hasPermission(module, operation, userLevel) {
    const permission = this.permissions.get(module);
    if (!permission) return false;

    // Check if the operation is allowed for the module
    if (!permission.operations.includes(operation)) return false;

    // Check user level against required levels
    switch (operation) {
      case 'R':
        return userLevel <= permission.read;
      case 'C':
      case 'U':
      case 'D':
        return userLevel <= permission.write;
      default:
        return false;
    }
  }

  /**
   * Get all modules a user has access to
   * @param {number} userLevel - The user's permission level
   * @returns {Object} - Object with module names as keys and allowed operations as values
   */
  getUserModuleAccess(userLevel) {
    const moduleAccess = {};

    this.permissions.forEach((permission, module) => {
      const operations = permission.operations.split('').filter(op => {
        return this.hasPermission(module, op, userLevel);
      });

      if (operations.length > 0) {
        moduleAccess[module] = operations.join('');
      }
    });

    return moduleAccess;
  }

  /**
   * Check if module exists
   * @param {string} module - The module to check
   * @returns {boolean} - Whether the module exists
   */
  moduleExists(module) {
    return this.permissions.has(module);
  }

  /**
   * Get required level for specific operation on module
   * @param {string} module - The module to check
   * @param {string} operation - The operation to check (C/R/U/D)
   * @returns {number|null} - Required level or null if not found
   */
  getRequiredLevel(module, operation) {
    const permission = this.permissions.get(module);
    if (!permission) return null;

    return operation === 'R' ? permission.read : permission.write;
  }

  /**
   * Get all available modules
   * @returns {string[]} - Array of module names
   */
  getModules() {
    return Array.from(this.permissions.keys());
  }

  /**
   * Get allowed operations for a module
   * @param {string} module - The module to check
   * @returns {string|null} - String of allowed operations or null if module not found
   */
  getAllowedOperations(module) {
    const permission = this.permissions.get(module);
    return permission ? permission.operations : null;
  }
}

module.exports = PermissionHelper;