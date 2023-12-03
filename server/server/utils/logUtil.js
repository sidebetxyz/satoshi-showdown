// logUtil.js
/**
 * Logging Utility for Satoshi Showdown
 *
 * Manages application-wide logging with varying levels for effective monitoring and debugging.
 * Utilizes Winston for comprehensive logging functionalities, including custom formats and transport mechanisms.
 */

const winston = require("winston");

// Define custom logging levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    (info) => `[${info.timestamp}][${info.level.toUpperCase()}] ${info.message}`
  )
);

// Transport setup (e.g., console, file, etc.)
const logTransports = [
  new winston.transports.Console(), // Logs to console
  // Additional transports can be added as needed (e.g., file transport)
];

// Create a Winston logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "debug",
  levels: logLevels,
  format: logFormat,
  transports: logTransports,
});

// Stream for integrating with middleware like morgan
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

// Export the logger
module.exports = logger;
