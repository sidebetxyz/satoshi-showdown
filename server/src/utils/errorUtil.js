/**
 * @fileoverview Error Utility for Satoshi Showdown.
 * Defines custom error classes for enhanced error handling in the application.
 * These classes extend the standard Error class, providing additional context and specificity.
 * Includes error types like DatabaseError, ValidationError, and NotFoundError for precise error identification.
 *
 * @module utils/errorUtil
 * @requires utils/formatUtil - Utility for formatting dates and times.
 */

const { formatDate } = require("./formatUtil");

/**
 * Base class for custom errors, enhancing the standard Error with additional features like timestamps.
 *
 * @class BaseError
 * @extends Error
 */
class BaseError extends Error {
  /**
   * Constructs the BaseError instance, adding a timestamp for better error tracking.
   * @param {string} name - The name of the error.
   * @param {string} message - The detailed error message.
   */
  constructor(name, message) {
    super(message);
    this.name = name;
    this.timestamp = formatDate(new Date());
  }
}

/**
 * Custom error class for handling database operation errors.
 *
 * @class DatabaseError
 * @extends BaseError
 */
class DatabaseError extends BaseError {
  /**
   * Constructs the DatabaseError instance with a prefixed message.
   * @param {string} message - The error message related to database operations.
   */
  constructor(message) {
    super("DatabaseError", `Database error: ${message}`);
  }
}

/**
 * Custom error class for handling validation errors.
 *
 * @class ValidationError
 * @extends BaseError
 */
class ValidationError extends BaseError {
  /**
   * Constructs the ValidationError instance with a prefixed message.
   * @param {string} message - The error message related to validation issues.
   */
  constructor(message) {
    super("ValidationError", `Validation error: ${message}`);
  }
}

/**
 * Custom error class for handling errors related to not found resources.
 *
 * @class NotFoundError
 * @extends BaseError
 */
class NotFoundError extends BaseError {
  /**
   * Constructs the NotFoundError instance with a prefixed message.
   * @param {string} message - The error message for not found resources.
   */
  constructor(message) {
    super("NotFoundError", `Not Found: ${message}`);
  }
}

module.exports = {
  BaseError,
  DatabaseError,
  ValidationError,
  NotFoundError,
};
