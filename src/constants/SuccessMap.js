const SuccessMap = {
  // Authentication Success Messages
  LOGIN_SUCCESS: {
    name: "LOGIN_SUCCESS",
    statusCode: 200,
    message: "User logged in successfully.",
  },
  LOGOUT_SUCCESS: {
    name: "LOGOUT_SUCCESS",
    statusCode: 200,
    message: "User logged out successfully.",
  },
  PASSWORD_RESET_SUCCESS: {
    name: "PASSWORD_RESET_SUCCESS",
    statusCode: 200,
    message: "Password has been reset successfully.",
  },
  ACCOUNT_CREATED: {
    name: "ACCOUNT_CREATED",
    statusCode: 201,
    message: "User account created successfully.",
  },
  ACCOUNT_VERIFIED: {
    name: "ACCOUNT_VERIFIED",
    statusCode: 200,
    message: "User account verified successfully.",
  },
  EMAIL_UPDATED: {
    name: "EMAIL_UPDATED",
    statusCode: 200,
    message: "Email address updated successfully.",
  },
  PROFILE_UPDATED: {
    name: "PROFILE_UPDATED",
    statusCode: 200,
    message: "User profile updated successfully.",
  },
  TWO_FACTOR_ENABLED: {
    name: "TWO_FACTOR_ENABLED",
    statusCode: 200,
    message: "Two-factor authentication enabled successfully.",
  },
  TWO_FACTOR_DISABLED: {
    name: "TWO_FACTOR_DISABLED",
    statusCode: 200,
    message: "Two-factor authentication disabled successfully.",
  },

  // Database Operations
  DATA_RETRIEVED: {
    name: "DATA_RETRIEVED",
    statusCode: 200,
    message: "Data retrieved successfully.",
  },
  DATA_SAVED: {
    name: "DATA_SAVED",
    statusCode: 201,
    message: "Data saved successfully.",
  },
  DATA_UPDATED: {
    name: "DATA_UPDATED",
    statusCode: 200,
    message: "Data updated successfully.",
  },
  DATA_DELETED: {
    name: "DATA_DELETED",
    statusCode: 200,
    message: "Data deleted successfully.",
  },
  RECORD_ARCHIVED: {
    name: "RECORD_ARCHIVED",
    statusCode: 200,
    message: "Record archived successfully.",
  },
  RECORD_RESTORED: {
    name: "RECORD_RESTORED",
    statusCode: 200,
    message: "Record restored successfully.",
  },

  // File Operations
  FILE_UPLOADED: {
    name: "FILE_UPLOADED",
    statusCode: 201,
    message: "File uploaded successfully.",
  },
  FILE_DOWNLOADED: {
    name: "FILE_DOWNLOADED",
    statusCode: 200,
    message: "File downloaded successfully.",
  },
  FILE_DELETED: {
    name: "FILE_DELETED",
    statusCode: 200,
    message: "File deleted successfully.",
  },
  FILE_RENAMED: {
    name: "FILE_RENAMED",
    statusCode: 200,
    message: "File renamed successfully.",
  },
  FILE_SHARED: {
    name: "FILE_SHARED",
    statusCode: 200,
    message: "File shared successfully.",
  },

  // Payment Transactions
  PAYMENT_PROCESSED: {
    name: "PAYMENT_PROCESSED",
    statusCode: 200,
    message: "Payment processed successfully.",
  },
  PAYMENT_REFUNDED: {
    name: "PAYMENT_REFUNDED",
    statusCode: 200,
    message: "Payment refunded successfully.",
  },
  SUBSCRIPTION_CREATED: {
    name: "SUBSCRIPTION_CREATED",
    statusCode: 201,
    message: "Subscription created successfully.",
  },
  SUBSCRIPTION_CANCELED: {
    name: "SUBSCRIPTION_CANCELED",
    statusCode: 200,
    message: "Subscription canceled successfully.",
  },
  INVOICE_GENERATED: {
    name: "INVOICE_GENERATED",
    statusCode: 201,
    message: "Invoice generated successfully.",
  },

  // General Success Messages
  REQUEST_SUCCESS: {
    name: "REQUEST_SUCCESS",
    statusCode: 200,
    message: "Request completed successfully.",
  },
  OPERATION_SUCCESS: {
    name: "OPERATION_SUCCESS",
    statusCode: 200,
    message: "Operation executed successfully.",
  },
  RESOURCE_CREATED: {
    name: "RESOURCE_CREATED",
    statusCode: 201,
    message: "New resource created successfully.",
  },
  EMAIL_SENT: {
    name: "EMAIL_SENT",
    statusCode: 200,
    message: "Email sent successfully.",
  },
  NOTIFICATION_SENT: {
    name: "NOTIFICATION_SENT",
    statusCode: 200,
    message: "Notification sent successfully.",
  },
  CACHE_CLEARED: {
    name: "CACHE_CLEARED",
    statusCode: 200,
    message: "Cache cleared successfully.",
  },
};

module.exports = SuccessMap;
