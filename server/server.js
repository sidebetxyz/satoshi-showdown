// server.js
/**
 * Server Configuration for Satoshi Showdown
 *
 * Initializes and configures the Express server for the Satoshi Showdown application.
 * Includes middleware setup for CORS, security, logging, JSON parsing, and global error handling.
 * Manages HTTPS server creation, database connections, and graceful shutdown procedures.
 */

// Environment Configuration
require("dotenv").config();

// Core Node.js Modules
const fs = require("fs");
const https = require("https");

// Express and Related Middleware
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Utilities and Custom Modules
const log = require("./utils/logUtil");
const { errorHandler } = require("./utils/errorUtil");
const { connectToDB, disconnectDB } = require("./utils/databaseUtil");

// Initialize Express Application
const app = express();

// Middleware Setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(helmet()); // Enhance API Security with Helmet
app.use(express.json()); // Body Parsing Middleware for JSON
app.use(morgan("combined", { stream: log.stream })); // HTTP Request Logging

// Establish Database Connection
connectToDB();

// Define Root Route for Basic Health Check
app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

// Webhook Callback Endpoint
app.post("/webhook", (req, res, next) => {
  // Process webhook callback data here
  // Placeholder for callback processing logic
  // For any errors, pass them to next() to be handled by errorHandler
  // res.status(200).send("Webhook callback processed successfully");
  // In case of errors:
  // next(new Error('Webhook processing failed'));
});

// Global Error Handling
app.use(errorHandler); // Custom Error Handling Middleware

// HTTPS Server Setup
const privateKey = fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH, "utf8");
const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, "utf8");
const credentials = { key: privateKey, cert: certificate };
const port = process.env.PORT || 3000;

// Create and Start HTTPS Server
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
  log.info(`Server running on https://localhost:${port}`);
});

// Graceful Shutdown Handling
const gracefulShutdown = () => {
  log.info("Initiating graceful shutdown.");
  disconnectDB()
    .then(() => {
      httpsServer.close(() => {
        log.info("Server has been shut down.");
      });
    })
    .catch((err) => {
      log.error(`Error during shutdown: ${err.message}`);
      // Note: errorHandler is not used here as this is outside the scope of Express middleware
    });
};

// Signal Handling for Server Termination
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Export Express App for Testing Purposes
module.exports = app;
