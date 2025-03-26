/**
 * Standard CRUD operations and custom operations for permission management
 */
const Operations = {
  // Standard CRUD Operations
  CREATE: "C",
  READ: "R",
  UPDATE: "U",
  DELETE: "D",

  // Operation Sets
  CRUD: "CRUD",
  READ_ONLY: "R",
  WRITE_ONLY: "CUD",
  MANAGE: "CRUD", // Full access alias

  // Helper method to check if an operation string contains a specific operation
  hasOperation: (operationString, operation) => {
    return operationString.includes(operation);
  },

  // Helper method to combine multiple operations
  combineOperations: (...operations) => {
    const uniqueOps = new Set(operations.join('').split(''));
    return Array.from(uniqueOps).sort().join('');
  }
};

module.exports = Operations;