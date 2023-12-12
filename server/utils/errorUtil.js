/**
 * @fileoverview Error Handling Utility for Satoshi Showdown.
 * Centralizes error handling in the application, providing custom error classes
 * and middleware for processing and logging errors. Integrates with logging and
 * format utilities for consistent error reporting.
 */

const { formatDate } = require("./formatUtil");
const log = require("./logUtil");

/**
 * Base class for custom errors, including timestamp.
 * @extends Error
 */
class BaseError extends Error {
  /**
   * Creates an instance of BaseError.
   * @param {string} name - The name of the error.
   * @param {string} message - The message of the error.
   */
  constructor(name, message) {
    super(message);
    this.name = name;
    this.timestamp = formatDate(new Date());
  }
}

/**
 * Represents an error related to database operations.
 * @extends BaseError
 */
class DatabaseError extends BaseError {
  /**
   * Creates an instance of DatabaseError.
   * @param {string} message - The error message.
   */
  constructor(message) {
    super("DatabaseError", `Database error: ${message}`);
  }
}

/**
 * Represents a validation error.
 * @extends BaseError
 */
class ValidationError extends BaseError {
  /**
   * Creates an instance of ValidationError.
   * @param {string} message - The error message.
   */
  constructor(message) {
    super("ValidationError", `Validation error: ${message}`);
  }
}

/**
 * Represents an error when a resource is not found.
 * @extends BaseError
 */
class NotFoundError extends BaseError {
  /**
   * Creates an instance of NotFoundError.
   * @param {string} message - The error message.
   */
  constructor(message) {
    super("NotFoundError", `Not Found: ${message}`);
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
