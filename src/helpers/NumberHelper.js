class NumberHelper {
  /**
   * Add two numbers
   * @param {number} a - First number
   * @param {number} b - Second number
   * @returns {number} - Sum of the numbers
   */
  static add(a, b) {
    try {
      if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error('Both inputs must be numbers');
      }
      return a + b;
    } catch (error) {
      console.error('Error in add:', error);
      return 0;
    }
  }

  /**
   * Subtract two numbers
   * @param {number} a - First number
   * @param {number} b - Second number
   * @returns {number} - Difference of the numbers
   */
  static subtract(a, b) {
    try {
      if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error('Both inputs must be numbers');
      }
      return a - b;
    } catch (error) {
      console.error('Error in subtract:', error);
      return 0;
    }
  }

  /**
   * Multiply two numbers
   * @param {number} a - First number
   * @param {number} b - Second number
   * @returns {number} - Product of the numbers
   */
  static multiply(a, b) {
    try {
      if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error('Both inputs must be numbers');
      }
      return a * b;
    } catch (error) {
      console.error('Error in multiply:', error);
      return 0;
    }
  }

  /**
   * Divide two numbers
   * @param {number} a - First number
   * @param {number} b - Second number
   * @returns {number} - Quotient of the numbers
   */
  static divide(a, b) {
    try {
      if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error('Both inputs must be numbers');
      }
      if (b === 0) {
        throw new Error('Cannot divide by zero');
      }
      return a / b;
    } catch (error) {
      console.error('Error in divide:', error);
      return 0;
    }
  }

  /**
   * Calculate the power of a number
   * @param {number} base - The base number
   * @param {number} exponent - The exponent
   * @returns {number} - The result of base raised to exponent
   */
  static power(base, exponent) {
    try {
      if (typeof base !== 'number' || typeof exponent !== 'number') {
        throw new Error('Both inputs must be numbers');
      }
      return Math.pow(base, exponent);
    } catch (error) {
      console.error('Error in power:', error);
      return 0;
    }
  }

  /**
   * Round a number to specified decimal places
   * @param {number} num - The number to round
   * @param {number} decimals - Number of decimal places
   * @returns {number} - Rounded number
   */
  static round(num, decimals = 0) {
    try {
      if (typeof num !== 'number' || typeof decimals !== 'number') {
        throw new Error('Inputs must be numbers');
      }
      const factor = Math.pow(10, decimals);
      return Math.round(num * factor) / factor;
    } catch (error) {
      console.error('Error in round:', error);
      return num;
    }
  }

  /**
   * Get the absolute value of a number
   * @param {number} num - The input number
   * @returns {number} - Absolute value
   */
  static abs(num) {
    try {
      if (typeof num !== 'number') {
        throw new Error('Input must be a number');
      }
      return Math.abs(num);
    } catch (error) {
      console.error('Error in abs:', error);
      return 0;
    }
  }

  /**
   * Convert a number to binary string
   * @param {number} num - The number to convert
   * @returns {string} - Binary representation
   */
  static toBinary(num) {
    try {
      if (typeof num !== 'number' || !Number.isInteger(num)) {
        throw new Error('Input must be an integer');
      }
      return num.toString(2);
    } catch (error) {
      console.error('Error in toBinary:', error);
      return '0';
    }
  }
}

module.exports = NumberHelper;