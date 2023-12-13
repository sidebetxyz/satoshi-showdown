/**
 * @fileoverview Request Logger Middleware for Satoshi Showdown.
 * This middleware integrates Morgan, a popular HTTP request logger, to log detailed information
 * about incoming HTTP requests. It is instrumental for monitoring, debugging, and analyzing
 * network activity within the application. By logging request data, this middleware assists
 * in identifying issues, understanding traffic patterns, and maintaining robust network security.
 *
 * @module middlewares/requestLoggerMiddleware
 * @requires morgan - HTTP request logger middleware for Node.js, used for logging request details.
 * @requires utils/logUtil - Logging utility that provides a stream interface for Morgan, enabling it to log via the application's centralized logger.
 * @see {@link https://github.com/expressjs/morgan} for Morgan's official documentation and usage examples.
 */

const morgan = require("morgan");
const logUtil = require("../utils/logUtil");

/**
 * Configures and returns Morgan middleware for detailed HTTP request logging.
 * Utilizes a pre-defined 'combined' format that includes essential request details like method, URL, status, response time, etc.
 * The logging output is directed to the application's central logging system via logUtil's stream interface, ensuring
 * consistent log formatting and management. This middleware can be customized further to suit specific logging needs
 * or preferences, such as different formats or conditional logging.
 *
 * @function requestLoggerMiddleware
 * @return {Function} Middleware function for HTTP request logging. Configured to use the 'combined' log format and the application's log stream.
 */
const requestLoggerMiddleware = () => {
  // Morgan setup with 'combined' format and application's log stream
  return morgan("combined", { stream: logUtil.stream });
};

module.exports = requestLoggerMiddleware;
