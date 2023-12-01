/**
 * Server Configuration for Satoshi Showdown
 *
 * This server setup includes configuring HTTPS, connecting to the MongoDB database,
 * and setting up essential middlewares for security and performance. The server
 * also handles graceful shutdown to ensure proper closure of database connections.
 */

// Environment Variables: Load at the beginning for configuration settings
require("dotenv").config();

// Module Imports: Essential modules and utilities for server setup
const express = require("express");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { connectToDB, disconnectDB } = require("./utils/database");

// Express Application Initialization
const app = express();

// Middlewares Setup: Enhance security, enable CORS, and handle JSON requests
app.use(cors()); // Enable CORS for cross-origin resource sharing
app.use(helmet()); // Secure the app by setting various HTTP headers
app.use(express.json()); // Parse incoming JSON payloads
app.use(morgan("dev")); // HTTP request logging

// Root Route: Basic health check endpoint
app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

// Database Connection: Connect to MongoDB
connectToDB();

// SSL Configuration: Read SSL certificate files for HTTPS setup
const privateKey = fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH, "utf8");
const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, "utf8");
const credentials = { key: privateKey, cert: certificate };

// HTTPS Server Initialization: Start the server with SSL credentials
const httpsServer = https.createServer(credentials, app);
const port = process.env.PORT || 3000;
httpsServer.listen(port, () => {
  console.log(`Server running on https://localhost:${port}`);
});

// Graceful Shutdown Function: Ensures clean disconnection from the database
const gracefulShutdown = () => {
  console.log("Shutting down gracefully.");
  httpsServer.close(async () => {
    console.log("Closed out remaining connections.");
    await disconnectDB(); // Disconnect from database
    process.exit(0);
  });

  // Force shutdown if graceful shutdown fails
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

// Process Signals Handling: Listen for termination signals for graceful shutdown
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Export the Express app for testing purposes
module.exports = app;
