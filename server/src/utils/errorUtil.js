/**
 * @fileoverview Error Utility for Satoshi Showdown.
 * Defines custom error classes for the application. These classes extend the standard Error class
 * and provide additional context, such as specific error types like DatabaseError, ValidationError,
 * and NotFoundError. This enhances error handling by allowing more specific error identification and handling.
 *
 * @module utils/errorUtil
 */

const { formatDate } = require("./formatUtil");

/**
 * Base class for custom errors. Enhances the standard Error by adding a timestamp.
 * @class
 * @extends Error
 */
class BaseError extends Error {
  /**
   * Constructs the BaseError instance.
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
 * Error class for database operation errors.
 * @class
 * @extends BaseError
 */
class DatabaseError extends BaseError {
  /**
   * Constructs the DatabaseError instance.
   * @param {string} message - The error message.
   */
  constructor(message) {
    super("DatabaseError", `Database error: ${message}`);
  }
}

/**
 * Error class for validation errors.
 * @class
 * @extends BaseError
 */
class ValidationError extends BaseError {
  /**
   * Constructs the ValidationError instance.
   * @param {string} message - The error message.
   */
  constructor(message) {
    super("ValidationError", `Validation error: ${message}`);
  }
}

/**
 * Error class for errors related to not found resources.
 * @class
 * @extends BaseError
 */
class NotFoundError extends BaseError {
  /**
   * Constructs the NotFoundError instance.
   * @param {string} message - The error message.
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
