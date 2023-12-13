/**
 * @fileoverview Server Initialization Utility for Satoshi Showdown.
 * Handles the initialization and configuration of the Express application.
 *
 * @requires express: Express framework for building the server.
 * @requires utils/middlewareUtil: Centralized middleware application utility.
 * @requires utils/routeUtil: Utility for centralizing route handling.
 * @requires utils/errorUtil: Error handling utilities including custom error classes.
 */

const express = require("express");
const { applyMiddlewares } = require("./middlewareUtil");
const { applyRoutes } = require("./routeUtil");
const { errorHandler } = require("./errorUtil");

/**
 * Initializes and configures the Express application.
 * @return {express.Application} The configured Express application.
 */
const initializeServer = () => {
  const app = express();

  applyMiddlewares(app);
  applyRoutes(app);
  app.use(errorHandler);

  return app;
};

module.exports = { initializeServer };
