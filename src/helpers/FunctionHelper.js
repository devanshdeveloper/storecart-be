class FunctionHelper {
  // Execute a function with error handling
  static safeExecute(fn, ...args) {
    try {
      return fn(...args);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // Memoize a function
  static memoize(fn) {
    const cache = new Map();
    return (...args) => {
      const key = JSON.stringify(args);
      if (!cache.has(key)) {
        cache.set(key, fn(...args));
      }
      return cache.get(key);
    };
  }

  // Debounce a function
  static debounce(fn, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  }

  // Throttle a function
  static throttle(fn, wait) {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= wait) {
        fn(...args);
        lastCall = now;
      }
    };
  }

  // Call function only once
  static once(fn) {
    let called = false;
    let result;
    return (...args) => {
      if (!called) {
        called = true;
        result = fn(...args);
      }
      return result;
    };
  }

  // Retry a function with delay
  static async retry(fn, maxAttempts = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Chain multiple functions
  static pipe(...fns) {
    return (x) => fns.reduce((v, f) => f(v), x);
  }

  // Create an async queue processor
  static createQueue(processor, concurrency = 1) {
    const queue = [];
    let running = 0;

    const runTask = async () => {
      if (queue.length === 0 || running >= concurrency) return;
      running++;
      const task = queue.shift();
      try {
        await processor(task);
      } catch (error) {
        console.error('Queue processor error:', error);
      }
      running--;
      runTask();
    };

    return {
      add: (task) => {
        queue.push(task);
        runTask();
      },
      size: () => queue.length,
      running: () => running
    };
  }

  // Measure execution time of a function
  static measureTime(fn) {
    return async (...args) => {
      const start = process.hrtime();
      const result = await fn(...args);
      const [seconds, nanoseconds] = process.hrtime(start);
      const duration = seconds * 1000 + nanoseconds / 1e6;
      return { result, duration };
    };
  }

  
}

module.exports = FunctionHelper;

/* Usage Examples:

// 1. Safe Execute - Handle errors gracefully
const divideNumbers = (a, b) => a / b;
const safeDivide = FunctionHelper.safeExecute(divideNumbers, 10, 2); // Returns 5
const safeError = FunctionHelper.safeExecute(divideNumbers, 10, 0); // Returns null, logs error

// 2. Memoize - Cache expensive function results
const expensiveOperation = (n) => {
  // Simulate expensive calculation
  return n * n;
};
const memoizedOperation = FunctionHelper.memoize(expensiveOperation);
memoizedOperation(5); // Calculates first time
memoizedOperation(5); // Returns cached result

// 3. Debounce - Delay function execution
const handleSearch = (query) => {
  // API call or expensive operation
  console.log('Searching:', query);
};
const debouncedSearch = FunctionHelper.debounce(handleSearch, 300);
// User typing 'hello' quickly
debouncedSearch('h');
debouncedSearch('he');
debouncedSearch('hel');
debouncedSearch('hell');
debouncedSearch('hello'); // Only this one executes after 300ms

// 4. Throttle - Limit function execution rate
const handleScroll = () => {
  console.log('Scroll event');
};
const throttledScroll = FunctionHelper.throttle(handleScroll, 1000);
// Attach to scroll event
// window.addEventListener('scroll', throttledScroll);

// 5. Once - Ensure function runs only once
const initializeApp = () => {
  console.log('App initialized');
};
const initOnce = FunctionHelper.once(initializeApp);
initOnce(); // Logs 'App initialized'
initOnce(); // Does nothing

// 6. Retry - Attempt function multiple times
const unreliableAPI = async () => {
  if (Math.random() < 0.7) throw new Error('API failed');
  return 'Success';
};
const retryAPI = async () => {
  try {
    const result = await FunctionHelper.retry(unreliableAPI, 3, 1000);
    console.log('API Success:', result);
  } catch (error) {
    console.error('All retries failed');
  }
};

// 7. Pipe - Chain multiple functions
const addTwo = (x) => x + 2;
const multiplyByThree = (x) => x * 3;
const subtractOne = (x) => x - 1;
const pipeline = FunctionHelper.pipe(addTwo, multiplyByThree, subtractOne);
const result = pipeline(5); // ((5 + 2) * 3) - 1 = 20

// 8. Create Queue - Process tasks with concurrency control
const taskProcessor = async (task) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Processed task:', task);
};
const queue = FunctionHelper.createQueue(taskProcessor, 2);
queue.add('Task 1');
queue.add('Task 2');
queue.add('Task 3'); // Will wait until one of the first two tasks completes

// 9. Measure Time - Track function performance
const slowFunction = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return 'Done';
};
const measuredFunction = FunctionHelper.measureTime(slowFunction);
measuredFunction().then(({ result, duration }) => {
  console.log(`Result: ${result}, Duration: ${duration}ms`);
});
*/