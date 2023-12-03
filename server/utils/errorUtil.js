// errorUtil.js
/**
 * Error Handling Utility for Satoshi Showdown
 *
 * Centralizes error handling in the application.
 * Provides custom error classes and middleware for processing and logging errors.
 */

const log = require("./logUtil");

// Custom Error Classes
class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseError';
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Error Handling Middleware
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
  res.status(statusCode).json({ error: message });
};

module.exports = {
  errorHandler,
  DatabaseError,
  ValidationError,
  NotFoundError,
};
