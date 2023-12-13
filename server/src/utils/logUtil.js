/**
 * @fileoverview Logging Utility for Satoshi Showdown.
 * This module configures and provides a logging utility for the application,
 * utilizing the Winston library. It defines custom logging levels, formats,
 * and sets up transports for outputting logs. The custom format combines timestamps
 * and message content for clarity. The logger also provides a stream for integrating
 * with middleware like morgan to facilitate logging HTTP requests and responses.
 *
 * The logger can be easily extended by adding additional transports, such as file transport,
 * for different log output needs. The utility is designed to be modular and flexible,
 * suitable for use across different parts of the application.
 *
 * @module utils/logUtil
 * @requires winston - The Winston logging library for versatile and robust logging capabilities.
 */

const winston = require("winston");

/**
 * Custom logging levels for the application.
 * These levels define the severity of log messages and allow for filtering
 * based on importance and type. The structure follows a hierarchy where
 * each level includes the levels above it (error includes warn, info includes http, etc.).
 * @type {Object}
 */
const logLevels = {
  error: 0, // For critical errors and failures that need immediate attention.
  warn: 1, // For warning messages that indicate potential issues.
  info: 2, // For general informational messages about system operations.
  http: 3, // For HTTP-related messages, useful for tracking request and response cycles.
  debug: 4, // For detailed debugging information, helpful during development.
};

/**
 * Custom log format.
 * This format enhances log readability by combining a timestamp indicating the time of log generation
 * and a printf format for displaying the log level and message content.
 * @type {winston.Logform.Format}
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), // Timestamp format for logs.
  winston.format.printf(
    (info) =>
      `[${info.timestamp}][${info.level.toUpperCase()}] ${info.message}`, // Structuring log messages.
  ),
);

/**
 * Transport mechanisms for logging.
 * Defines how logs are outputted. By default, logs are written to the console,
 * but this array can be expanded to include file transports or other means of logging,
 * catering to various environments and requirements.
 * @type {winston.transport[]}
 */
const logTransports = [new winston.transports.Console()];

/**
 * Creates and configures a Winston logger instance.
 * The logger is configured with the specified levels, format, and transports to ensure
 * consistent and effective logging across the application. The log level can be dynamically
 * set using environment variables, allowing for easy adjustment in different environments.
 * @type {winston.Logger}
 */
const log = winston.createLogger({
  level: process.env.LOG_LEVEL || "debug", // Default to 'debug' if LOG_LEVEL is not set.
  levels: logLevels,
  format: logFormat,
  transports: logTransports,
});

/**
 * Stream object for integrating the logger with other middleware.
 * This stream is primarily used for logging HTTP requests and responses,
 * allowing middleware like morgan to seamlessly output logs using this logger.
 * The stream ensures that all HTTP logs are consistently formatted and managed.
 * @property {Object} stream - The stream object.
 * @property {function} stream.write - Writes a log message at the HTTP level.
 * @param {string} message - Log message to be written.
 * @returns {void}
 */
log.stream = {
  write: (message) => log.http(message.trim()),
};

module.exports = log;
