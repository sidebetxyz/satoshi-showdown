// middlewareUtil.js
const log = require("./logUtil");

// Importing middleware functions from the middlewares folder
const corsSecurityMiddleware = require("../middlewares/corsSecurityMiddleware");
const httpSecurityMiddleware = require("../middlewares/httpSecurityMiddleware");
const jsonParserMiddleware = require("../middlewares/jsonParserMiddleware");
const requestLoggingMiddleware = require("../middlewares/requestLoggingMiddleware");

/**
 * Applies all middleware to the provided Express application.
 *
 * @param {Express} app - The Express application to which middleware will be applied.
 */
const applyMiddlewares = (app) => {
  app.use(corsSecurityMiddleware());
  app.use(httpSecurityMiddleware());
  app.use(jsonParserMiddleware());
  app.use(requestLoggingMiddleware());

  log.info("All middlewares have been applied.");
};

module.exports = { applyMiddlewares };
