/**
 * @fileoverview Environment Variable Utility for Satoshi Showdown.
 * This module is responsible for loading environment variables from the .env file
 * and providing a utility function to access these variables throughout the application.
 *
 * The .env file is expected to be located in the '../configs/' directory relative
 * to the current working directory of the Node.js process.
 *
 * @module utils/envUtil
 * @requires dotenv
 */

// Load environment variables from the specified .env file.
require("dotenv").config({ path: "../configs/.env" });

/**
 * Retrieves the value of an environment variable.
 *
 * @param {string} key - The name of the environment variable to retrieve.
 * @param {*} [defaultValue=undefined] - The default value to return if the environment variable is not found.
 * @return {*} The value of the environment variable or the default value if the variable is not set.
 */
const getEnv = (key, defaultValue = undefined) => {
  return process.env[key] || defaultValue;
};

module.exports = { getEnv };
