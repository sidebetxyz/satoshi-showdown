/**
 * @fileoverview Middleware for setting HTTP headers to secure the application.
 * Utilizes the helmet package to set various security-related headers to
 * protect against common web vulnerabilities.
 *
 * @see {@link https://helmetjs.github.io/} for more information on Helmet.
 */

const helmet = require("helmet");

/**
 * Configures and returns the Helmet middleware for enhanced security.
 *
 * @return {Function} Middleware function for setting HTTP security headers.
 */
const httpSecurityMiddleware = () => {
  const helmetOptions = {
    // Optionally customize Helmet options here
  };

  return helmet(helmetOptions);
};

module.exports = httpSecurityMiddleware;
