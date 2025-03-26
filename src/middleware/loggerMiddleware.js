const logger = require("../helpers/LogHelper");

const loggerMiddleware = () => {
  return (req, res, next) => {
    // Capture request start time
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    // Log the incoming request with a single, concise statement
    logger.info(`🚀 ${req.method} ${req.originalUrl} from ${req.ip} [${requestId}]`);

    // Store the original end function
    const originalEnd = res.end;

    // Override the end function to capture response data
    res.end = function (chunk, encoding) {
      // Calculate response time
      const responseTime = Date.now() - startTime;

      // Restore the original end function
      res.end = originalEnd;

      // Call the original end function
      res.end(chunk, encoding);

      // Determine log level and emoji based on status code
      const statusCode = res.statusCode;
      let logLevel, emoji;
      if (statusCode >= 500) {
        logLevel = "error";
        emoji = "❌";
      } else if (statusCode >= 400) {
        logLevel = "warn";
        emoji = "⚠️";
      } else {
        logLevel = "info";
        emoji = "✅";
      }

      // Create the log message with essential info only
      const logMessage = `${emoji} ${req.method} ${req.originalUrl} ${statusCode} [${responseTime}ms]`;

      // Log using appropriate level
      logger[logLevel](logMessage);
    };

    // Continue to next middleware
    next();
  };
};

module.exports = loggerMiddleware;
