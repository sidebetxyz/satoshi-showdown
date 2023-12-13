/**
 * @fileoverview Server configuration for Satoshi Showdown.
 * Sets up HTTPS server, database connections, graceful shutdown procedures,
 * and ensures correct environment configuration is loaded.
 *
 * @requires utils/envUtil: Utility for environment variable management.
 * @requires utils/logUtil: Logging utility for application-wide logging.
 * @requires utils/databaseUtil: Database connection utilities.
 * @requires utils/httpsUtil: HTTPS server creation utility.
 * @requires utils/signalUtil: Utility for setting up graceful shutdown handlers.
 * @requires utils/serverUtil: Utility for initializing the Express application.
 */

const log = require("./utils/logUtil");
const { getEnv } = require("./utils/envUtil");
const { connectDatabase } = require("./utils/databaseUtil");
const { createServer } = require("./utils/httpsUtil");
const { setupShutdownHandlers } = require("./utils/signalUtil");
const { initializeServer } = require("./utils/serverUtil");

const app = initializeServer();

connectDatabase().catch((err) => {
  log.error(`Database connection error: ${err.message}`);
  process.exit(1);
});

const httpsServer = createServer(app);
const port = getEnv("PORT", 3000);
httpsServer.listen(port, () => {
  log.info(`Server running on https://localhost:${port}`);
});

setupShutdownHandlers(httpsServer);

module.exports = app;
