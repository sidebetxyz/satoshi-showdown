/**
 * @fileoverview Signal Utility for Satoshi Showdown.
 * This module provides a utility function for setting up signal handlers for graceful shutdown
 * of the Node.js process. It specifically handles SIGTERM and SIGINT signals to ensure that
 * the application shuts down gracefully, including closing database connections and the server.
 *
 * @module utils/signalUtil
 * @requires utils/logUtil - Logging utility for application-wide logging.
 * @requires utils/databaseUtil - Utility for managing database connections.
 */

const log = require("./logUtil");
const { disconnectDatabase } = require("./databaseUtil");

/**
 * Sets up handlers for system signals for graceful shutdown of the server.
 * Registers handlers for SIGTERM and SIGINT signals, ensuring that the application
 * can close database connections and the server itself gracefully.
 *
 * @function setupShutdownHandlers
 * @param {http.Server|https.Server} server - The HTTP or HTTPS server instance to be shut down.
 */
const setupShutdownHandlers = (server) => {
  const shutdown = async (signal) => {
    log.info(`Received ${signal}, shutting down gracefully.`);
    try {
      await disconnectDatabase();
      server.close(() => {
        log.info("Server shut down.");
      });
    } catch (err) {
      log.error(`Error during shutdown: ${err.message}`);
    }
  };

  // Registering shutdown handlers for system signals
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

module.exports = { setupShutdownHandlers };
