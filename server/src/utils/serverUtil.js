/**
 * @fileoverview Server Initialization Utility for Satoshi Showdown.
 * This module is responsible for initializing and configuring the Express application.
 * It applies centralized middleware, sets up routes, and configures error handling,
 * thereby preparing the Express server for operation.
 *
 * @module utils/serverUtil
 * @requires express - Express framework for building the server.
 * @requires utils/middlewareUtil - Utility for applying a set of middlewares to the Express application.
 * @requires utils/routeUtil - Utility for applying a set of routes to the Express application.
 * @requires utils/errorUtil - Utility providing error handling middleware.
 */

const express = require("express");
const { applyMiddlewares } = require("./middlewareUtil");
const { applyRoutes } = require("./routeUtil");
const { errorHandler } = require("./errorUtil");

/**
 * Initializes and configures the Express application.
 * Applies middlewares, routes, and error handling to the application.
 *
 * @function initializeServer
 * @return {express.Application} The configured Express application instance.
 */
const initializeServer = () => {
  const app = express();

  // Apply middlewares to the app
  applyMiddlewares(app);

  // Apply routes to the app
  applyRoutes(app);

  // Apply error handling middleware
  app.use(errorHandler);

  return app;
};

module.exports = { initializeServer };
