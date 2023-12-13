/**
 * @fileoverview Middleware Utility for Satoshi Showdown.
 * This module provides a function to apply a set of middleware to the Express application.
 * It centralizes the inclusion of various middleware ensuring consistent application across the application.
 * This includes middleware for CORS, security, JSON parsing, request logging, and error handling.
 *
 * @module utils/middlewareUtil
 * @requires middlewares/corsSecurityMiddleware - Middleware for handling CORS (Cross-Origin Resource Sharing).
 * @requires middlewares/httpSecurityMiddleware - Middleware for setting various HTTP headers for security.
 * @requires middlewares/jsonParserMiddleware - Middleware for parsing JSON request bodies.
 * @requires middlewares/requestLoggingMiddleware - Middleware for logging HTTP requests.
 * @requires middlewares/errorHandlerMiddleware - Middleware for handling errors in the application.
 * @requires utils/logUtil - Logging utility for application-wide logging.
 */

const corsSecurityMiddleware = require("../middlewares/corsSecurityMiddleware");
const httpSecurityMiddleware = require("../middlewares/httpSecurityMiddleware");
const jsonParserMiddleware = require("../middlewares/jsonParserMiddleware");
const requestLoggingMiddleware = require("../middlewares/requestLoggerMiddleware");
const errorHandlerMiddleware = require("../middlewares/errorHandlerMiddleware");
const log = require("./logUtil");

/**
 * Applies a predefined set of middleware to an Express application.
 * Ensures that essential middleware are added in a consistent order for optimal functionality and security.
 *
 * @function applyMiddlewares
 * @param {express.Application} app - The Express application to which middleware will be applied.
 */
const applyMiddlewares = (app) => {
  app.use(corsSecurityMiddleware());
  app.use(httpSecurityMiddleware());
  app.use(jsonParserMiddleware());
  app.use(requestLoggingMiddleware());
  app.use(errorHandlerMiddleware);

  log.info("All middlewares have been applied.");
};

module.exports = { applyMiddlewares };
