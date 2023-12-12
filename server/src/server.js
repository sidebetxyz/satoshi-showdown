/**
 * @fileoverview Server configuration for Satoshi Showdown.
 * Configures the Express server, integrating middleware for CORS, security, logging,
 * and JSON parsing. Manages HTTPS server creation, database connections, and graceful
 * shutdown procedures. Ensures correct environment configuration is loaded.
 */

// Environment Configuration from Config Directory
require("dotenv").config({ path: "../configs/.env" });

// Core Node.js Modules
const fs = require("fs");
const https = require("https");

// Express and Custom Middleware
const express = require("express");
const corsSecurityMiddleware = require("./middlewares/corsSecurityMiddleware");
const httpSecurityMiddleware = require("./middlewares/httpSecurityMiddleware");
const jsonParserMiddleware = require("./middlewares/jsonParserMiddleware");
const requestLoggingMiddleware = require("./middlewares/requestLoggingMiddleware");

// Utilities and Custom Modules
const log = require("./utils/logUtil");
const { errorHandler } = require("./utils/errorUtil");
const { connectDatabase, disconnectDatabase } = require("./utils/databaseUtil");

// Route Modules
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

// Initialize Express Application
const app = express();

// Middleware Setup
app.use(corsSecurityMiddleware());
app.use(httpSecurityMiddleware());
app.use(jsonParserMiddleware());
app.use(requestLoggingMiddleware());

// Establish Database Connection
connectDatabase();

/**
 * Root route for basic health check.
 * @route GET /
 * @returns {string} 200 - Success response - "Server is running"
 */
app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

// Routes Setup
app.use("/user", userRoutes);
app.use("/event", eventRoutes);
app.use("/webhook", webhookRoutes);

// Global Error Handling
app.use(errorHandler);

// HTTPS Server Configuration
const privateKey = fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH, "utf8");
const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, "utf8");
const credentials = { key: privateKey, cert: certificate };
const port = process.env.PORT || 3000;

// Create and Start HTTPS Server
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => {
  log.info(`Server running on https://localhost:${port}`);
});

/**
 * Graceful shutdown function for the server.
 * Closes the database connection and shuts down the HTTPS server.
 */
const gracefulShutdown = () => {
  log.info("Initiating graceful shutdown.");
  disconnectDatabase()
    .then(() => httpsServer.close(() => log.info("Server has been shut down")))
    .catch((err) => log.error(`Error during shutdown: ${err.message}`));
};

// Signal Handling for Server Termination
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Export Express App for Testing Purposes
module.exports = app;
