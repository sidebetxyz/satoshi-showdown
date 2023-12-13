/**
 * @fileoverview Middleware for logging HTTP requests.
 * Implements the Morgan logger for detailed request logging.
 *
 * @see {@link https://github.com/expressjs/morgan} for more information on Morgan.
 */

const morgan = require("morgan");
const logUtil = require("../utils/logUtil"); // Adjust path as necessary

/**
 * Configures and returns the Morgan middleware for request logging.
 *
 * @return {Function} Middleware function for HTTP request logging.
 */
const requestLoggingMiddleware = () => {
  // Customize format and options as needed
  return morgan("combined", { stream: logUtil.stream });
};

module.exports = requestLoggingMiddleware;
