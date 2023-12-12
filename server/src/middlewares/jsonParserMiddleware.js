/**
 * @fileoverview Middleware for parsing JSON request bodies.
 * Uses Express built-in method to parse incoming requests with JSON payloads.
 */

const express = require("express");

/**
 * Returns middleware for parsing JSON request bodies.
 *
 * @return {Function} Middleware function for JSON parsing.
 */
const jsonParserMiddleware = () => express.json();

module.exports = jsonParserMiddleware;
