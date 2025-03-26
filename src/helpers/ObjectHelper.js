class ObjectHelper {
  /**
   * Check if an object is empty
   * @param {Object} obj - The object to check
   * @returns {boolean} - True if object is empty, false otherwise
   */
  static isEmpty(obj) {
    try {
      if (typeof obj !== 'object' || obj === null) {
        throw new Error('Input must be an object');
      }
      return Object.keys(obj).length === 0;
    } catch (error) {
      console.error('Error in isEmpty:', error);
      return false;
    }
  }

  /**
   * Check if an object has a specific key
   * @param {Object} obj - The object to check
   * @param {string} key - The key to look for
   * @returns {boolean} - True if key exists, false otherwise
   */
  static hasKey(obj, key) {
    try {
      if (typeof obj !== 'object' || obj === null) {
        throw new Error('First argument must be an object');
      }
      return Object.prototype.hasOwnProperty.call(obj, key);
    } catch (error) {
      console.error('Error in hasKey:', error);
      return false;
    }
  }

  /**
   * Merge multiple objects
   * @param {...Object} objects - Objects to merge
   * @returns {Object} - Merged object
   */
  static merge(...objects) {
    try {
      objects.forEach(obj => {
        if (typeof obj !== 'object' || obj === null) {
          throw new Error('All arguments must be objects');
        }
      });
      return Object.assign({}, ...objects);
    } catch (error) {
      console.error('Error in merge:', error);
      return {};
    }
  }

  /**
   * Deep clone an object
   * @param {Object} obj - The object to clone
   * @returns {Object} - Cloned object
   */
  static clone(obj) {
    try {
      if (typeof obj !== 'object' || obj === null) {
        throw new Error('Input must be an object');
      }
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      console.error('Error in clone:', error);
      return {};
    }
  }

  /**
   * Get all keys of an object
   * @param {Object} obj - The object to get keys from
   * @returns {Array} - Array of keys
   */
  static keys(obj) {
    try {
      if (typeof obj !== 'object' || obj === null) {
        throw new Error('Input must be an object');
      }
      return Object.keys(obj);
    } catch (error) {
      console.error('Error in keys:', error);
      return [];
    }
  }

  /**
   * Get all values of an object
   * @param {Object} obj - The object to get values from
   * @returns {Array} - Array of values
   */
  static values(obj) {
    try {
      if (typeof obj !== 'object' || obj === null) {
        throw new Error('Input must be an object');
      }
      return Object.values(obj);
    } catch (error) {
      console.error('Error in values:', error);
      return [];
    }
  }

  /**
   * Omit specified keys from an object
   * @param {Object} obj - The source object
   * @param {Array} keys - Keys to omit
   * @returns {Object} - New object without specified keys
   */
  static omit(obj, keys) {
    try {
      if (typeof obj !== 'object' || obj === null) {
        throw new Error('First argument must be an object');
      }
      if (!Array.isArray(keys)) {
        throw new Error('Second argument must be an array');
      }
      const newObj = { ...obj };
      keys.forEach(key => delete newObj[key]);
      return newObj;
    } catch (error) {
      console.error('Error in omit:', error);
      return obj;
    }
  }

  /**
   * Pick specified keys from an object
   * @param {Object} obj - The source object
   * @param {Array} keys - Keys to pick
   * @returns {Object} - New object with only specified keys
   */
  static pick(obj, keys) {
    try {
      if (typeof obj !== 'object' || obj === null) {
        throw new Error('First argument must be an object');
      }
      if (!Array.isArray(keys)) {
        throw new Error('Second argument must be an array');
      }
      return keys.reduce((acc, key) => {
        if (obj.hasOwnProperty(key)) {
          acc[key] = obj[key];
        }
        return acc;
      }, {});
    } catch (error) {
      console.error('Error in pick:', error);
      return {};
    }
  }
}

module.exports = ObjectHelper;