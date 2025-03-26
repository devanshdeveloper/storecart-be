class StringHelper {
  /**
   * Capitalize the first letter of a string
   * @param {string} str - The input string
   * @returns {string} - String with first letter capitalized
   */
  static capitalize(str) {
    try {
      if (typeof str !== 'string') {
        throw new Error('Input must be a string');
      }
      if (str.length === 0) return str;
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    } catch (error) {
      console.error('Error in capitalize:', error);
      return str;
    }
  }

  /**
   * Reverse a string
   * @param {string} str - The input string
   * @returns {string} - Reversed string
   */
  static reverse(str) {
    try {
      if (typeof str !== 'string') {
        throw new Error('Input must be a string');
      }
      return str.split('').reverse().join('');
    } catch (error) {
      console.error('Error in reverse:', error);
      return str;
    }
  }

  /**
   * Check if a string is a palindrome
   * @param {string} str - The input string
   * @returns {boolean} - True if string is palindrome, false otherwise
   */
  static isPalindrome(str) {
    try {
      if (typeof str !== 'string') {
        throw new Error('Input must be a string');
      }
      const normalized = str.toLowerCase().replace(/[^a-z0-9]/g, '');
      return normalized === normalized.split('').reverse().join('');
    } catch (error) {
      console.error('Error in isPalindrome:', error);
      return false;
    }
  }

  /**
   * Normalize whitespace in a string
   * @param {string} str - The input string
   * @returns {string} - String with normalized whitespace
   */
  static normalizeWhitespace(str) {
    try {
      if (typeof str !== 'string') {
        throw new Error('Input must be a string');
      }
      return str.trim().replace(/\s+/g, ' ');
    } catch (error) {
      console.error('Error in normalizeWhitespace:', error);
      return str;
    }
  }

  /**
   * Count occurrences of a substring in a string
   * @param {string} str - The input string
   * @param {string} substr - The substring to count
   * @returns {number} - Number of occurrences
   */
  static countOccurrences(str, substr) {
    try {
      if (typeof str !== 'string' || typeof substr !== 'string') {
        throw new Error('Both inputs must be strings');
      }
      if (substr.length === 0) return 0;
      return (str.match(new RegExp(substr, 'g')) || []).length;
    } catch (error) {
      console.error('Error in countOccurrences:', error);
      return 0;
    }
  }

  /**
   * Convert string to kebab-case
   * @param {string} str - The input string
   * @returns {string} - Kebab-cased string
   */
  static toKebabCase(str) {
    try {
      if (typeof str !== 'string') {
        throw new Error('Input must be a string');
      }
      return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
    } catch (error) {
      console.error('Error in toKebabCase:', error);
      return str;
    }
  }

  /**
   * Convert string to snake_case
   * @param {string} str - The input string
   * @returns {string} - Snake_cased string
   */
  static toSnakeCase(str) {
    try {
      if (typeof str !== 'string') {
        throw new Error('Input must be a string');
      }
      return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toLowerCase();
    } catch (error) {
      console.error('Error in toSnakeCase:', error);
      return str;
    }
  }

  /**
   * Convert string to camelCase
   * @param {string} str - The input string
   * @returns {string} - CamelCased string
   */
  static toCamelCase(str) {
    try {
      if (typeof str !== 'string') {
        throw new Error('Input must be a string');
      }
      return str
        .replace(/[\s-_]+(.)/g, (_, c) => c.toUpperCase())
        .replace(/^[A-Z]/, c => c.toLowerCase());
    } catch (error) {
      console.error('Error in toCamelCase:', error);
      return str;
    }
  }
}

module.exports = StringHelper;