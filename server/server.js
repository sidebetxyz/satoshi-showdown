/**
 * @fileoverview Server configuration for Satoshi Showdown.
 * Sets up and configures the Express server, including middleware for CORS,
 * security, logging, JSON parsing, and global error handling.
 * Manages HTTPS server creation, database connections, and graceful shutdown procedures.
 * Adds session management using express-session.
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
const session = require("express-session");

// Utilities and Custom Modules
const log = require("./utils/logUtil");
const { errorHandler } = require("./utils/errorUtil");
const { connectDatabase, disconnectDatabase } = require("./utils/databaseUtil");

// Route Modules
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

// Initialize Express Application
const app = express();

// Middleware Setup
app.use(cors()); // Enables Cross-Origin Resource Sharing (CORS)
app.use(helmet()); // Applies various security headers to HTTP responses
app.use(express.json()); // Parses incoming JSON payloads
app.use(morgan("combined", { stream: log.stream })); // Logs HTTP requests

// Session Middleware Setup
app.use(session({
  secret: process.env.SESSION_SECRET, // Secret key for session hashing
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something stored
  cookie: {
    httpOnly: true, // Prevents client-side JS from reading the cookie 
    maxAge: 24 * 60 * 60 * 1000 // Set cookie expiration time (e.g., 1 day)
  }
}));

// Establish Database Connection
connectDatabase();

/**
 * Root route for basic health check.
 * @route GET /
 * @returns {string} 200 - success response - "Server is running"
 */
app.get("/", (req, res) => res.status(200).send("Server is running"));

// Routes Setup
app.use('/user', userRoutes); // Mount user routes
app.use('/event', eventRoutes); // Mount event routes
app.use('/webhook', webhookRoutes); // Mount webhook routes

// Global Error Handling
app.use(errorHandler); // Custom error handling middleware

// HTTPS Server Configuration
const privateKey = fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH, "utf8");
const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, "utf8");
const credentials = { key: privateKey, cert: certificate };
const port = process.env.PORT || 3000;

// Create and Start HTTPS Server
const httpsServer = https.createServer(credentials, app);
httpsServer.listen(port, () => log.info(`Server running on https://localhost:${port}`));

/**
 * Graceful shutdown function for the server.
 * Closes the database connection and shuts down the HTTPS server.
 */
const gracefulShutdown = () => {
  log.info("Initiating graceful shutdown.");
  disconnectDatabase()
    .then(() => httpsServer.close(() => log.info("Server has been shut down")))
    .catch(err => log.error(`Error during shutdown: ${err.message}`));
};

// Signal Handling for Server Termination
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Export Express App for Testing Purposes
module.exports = app;
