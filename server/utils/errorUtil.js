/**
 * @fileoverview Error Handling Utility for Satoshi Showdown.
 * Centralizes error handling in the application, providing custom error classes
 * and middleware for processing and logging errors. Integrates with logging and
 * format utilities for consistent error reporting.
 */

const log = require("./logUtil");
const { formatDate } = require("./formatUtil");

/**
 * Represents an error related to database operations.
 */
class DatabaseError extends Error {
  constructor(message) {
    super(`Database error: ${message}`);
    this.name = 'DatabaseError';
    this.timestamp = formatDate(new Date());
  }
}

/**
 * Represents a validation error.
 */
class ValidationError extends Error {
  constructor(message) {
    super(`Validation error: ${message}`);
    this.name = 'ValidationError';
    this.timestamp = formatDate(new Date());
  }
}

/**
 * Represents an error when a resource is not found.
 */
class NotFoundError extends Error {
  constructor(message) {
    super(`Not Found: ${message}`);
    this.name = 'NotFoundError';
    this.timestamp = formatDate(new Date());
  }
}

/**
 * Middleware for handling errors in Express applications.
 * 
 * @param {Error} err - The error object.
 * @param {Request} req - The express request object.
 * @param {Response} res - The express response object.
 * @param {NextFunction} next - The express next middleware function.
 */
const errorHandler = (err, req, res, next) => {
  const { name, message, timestamp } = err;
  let statusCode = 500;
  let logMessage = `[${timestamp}][${name}] ${message}`;

  if (err instanceof ValidationError) {
    statusCode = 400;
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
  } else if (err instanceof DatabaseError) {
    logMessage = `[${timestamp}][${name}] Database operation failed`;
  }

  log.error(logMessage);
  res.status(statusCode).json({ error: message });
};

module.exports = {
  errorHandler,
  DatabaseError,
  ValidationError,
  NotFoundError,
};
