/**
 * @fileoverview Middleware for configuring Cross-Origin Resource Sharing (CORS).
 * This setup helps to secure the application by defining which external sources
 * are allowed to access resources on the server.
 *
 * @see {@link https://expressjs.com/en/resources/middleware/cors.html} for more information on CORS middleware.
 */

const cors = require("cors");

/**
 * Configures and returns the CORS middleware.
 * Modify `corsOptions` as per your application's needs.
 *
 * @return {Function} Middleware function for CORS configuration.
 */
const corsSecurityMiddleware = () => {
  const corsOptions = {
    // Define your CORS options here, e.g., origin, methods, allowed headers
  };

  return cors(corsOptions);
};

module.exports = corsSecurityMiddleware;
