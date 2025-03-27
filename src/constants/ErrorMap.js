const ErrorMap = {
  // Authentication Errors
  BAD_REQUEST: {
    name: "BAD_REQUEST",
    status: 400,
    message:
      "The server could not process the request due to client-side errors or missing parameters.",
  },
  UNAUTHORIZED: {
    name: "UNAUTHORIZED",
    status: 401,
    message:
      "Access denied. Invalid credentials or expired authentication token.",
  },
  FORBIDDEN: {
    name: "FORBIDDEN",
    status: 403,
    message: "You lack the necessary permissions to access this resource.",
  },
  JWT_EXPIRED: {
    name: "JWT_EXPIRED",
    status: 401,
    message: "Your authentication token has expired. Please log in again.",
  },
  JWT_INVALID: {
    name: "JWT_INVALID",
    status: 401,
    message:
      "Your authentication token is invalid. Please provide a valid token.",
  },
  JWT_MISSING: {
    name: "JWT_MISSING",
    status: 401,
    message: "No authentication token provided. Authorization required.",
  },
  USER_NOT_FOUND: {
    name: "USER_NOT_FOUND",
    status: 404,
    message: "User not found.",
  },
  INVALID_AUTH_STATE: {
    name: "INVALID_AUTH_STATE",
    status: 401,
    message: "Invalid current auth state",
  },
  EMAIL_ALREADY_EXISTS: {
    name: "EMAIL_ALREADY_EXISTS",
    status: 409,
    message: "Email already exists.",
  },
  ACCOUNT_LOCKED: {
    name: "ACCOUNT_LOCKED",
    status: 403,
    message:
      "Your account has been locked due to multiple failed login attempts.",
  },
  INCORRECT_PASSWORD: {
    name: "INCORRECT_PASSWORD",
    status: 401,
    message: "Incorrect password. Please try again.",
  },
  PASSWORD_RESET_REQUIRED: {
    name: "PASSWORD_RESET_REQUIRED",
    status: 403,
    message: "Password reset is required before accessing the account.",
  },

  // Database Errors
  MONGODB_ERROR: {
    name: "MONGODB_ERROR",
    status: 500,
    message: "A database operation failed due to an internal error.",
  },
  MONGODB_DUPLICATE_KEY: {
    name: "MONGODB_DUPLICATE_KEY",
    status: 409,
    message: "A duplicate key error occurred in the database.",
  },
  MONGODB_CONNECTION_FAILED: {
    name: "MONGODB_CONNECTION_FAILED",
    status: 500,
    message: "Failed to connect to the database.",
  },
  MONGODB_VALIDATION_FAILED: {
    name: "MONGODB_VALIDATION_FAILED",
    status: 422,
    message: "Validation error occurred while processing the database request.",
  },

  // Storage Errors
  S3_UPLOAD_FAILED: {
    name: "S3_UPLOAD_FAILED",
    status: 500,
    message: "An error occurred while uploading the file to S3 storage.",
  },
  S3_DOWNLOAD_FAILED: {
    name: "S3_DOWNLOAD_FAILED",
    status: 500,
    message: "An error occurred while retrieving the file from S3 storage.",
  },
  S3_FILE_NOT_FOUND: {
    name: "S3_FILE_NOT_FOUND",
    status: 404,
    message: "The requested file does not exist in the S3 bucket.",
  },
  S3_PERMISSION_DENIED: {
    name: "S3_PERMISSION_DENIED",
    status: 403,
    message: "Insufficient permissions to access the S3 bucket.",
  },

  // Rate Limiting & Service Availability
  RATE_LIMIT_EXCEEDED: {
    name: "RATE_LIMIT_EXCEEDED",
    status: 429,
    message: "Too many requests have been made. Please try again later.",
  },
  SERVICE_UNAVAILABLE: {
    name: "SERVICE_UNAVAILABLE",
    status: 503,
    message: "The service is temporarily unavailable. Please try again later.",
  },
  DEPENDENCY_FAILURE: {
    name: "DEPENDENCY_FAILURE",
    status: 502,
    message: "A required dependency failed to respond in time.",
  },

  // Validation Errors
  UNPROCESSABLE_ENTITY: {
    name: "UNPROCESSABLE_ENTITY",
    status: 422,
    message:
      "The request was syntactically correct but contained invalid or unprocessable data.",
  },
  VALIDATION_ERROR: {
    name: "VALIDATION_ERROR",
    status: 422,
    message:
      "The request contains invalid or unprocessable data. Please verify the input and try again.",
  },

  INVALID_FILE_FORMAT: {
    name: "INVALID_FILE_FORMAT",
    status: 415,
    message: "The uploaded file format is not supported.",
  },
  REQUEST_TOO_LARGE: {
    name: "REQUEST_TOO_LARGE",
    status: 413,
    message: "The request payload exceeds the allowed limit.",
  },

  //INVALID_PROMO 
  INVALID_PROMO: {
    name: "INVALID_PROMO",
    status: 400,
    message: "The promo code is invalid.", 
  },

  // General Errors
  NOT_FOUND: {
    name: "NOT_FOUND",
    status: 404,
    message: "The requested resource could not be located on the server.",
  },
  CONFLICT: {
    name: "CONFLICT",
    status: 409,
    message: "The request conflicts with the current state of the resource.",
  },
  SERVER_ERROR: {
    name: "SERVER_ERROR",
    status: 500,
    message: "An internal server error occurred. Please try again later.",
  },
};

module.exports = ErrorMap;
