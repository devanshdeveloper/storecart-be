class PromiseHelper {
  /**
   * Add timeout to a promise
   * @param {Promise} promise - The promise to add timeout to
   * @param {number} ms - Timeout in milliseconds
   * @param {string} [message='Operation timed out'] - Timeout error message
   * @returns {Promise} - Promise with timeout
   */
  static timeout(promise, ms, message = "Operation timed out") {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Retry a promise with delay
   * @param {Function} fn - Function that returns a promise
   * @param {Object} options - Retry options
   * @param {number} [options.maxAttempts=3] - Maximum number of attempts
   * @param {number} [options.delay=1000] - Delay between attempts in milliseconds
   * @param {Function} [options.onRetry] - Callback function called on each retry
   * @returns {Promise} - The promise result
   */
  static async retry(fn, { maxAttempts = 3, delay = 1000, onRetry } = {}) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt === maxAttempts) break;

        if (onRetry) {
          onRetry({ attempt, error, remainingAttempts: maxAttempts - attempt });
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Execute promises in sequence
   * @param {Array<Function>} functions - Array of functions that return promises
   * @returns {Promise<Array>} - Array of results
   */
  static async sequence(functions) {
    const results = [];
    for (const fn of functions) {
      results.push(await fn());
    }
    return results;
  }
  /**
   * Execute promises in sequence
   * @param {Array<Function>} functions - Array of functions that return promises
   * @returns {Promise<Array>} - Array of results
   */
  static async safeSequence(functions) {
    const results = [];
    for (const fn of functions) {
      try {
        results.push(await fn());
      } catch (error) {
        results.push(error);
      }
    }
    return results;
  }

  /**
   * Execute promises with concurrency limit
   * @param {Array<Function>} functions - Array of functions that return promises
   * @param {number} [concurrency=3] - Maximum number of concurrent promises
   * @returns {Promise<Array>} - Array of results
   */
  static async pool(functions, concurrency = 3) {
    const results = new Array(functions.length);
    let currentIndex = 0;

    async function worker(workerId) {
      while (currentIndex < functions.length) {
        const index = currentIndex++;
        try {
          results[index] = await functions[index]();
        } catch (error) {
          results[index] = { error };
        }
      }
    }

    const workers = Array(Math.min(concurrency, functions.length))
      .fill()
      .map((_, index) => worker(index));

    await Promise.all(workers);
    return results;
  }

  /**
   * Create a deferred promise
   * @returns {Object} - Deferred object with promise, resolve, and reject
   */
  static defer() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  }

  /**
   * Make a promise cancellable
   * @param {Promise} promise - The promise to make cancellable
   * @returns {Object} - Object with promise and cancel function
   */
  static cancellable(promise) {
    let cancel;
    const wrappedPromise = new Promise((resolve, reject) => {
      cancel = () => reject(new Error("Promise cancelled"));
      promise.then(resolve, reject);
    });
    return { promise: wrappedPromise, cancel };
  }

  /**
   * Create a promise that resolves after a delay
   * @param {number} ms - Delay in milliseconds
   * @returns {Promise} - Promise that resolves after delay
   */
  static delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = PromiseHelper;

/*
Usage Examples:

// Timeout Example
const slowOperation = new Promise(resolve => setTimeout(() => resolve('Done'), 5000));
PromiseHelper.all('timeout', {
  promise: slowOperation,
  ms: 3000,
  message: 'Operation timed out'
});

// Retry Example
PromiseHelper.all('retry', {
  fn: unreliableOperation,
  maxAttempts: 5,
  delay: 1000,
  onRetry: ({ attempt, remainingAttempts }) => {
    console.log(`Retry attempt ${attempt}, ${remainingAttempts} remaining`);
  }
});

// Sequence Example
PromiseHelper.all('sequence', {
  functions: [
    () => Promise.resolve(1),
    () => Promise.resolve(2),
    () => Promise.resolve(3)
  ]
});

// Pool Example
PromiseHelper.all('pool', {
  functions: tasks,
  concurrency: 3
});

// Deferred Example
const { promise, resolve, reject } = PromiseHelper.all('defer');

// Cancellable Example
const { promise, cancel } = PromiseHelper.all('cancellable', {
  promise: new Promise(resolve => setTimeout(() => resolve('Done'), 5000))
});

// Delay Example
await PromiseHelper.all('delay', { ms: 1000 });
*/
