/**
 * @fileoverview Logging Utility for Satoshi Showdown.
 * Manages application-wide logging with varying levels for effective monitoring and debugging.
 * Utilizes Winston for comprehensive logging functionalities, including custom formats and transport mechanisms.
 */

const winston = require("winston");

/**
 * Defines custom logging levels for the application.
 */
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

/**
 * Custom log format combining timestamp and message format.
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    (info) =>
      `[${info.timestamp}][${info.level.toUpperCase()}] ${info.message}`,
  ),
);

/**
 * Sets up log transports for outputting logs (e.g., console, file, etc.)
 */
const logTransports = [
  new winston.transports.Console(), // Logs to console
  // Additional transports can be added as needed (e.g., file transport)
];

/**
 * Creates a Winston logger instance with the specified configuration.
 */
const log = winston.createLogger({
  level: process.env.LOG_LEVEL || "debug",
  levels: logLevels,
  format: logFormat,
  transports: logTransports,
});

/**
 * Stream for integrating with middleware like morgan.
 * @param {string} message - Log message to be written.
 */
log.stream = {
  write: (message) => log.http(message.trim()),
};

module.exports = log;
