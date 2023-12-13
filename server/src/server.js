/**
 * @fileoverview Server configuration for Satoshi Showdown.
 * This module sets up the HTTPS server, establishes database connections,
 * implements graceful shutdown procedures, and ensures correct environment
 * configuration is loaded.
 *
 * @requires utils/envUtil: Utility for environment variable management.
 * @requires utils/databaseUtil: Database connection utilities.
 * @requires utils/httpsUtil: HTTPS server creation utility.
 * @requires utils/signalUtil: Utility for setting up graceful shutdown handlers.
 * @requires utils/serverUtil: Utility for initializing the Express application.
 * @requires utils/logUtil: Logging utility for application-wide logging.
 */

const { getEnv } = require("./utils/envUtil");
const { connectDatabase } = require("./utils/databaseUtil");
const { createServer } = require("./utils/httpsUtil");
const { setupShutdownHandlers } = require("./utils/signalUtil");
const { initializeServer } = require("./utils/serverUtil");
const log = require("./utils/logUtil");

/**
 * Initialize the Express server.
 *
 * @function
 * @returns {Express.Application} The configured Express application.
 */
const app = initializeServer();

/**
 * Connect to the database and handle any connection errors.
 *
 * @async
 */
connectDatabase().catch((err) => {
  /**
   * Database connection error handler.
   *
   * @callback
   * @param {Error} err - The database connection error.
   */
  log.error(`Database connection error: ${err.message}`);
  process.exit(1);
});

/**
 * Create and configure the HTTPS server.
 *
 * @type {https.Server}
 */
const httpsServer = createServer(app);

/**
 * Retrieve the server port from environment variables.
 *
 * @type {string|number}
 */
const port = getEnv("PORT", 3000);

/**
 * Start the HTTPS server and listen on the specified port.
 * Logs an error and exits if the server fails to start.
 */
httpsServer
  .listen(port, () => {
    /**
     * HTTPS server listening event handler.
     *
     * @callback
     */
    log.info(`Server running on https://localhost:${port}`);
  })
  .on("error", (err) => {
    /**
     * HTTPS server error event handler.
     *
     * @callback
     * @param {Error} err - The server startup error.
     */
    log.error(`Failed to start HTTPS server: ${err.message}`);
    process.exit(1);
  });

/**
 * Set up handlers for graceful shutdown of the server.
 */
setupShutdownHandlers(httpsServer);

module.exports = app;
