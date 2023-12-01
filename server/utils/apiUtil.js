// apiUtil.js
/**
 * API Interaction Utility for Satoshi Showdown
 *
 * Facilitates communication with external APIs, abstracting complexity and error handling.
 * Supports various types of API requests and responses.
 */

const axios = require("axios");
const log = require("./logUtil");

/**
 * Makes a GET request to the specified URL.
 *
 * @param {string} url - The URL to make the GET request to.
 * @param {Object} params - Query parameters for the request.
 * @returns {Promise<Object>} - The response from the API.
 */
const get = async (url, params = {}) => {
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    log.error(`GET request failed: ${error.message}`);
    throw error; // Rethrow the error for further handling
  }
};

/**
 * Makes a POST request to the specified URL.
 *
 * @param {string} url - The URL to make the POST request to.
 * @param {Object} data - The data to be sent in the request body.
 * @returns {Promise<Object>} - The response from the API.
 */
const post = async (url, data) => {
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    log.error(`POST request failed: ${error.message}`);
    throw error; // Rethrow the error for further handling
  }
};

/**
 * Function to process API callbacks (if applicable).
 *
 * @param {Object} callbackData - The data received from the API callback.
 */
const processCallback = (callbackData) => {
  // Implementation of processing the callback data.
  // This could involve updating records, notifying users, etc.
  // Log and handle any errors that occur during processing.
};

module.exports = { get, post, processCallback };
