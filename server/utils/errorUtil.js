// errorUtil.js
/**
 * Error Handling Utility for Satoshi Showdown
 *
 * Centralizes error handling in the application.
 * Provides custom error classes and middleware for processing and logging errors.
 */

const log = require("./logUtil");

// Custom error classes
class DatabaseError extends Error {}
class ValidationError extends Error {}
class NotFoundError extends Error {}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = "An unexpected error occurred";

  if (err instanceof ValidationError) {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    message = err.message;
  } else if (err instanceof DatabaseError) {
    message = "Database error";
  }

  log.error(`[${err.name}] ${err.message}`);

  res.status(statusCode).json({
    error: message,
  });
};

module.exports = {
  errorHandler,
  DatabaseError,
  ValidationError,
  NotFoundError,
};
