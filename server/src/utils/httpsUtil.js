/**
 * @fileoverview HTTPS Utility for Satoshi Showdown.
 * This module provides functionality to create a secure HTTPS server for the application.
 * It handles the loading of SSL certificates and key files, and configures the HTTPS server
 * with the necessary credentials. This ensures secure communication over the network.
 *
 * @module utils/httpsUtil
 * @requires https - Node.js HTTPS module for creating HTTPS servers.
 * @requires fs - Node.js File System module for handling file operations.
 * @requires utils/logUtil - Logging utility for application-wide logging.
 */

const https = require("https");
const fs = require("fs");
const log = require("./logUtil");

/**
 * Creates and configures an HTTPS server for the given Express application.
 * Reads the SSL private key and certificate from file paths specified in environment variables.
 * Logs and throws an error if there's an issue with server configuration or file reading.
 *
 * @function createServer
 * @param {express.Application} app - The Express application to attach to the HTTPS server.
 * @return {https.Server} The created HTTPS server.
 * @throws {Error} If there is an error reading the SSL files or creating the server.
 */
const createServer = (app) => {
  try {
    const privateKey = fs.readFileSync(
      process.env.SSL_PRIVATE_KEY_PATH,
      "utf8",
    );
    const certificate = fs.readFileSync(
      process.env.SSL_CERTIFICATE_PATH,
      "utf8",
    );
    const credentials = { key: privateKey, cert: certificate };

    return https.createServer(credentials, app);
  } catch (err) {
    log.error(`HTTPS Server configuration error: ${err.message}`);
    throw err;
  }
};

module.exports = { createServer };
