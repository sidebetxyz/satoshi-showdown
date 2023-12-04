/**
 * @fileoverview API Interaction Utility for Satoshi Showdown.
 * Facilitates communication with external APIs, abstracting complexity and error handling.
 * Supports various types of API requests and responses.
 */

const axios = require("axios");
const log = require("./logUtil");

/**
 * Performs a GET request to the specified URL.
 * 
 * @param {string} url - The URL to send the GET request to.
 * @param {Object} [params={}] - Query parameters for the GET request.
 * @returns {Promise<Object>} The data from the response.
 * @throws {Error} If the GET request fails.
 */
const getAPI = async (url, params = {}) => {
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    log.error(`GET request failed: ${error.message}`);
    throw error;
  }
};

/**
 * Performs a POST request to the specified URL.
 * 
 * @param {string} url - The URL to send the POST request to.
 * @param {Object} data - The payload for the POST request.
 * @returns {Promise<Object>} The data from the response.
 * @throws {Error} If the POST request fails.
 */
const postAPI = async (url, data) => {
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    log.error(`POST request failed: ${error.message}`);
    throw error;
  }
};

/**
 * Processes callback data from an external API.
 * Placeholder for actual implementation.
 * 
 * @param {Object} callbackData - The data received from the callback.
 */
const processCallback = (callbackData) => {
  // Implement callback processing logic here
};

module.exports = { getAPI, postAPI, processCallback };
