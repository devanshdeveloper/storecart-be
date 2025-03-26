class ArrayHelper {
  /**
   * Check if array is empty
   * @param {Array} arr - The array to check
   * @returns {boolean} - True if array is empty, false otherwise
   */
  static isEmpty(arr) {
    try {
      if (!Array.isArray(arr)) {
        throw new Error('Input must be an array');
      }
      return arr.length === 0;
    } catch (error) {
      console.error('Error in isEmpty:', error);
      return false;
    }
  }

  /**
   * Remove duplicates from an array
   * @param {Array} arr - The array to remove duplicates from
   * @returns {Array} - Array with duplicates removed
   */
  static removeDuplicates(arr) {
    try {
      if (!Array.isArray(arr)) {
        throw new Error('Input must be an array');
      }
      return [...new Set(arr)];
    } catch (error) {
      console.error('Error in removeDuplicates:', error);
      return arr;
    }
  }

  /**
   * Remove duplicate objects from an array
   * @param {Array} arr - The array to remove duplicates from
   * @returns {Array} - Array with duplicate objects removed
   */
  static removeDuplicateObjects(arr) {
    try {
      if (!Array.isArray(arr)) {
        throw new Error('Input must be an array');
      }
      const seen = new Set();
      return arr.filter(item => {
        const serialized = JSON.stringify(item);
        if (seen.has(serialized)) {
          return false;
        }
        seen.add(serialized);
        return true;
      });
    } catch (error) {
      console.error('Error in removeDuplicateObjects:', error);
      return arr;
    }
  }

  /**
   * Merge multiple arrays
   * @param {...Array} arrays - Arrays to merge
   * @returns {Array} - Merged array
   */
  static merge(...arrays) {
    try {
      arrays.forEach(arr => {
        if (!Array.isArray(arr)) {
          throw new Error('All arguments must be arrays');
        }
      });
      return [].concat(...arrays);
    } catch (error) {
      console.error('Error in merge:', error);
      return [];
    }
  }

  /**
   * Flatten a nested array
   * @param {Array} arr - The array to flatten
   * @returns {Array} - Flattened array
   */
  static flatten(arr) {
    try {
      if (!Array.isArray(arr)) {
        throw new Error('Input must be an array');
      }
      return arr.flat(Infinity);
    } catch (error) {
      console.error('Error in flatten:', error);
      return arr;
    }
  }

  /**
   * Get a random element from an array
   * @param {Array} arr - The array to get random element from
   * @returns {*} - Random element from array
   */
  static random(arr) {
    try {
      if (!Array.isArray(arr) || arr.length === 0) {
        throw new Error('Input must be a non-empty array');
      }
      return arr[Math.floor(Math.random() * arr.length)];
    } catch (error) {
      console.error('Error in random:', error);
      return null;
    }
  }

  /**
   * Find the intersection of two arrays
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @returns {Array} - Array with elements present in both arrays
   */
  static intersection(arr1, arr2) {
    try {
      if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
        throw new Error('Both inputs must be arrays');
      }
      return arr1.filter(value => arr2.includes(value));
    } catch (error) {
      console.error('Error in intersection:', error);
      return [];
    }
  }

  /**
   * Find the difference between two arrays
   * @param {Array} arr1 - First array
   * @param {Array} arr2 - Second array
   * @returns {Array} - Array with elements present in first array but not in second
   */
  static difference(arr1, arr2) {
    try {
      if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
        throw new Error('Both inputs must be arrays');
      }
      return arr1.filter(value => !arr2.includes(value));
    } catch (error) {
      console.error('Error in difference:', error);
      return [];
    }
  }
}

module.exports = ArrayHelper;