// server.js
/**
 * Server Configuration for Satoshi Showdown
 *
 * Initializes and configures the Express server for the Satoshi Showdown application.
 * Includes middleware setup for CORS, security, logging, and JSON parsing.
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
const { connectToDB, disconnectDB } = require("./utils/database");
const log = require("./utils/log");
const apiUtil = require("./utils/api"); // Importing the API utility

// Initialize Express Application
const app = express();

// Middleware Setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(helmet()); // Enhance API Security with Helmet
app.use(express.json()); // Body Parsing Middleware for JSON
app.use(morgan("dev")); // HTTP Request Logging

// Establish Database Connection
connectToDB();

// Define Root Route for Basic Health Check
app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

// Webhook Callback Endpoint
app.post("/webhooks", (req, res) => {
  try {
    // Process the callback data using the API utility
    apiUtil.processCallback(req.body);
    res.status(200).send("Webhook callback processed successfully");
  } catch (error) {
    log.error(`Error processing webhook callback: ${error.message}`);
    res.status(500).send("Error processing webhook callback");
  }
});

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
    });
};

// Signal Handling for Server Termination
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Export Express App for Testing Purposes
module.exports = app;
