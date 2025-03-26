const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const https = require("https");
const http = require("http");
const {
  MongoDBHelper,
  ResponseHelper,
  SSLHelper,
} = require("./helpers/index.js");
const logger = require("./helpers/LogHelper.js");
const loggerMiddleware = require("./middleware/loggerMiddleware");
const AuthenticatedRoutes = require("./routes/AuthenticalRoutes.js");
const UnauthenticatedRoutes = require("./routes/UnauthenticalRoutes.js");

// Import routes

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(loggerMiddleware());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize MongoDB Helper
const mongoDBHelper = new MongoDBHelper();

// Initialize server
async function startServer() {
  try {
    await mongoDBHelper.connect();

    const HTTP_PORT = process.env.PORT || 5000;
    const HTTPS_PORT = process.env.HTTPS_PORT || 5443;
    const HOST = process.env.HOST || "localhost";

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Create HTTPS server with SSL certificates
    let httpsServer;
    try {
      const sslConfig = SSLHelper.getSSLConfig();
      httpsServer = https.createServer(sslConfig, app);
      httpsServer.listen(HTTPS_PORT, () => {
        logger.info(`🔒 HTTPS Server running on https://${HOST}:${HTTPS_PORT}`);
      });
    } catch (error) {
      logger.error(
        `❌ Failed to start HTTPS server on https://${HOST}:${HTTPS_PORT} : ${error.message}`
      );
    }

    // Start both servers
    httpServer.listen(HTTP_PORT, () => {
      logger.info(`🚀 HTTP Server running on http://${HOST}:${HTTP_PORT}`);
    });
  } catch (error) {
    logger.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Received SIGINT signal. Initiating graceful shutdown...");
  try {
    await mongoDBHelper.disconnect();
    logger.info("Successfully disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    logger.error("Error during graceful shutdown", { error: error.message });
    process.exit(1);
  }
});

// Configure static file serving for uploads
app.use('/uploads', express.static('uploads'));

// Configure routes

app.use("/", require("./features/index/index.route.js"));

// Mount unauthenticated routes
app.use("/api", UnauthenticatedRoutes);

// Mount authenticated routes with auth middleware
app.use("/api", AuthenticatedRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const responseHelper = new ResponseHelper(res);

  // Log error with detailed context
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.id,
    userId: req.user?.id,
    body: req.body,
    query: req.query,
    headers: req.headers,
  });

  // Send standardized error response
  responseHelper.error(err).send();
});

// const expressHelper = new ExpressHelper(app);
// expressHelper.extractRoutesFromServer({collectionName : "Storecart"});
// Start the server
startServer();
