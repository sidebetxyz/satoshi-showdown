/**
 * @fileoverview JSON Parser Middleware for Satoshi Showdown.
 * This middleware is responsible for parsing incoming request bodies that are in JSON format,
 * a common requirement in modern web applications. It uses Express's built-in parser to handle
 * the JSON data, enabling the server to easily access and process the structured information
 * contained in request bodies. This middleware is essential for any routes where the client
 * needs to send data to the server (e.g., form submissions, API calls) in a JSON format.
 *
 * @module middlewares/jsonParserMiddleware
 * @requires express - Express framework, which provides the built-in JSON parser middleware.
 */

const express = require("express");

/**
 * Creates and returns the Express JSON parser middleware.
 * This middleware automatically processes any incoming request with a 'Content-Type' of 'application/json',
 * parsing the JSON data in the request body and making it available under the 'req.body' property in route handlers.
 * This simplifies data handling in routes, ensuring that JSON data sent by clients is readily accessible
 * for server processing.
 *
 * @function jsonParserMiddleware
 * @return {Function} Middleware function provided by Express for JSON body parsing. This middleware
 *                    will parse incoming JSON payloads, allowing for easy access and manipulation
 *                    of request data in subsequent route handlers or middleware.
 */
const jsonParserMiddleware = () => express.json();

module.exports = jsonParserMiddleware;
