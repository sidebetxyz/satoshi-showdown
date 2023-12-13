/**
 * @fileoverview Middleware Utility for Satoshi Showdown.
 * This module provides a utility function to apply a set of middleware to the Express application.
 * It centralizes the inclusion of various middleware to ensure that they are consistently applied
 * across the application. This includes middleware for CORS, security, JSON parsing, and request logging.
 *
 * @module utils/middlewareUtil
 * @requires utils/logUtil - Logging utility for application-wide logging.
 * @requires middlewares/corsSecurityMiddleware - Middleware for handling CORS (Cross-Origin Resource Sharing).
 * @requires middlewares/httpSecurityMiddleware - Middleware for setting various HTTP headers for security.
 * @requires middlewares/jsonParserMiddleware - Middleware for parsing JSON request bodies.
 * @requires middlewares/requestLoggingMiddleware - Middleware for logging HTTP requests.
 */

const log = require("./logUtil");
const corsSecurityMiddleware = require("../middlewares/corsSecurityMiddleware");
const httpSecurityMiddleware = require("../middlewares/httpSecurityMiddleware");
const jsonParserMiddleware = require("../middlewares/jsonParserMiddleware");
const requestLoggingMiddleware = require("../middlewares/requestLoggerMiddleware");

/**
 * Applies a predefined set of middleware to an Express application.
 * This function simplifies the process of adding essential middleware to the app,
 * ensuring that they are added in a consistent order.
 *
 * @function applyMiddlewares
 * @param {express.Application} app - The Express application to which middleware will be applied.
 */
const applyMiddlewares = (app) => {
  app.use(corsSecurityMiddleware());
  app.use(httpSecurityMiddleware());
  app.use(jsonParserMiddleware());
  app.use(requestLoggingMiddleware());

  log.info("All middlewares have been applied.");
};

module.exports = { applyMiddlewares };
