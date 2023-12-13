/**
 * @fileoverview HTTP Security Middleware for Satoshi Showdown.
 * This middleware leverages Helmet, a collection of middleware functions,
 * to set a variety of HTTP headers that enhance the security of the application.
 * Helmet helps protect against common web vulnerabilities and security issues by
 * appropriately configuring headers like Content-Security-Policy, X-Frame-Options,
 * X-Content-Type-Options, and others. Integrating Helmet is a best practice in Express
 * applications for improving defense against well-known security vulnerabilities.
 *
 * @module middlewares/httpSecurityMiddleware
 * @requires helmet - A middleware package that sets HTTP headers for security enhancements.
 * @see {@link https://helmetjs.github.io/} for detailed documentation and customization options of Helmet.
 */

const helmet = require("helmet");

/**
 * Configures and returns the Helmet middleware for enhanced HTTP security.
 * This function initializes Helmet with optional custom options, allowing the application
 * to define specific security policies and header configurations. The use of Helmet
 * significantly improves the application's security posture by mitigating risks such
 * as clickjacking, sniffing attacks, and cross-site scripting (XSS). It is recommended
 * to fine-tune the Helmet options according to the specific security needs and traffic
 * characteristics of the application.
 *
 * @function httpSecurityMiddleware
 * @return {Function} Configured Helmet middleware function for setting various HTTP security headers.
 *                    By default, Helmet sets sensible defaults for various headers, but these can be
 *                    customized to fit the application's security requirements.
 */
const httpSecurityMiddleware = () => {
  const helmetOptions = {
    // Optionally customize Helmet options here
    // Example: frameguard: { action: "deny" }
  };

  return helmet(helmetOptions);
};

module.exports = httpSecurityMiddleware;
