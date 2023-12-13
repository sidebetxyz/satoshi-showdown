/**
 * @fileoverview CORS Security Middleware for Satoshi Showdown.
 * This middleware configures Cross-Origin Resource Sharing (CORS) policies for the application.
 * It is crucial for controlling how resources are shared between different origins, enhancing
 * security and preventing unwanted cross-origin access. By specifying allowed origins, methods,
 * headers, and credentials, this middleware helps define and enforce rules for how external sources
 * can interact with the server. Proper configuration of CORS is important for web applications that
 * interact with APIs or resources from different domains.
 *
 * @module middlewares/corsSecurityMiddleware
 * @requires cors - Middleware package for enabling and configuring CORS in Express applications.
 * @see {@link https://expressjs.com/en/resources/middleware/cors.html} for detailed usage and options of CORS middleware.
 */

const cors = require("cors");

/**
 * Configures and returns CORS middleware with custom options.
 * This function initializes the CORS middleware with specific settings tailored to the application's
 * security needs. These settings can include configurations like whitelisted origins, allowed HTTP methods,
 * support for credentials, and headers. Adjusting the `corsOptions` allows the application to fine-tune
 * cross-origin access controls, balancing security with functionality. This is especially important for
 * applications that are accessed by various clients from different domains or for APIs that are consumed
 * publicly or by specific external entities.
 *
 * @function corsSecurityMiddleware
 * @return {Function} Configured CORS middleware function with specified access control policies.
 *                    The options can be customized based on the application's cross-origin interaction requirements.
 */
const corsSecurityMiddleware = () => {
  const corsOptions = {
    // Example CORS options:
    // origin: "https://example.com",
    // methods: "GET,POST,PUT,DELETE",
    // allowedHeaders: "Content-Type,Authorization"
  };

  return cors(corsOptions);
};

module.exports = corsSecurityMiddleware;
