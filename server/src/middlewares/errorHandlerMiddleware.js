/**
 * @fileoverview Error Middleware for Satoshi Showdown.
 * This middleware handles errors that occur in the Express application. It is responsible for
 * logging errors using the application's logging utility and sending appropriately formatted
 * error responses to the client. It integrates with custom error classes to provide detailed
 * error information, ensuring a consistent error handling strategy throughout the application.
 * This middleware enhances application robustness and aids in debugging and error tracking.
 *
 * @module middlewares/errorMiddleware
 * @requires utils/errorUtil - Utility module that defines custom error classes for consistent error handling.
 * @requires utils/logUtil - Logging utility for recording errors and other messages in a standardized format.
 */

const {
  ValidationError,
  NotFoundError,
  DatabaseError,
} = require("../utils/errorUtil");
const log = require("../utils/logUtil");

/**
 * Middleware function for handling errors in Express applications.
 * It intercepts errors thrown in the application, logs them for administrative purposes,
 * and sends a structured response back to the client. This middleware differentiates
 * between types of errors (validation, not found, database, etc.) and sets appropriate
 * HTTP status codes and messages in the response, ensuring that the client receives
 * understandable and useful error information.
 *
 * @function errorHandlerMiddleware
 * @param {Error} err - The error object encountered in the application.
 * @param {express.Request} req - The Express request object, providing context about the HTTP request.
 * @param {express.Response} res - The Express response object, used to send back the error response.
 * @param {express.NextFunction} next - The Express next middleware function, not used here as this is an error handling middleware.
 */
const errorHandlerMiddleware = (err, req, res, next) => {
  const { name, message, timestamp } = err;
  let statusCode = 500; // Default to internal server error unless specified otherwise
  let logMessage = `[${timestamp}][${name}] ${message}`;

  // Determine the response status code based on the error type
  if (err instanceof ValidationError) {
    statusCode = 400; // Bad Request
  } else if (err instanceof NotFoundError) {
    statusCode = 404; // Not Found
  } else if (err instanceof DatabaseError) {
    logMessage = `[${timestamp}][${name}] Database operation failed`;
  }

  // Log the error for administrative review
  log.error(logMessage);

  // Send a structured error response to the client
  res.status(statusCode).json({ error: message });
};

module.exports = errorHandlerMiddleware;
