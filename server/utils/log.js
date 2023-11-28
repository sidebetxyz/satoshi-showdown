import winston from "winston";

/**
 * Configures the Winston logger for the application.
 * Creates a logging instance with multiple transports for different
 * logging levels and outputs (e.g., file, console).
 *
 * @module log
 */
const log = winston.createLogger({
  level: "info", // Default logging level
  format: winston.format.json(), // Log output format set to JSON
  transports: [
    // Transport for logging error level messages to 'error.log'
    new winston.transports.File({ filename: "error.log", level: "error" }),
    // Transport for logging all messages to 'combined.log'
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Adding console transport for logging in non-production environments
if (process.env.NODE_ENV !== "production") {
  log.add(
    new winston.transports.Console({
      format: winston.format.simple(), // Console log format set to simple
    })
  );
}

export default log; // Exporting the configured logger
