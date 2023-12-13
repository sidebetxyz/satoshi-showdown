/**
 * @fileoverview Server configuration for Satoshi Showdown.
 * This main server module is responsible for the initial setup and lifecycle management of the application.
 * It involves setting up the HTTPS server, establishing database connections, implementing graceful shutdown procedures,
 * and configuring the environment. The module ensures that the application is properly initialized, connected,
 * and securely accessible.
 *
 * @requires dotenv: Configuration loader for environment variables.
 * @requires utils/databaseUtil: Utility for managing database connections.
 * @requires utils/httpsUtil: Utility for creating and configuring the HTTPS server.
 * @requires utils/signalUtil: Utility for handling OS signals and implementing graceful shutdown procedures.
 * @requires utils/serverUtil: Utility for initializing and configuring the Express application.
 * @requires utils/logUtil: Utility for logging application-wide messages and errors.
 */

require("dotenv").config({ path: "./configs/.env", debug: true });

console.log('Environment Variables:', {
  MONGODB_URI: process.env.MONGODB_URI,
  ENCRYPTION_SECRET_KEY: process.env.ENCRYPTION_SECRET_KEY,
  BLOCKCYPHER_TOKEN: process.env.BLOCKCYPHER_TOKEN,
  BLOCKCYPHER_BASE_URL: process.env.BLOCKCYPHER_BASE_URL,
  WEBHOOK_DOMAIN: process.env.WEBHOOK_DOMAIN,
  SSL_PRIVATE_KEY_PATH: process.env.SSL_PRIVATE_KEY_PATH,
  SSL_CERTIFICATE_PATH: process.env.SSL_CERTIFICATE_PATH,
  SESSION_SECRET: process.env.SESSION_SECRET,
  LOG_LEVEL: process.env.LOG_LEVEL
});

const { connectDatabase } = require("./utils/databaseUtil");
const { createServer } = require("./utils/httpsUtil");
const { setupShutdownHandlers } = require("./utils/signalUtil");
const { initializeServer } = require("./utils/serverUtil");
const log = require("./utils/logUtil");

/**
 * Initializes the Express application by setting up middleware, routes, and other necessary configurations.
 *
 * @returns {Express.Application} The configured Express application ready to handle incoming requests.
 */
const app = initializeServer();

/**
 * Initiates a connection to the database and handles any potential connection errors.
 * On a failed connection, the application logs the error and exits.
 */
connectDatabase().catch((err) => {
  log.error(`Database connection error: ${err.message}`);
  process.exit(1);
});

/**
 * Creates and configures the HTTPS server using the initialized Express application.
 * This server is responsible for handling all incoming HTTPS requests.
 *
 * @type {https.Server}
 */
const httpsServer = createServer(app);

/**
 * Retrieves the server port number from the environment variables, with a default value of 3000.
 * This port number is used for the HTTPS server to listen for incoming requests.
 *
 * @type {string|number}
 */
const port = process.env.PORT || 3000;

/**
 * Starts listening for incoming connections on the specified port.
 * On successful startup, it logs the server running message; on failure, it logs the error and exits.
 */
httpsServer
  .listen(port, () => {
    log.info(`Server running on https://localhost:${port}`);
  })
  .on("error", (err) => {
    log.error(`Failed to start HTTPS server: ${err.message}`);
    process.exit(1);
  });

/**
 * Sets up signal handlers for gracefully shutting down the server in response to operating system signals.
 * This is crucial for handling scenarios like process termination and restarts in a controlled manner.
 */
setupShutdownHandlers(httpsServer);

module.exports = app;
