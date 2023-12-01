// log.js
/**
 * Logging Utility for Satoshi Showdown
 * 
 * Provides a centralized logging mechanism for the application.
 * Facilitates different levels of logging (info, error, etc.) for effective debugging and monitoring.
 * Utilizes the Winston library for enhanced logging capabilities.
 */

const winston = require('winston');

// Define custom logging levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Format for log output
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => `[${info.timestamp}][${info.level.toUpperCase()}] ${info.message}`),
);

// Transports define where the log messages will be outputted
const transports = [
  new winston.transports.Console(),
  // Additional transports (e.g., file) can be added here
];

// Create the Winston logger
const log = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  levels,
  format,
  transports,
});

/**
 * Stream for morgan middleware, integrates with Winston.
 * Used for logging HTTP requests.
 */
log.stream = {
  write: (message) => log.http(message.trim()),
};

// Export the logger
module.exports = log;
