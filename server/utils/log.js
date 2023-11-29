import winston from "winston";

/**
 * Logger Configuration
 *
 * Sets up the Winston logger for application-wide logging. Configures different transports
 * for logging at various levels (e.g., error, info) to different outputs like files or console.
 * This module provides a centralized logger to be used across the application.
 */
const log = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    // File transport for error logs
    new winston.transports.File({ filename: "error.log", level: "error" }),
    // File transport for combined logs
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Adding console transport for non-production environments
if (process.env.NODE_ENV !== "production") {
  log.add(new winston.transports.Console({ format: winston.format.simple() }));
}

// Function to stop the logger (useful during testing)
export const stopLogger = () => {
  log.end();
};

export default log;
