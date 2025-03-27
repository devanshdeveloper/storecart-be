const dotenv = require("dotenv");
dotenv.config();

const getEnvVariable = (key, defaultValue = undefined) => {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    console.error(`❌ Environment variable ${key} is not defined`);
  }
  return value || defaultValue;
};

// Server Configuration
const HOST = getEnvVariable("HOST", "localhost");
const HTTPS_PORT = getEnvVariable("HTTPS_PORT", "5443");
const PORT = getEnvVariable("PORT", "5000");
const SERVER_URL = getEnvVariable("SERVER_URL", "https://localhost:5443/");
const NODE_ENV = getEnvVariable("NODE_ENV", "development");

// Database Configuration
const MONGODB_URI = getEnvVariable(
  "MONGODB_URI",
  "mongodb://localhost:27017/storecart"
);
const PROD_MONGODB_URI = getEnvVariable("PROD_MONGODB_URI");

// JWT Configuration
const JWT_SECRET = getEnvVariable(
  "JWT_SECRET",
  "your-super-secret-jwt-key-change-in-production"
);
const JWT_EXPIRES_IN = getEnvVariable("JWT_EXPIRES_IN", "7d");

// Email Service (Brevo/SendinBlue)
const SENDINBLUE_API_KEY = getEnvVariable("SENDINBLUE_API_KEY");
const DEFAULT_SENDER_EMAIL = getEnvVariable(
  "DEFAULT_SENDER_EMAIL",
  "info@storecart.com"
);
const DEFAULT_SENDER_NAME = getEnvVariable("DEFAULT_SENDER_NAME", "storecart");

// Frontend Integration
const FRONTEND_URL = getEnvVariable("FRONTEND_URL", "https://localhost:1234");

// File Upload Configuration
const UPLOAD_DIR = getEnvVariable("UPLOAD_DIR", "uploads");
const MAX_FILE_SIZE = parseInt(getEnvVariable("MAX_FILE_SIZE", "5242880")); // 5MB

// SSL Configuration
const SSL_KEY_PATH = getEnvVariable("SSL_KEY_PATH", "ssl/key.pem");
const SSL_CERT_PATH = getEnvVariable("SSL_CERT_PATH", "ssl/cert.pem");

// Security Configuration
const SALT_ROUNDS = parseInt(getEnvVariable("SALT_ROUNDS", "10"));
const CORS_ORIGIN = getEnvVariable("CORS_ORIGIN", "*");

// Rate Limiting
const RATE_LIMIT_WINDOW_MS = parseInt(
  getEnvVariable("RATE_LIMIT_WINDOW_MS", "900000")
); // 15 minutes
const RATE_LIMIT_MAX = parseInt(getEnvVariable("RATE_LIMIT_MAX", "100")); // 100 requests per window

// Seeding Configuration
const SEED_URL = getEnvVariable("SEED_URL", "http://localhost:5000");
const SEED_USER_ID = getEnvVariable("SEED_USER_ID", "");
const SEED_STOREFRONT_ID = getEnvVariable("SEED_STOREFRONT_ID", "");
const SEED_TOKEN = getEnvVariable("SEED_TOKEN", "");

module.exports = {
  HOST,
  HTTPS_PORT,
  PORT,
  SERVER_URL,
  NODE_ENV,
  MONGODB_URI,
  PROD_MONGODB_URI,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  SENDINBLUE_API_KEY,
  DEFAULT_SENDER_EMAIL,
  DEFAULT_SENDER_NAME,
  FRONTEND_URL,
  UPLOAD_DIR,
  MAX_FILE_SIZE,
  SSL_KEY_PATH,
  SSL_CERT_PATH,
  SALT_ROUNDS,
  CORS_ORIGIN,
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX,
  SEED_URL,
  SEED_USER_ID,
  SEED_STOREFRONT_ID,
  SEED_TOKEN,
};
