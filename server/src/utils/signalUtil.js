// signalUtil.js
const log = require("./logUtil");
const { disconnectDatabase } = require("./databaseUtil");

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

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

module.exports = { setupShutdownHandlers };
