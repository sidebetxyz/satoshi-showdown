/**
 * @fileoverview API Interaction Utility for Satoshi Showdown.
 * This module facilitates communication with external APIs by abstracting
 * the complexity of making HTTP requests and handling responses and errors.
 * It supports various types of API requests including GET and POST.
 *
 * @module utils/apiUtil
 * @requires axios - Axios library for making HTTP requests.
 * @requires utils/logUtil - Logging utility for application-wide logging.
 */

const axios = require("axios");
const log = require("./logUtil");

/**
 * Performs a POST request to the specified URL with the provided data and returns the response data.
 * Logs an error message and throws an error if the request fails.
 *
 * @async
 * @function postAPI
 * @param {string} url - The URL to send the POST request to.
 * @param {Object} data - The payload for the POST request.
 * @return {Promise<Object>} A promise that resolves with the data from the response.
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
 * Performs a GET request to the specified URL and returns the response data.
 * Logs an error message and throws an error if the request fails.
 *
 * @async
 * @function getAPI
 * @param {string} url - The URL to send the GET request to.
 * @param {Object} [params={}] - Optional query parameters for the GET request.
 * @return {Promise<Object>} A promise that resolves with the data from the response.
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
 * Performs a DELETE request to the specified URL and returns the response data.
 * Logs an error message and throws an error if the request fails.
 *
 * @async
 * @function deleteAPI
 * @param {string} url - The URL to send the DELETE request to.
 * @return {Promise<Object>} A promise that resolves with the data from the response.
 * @throws {Error} If the DELETE request fails.
 */
const deleteAPI = async (url) => {
  try {
    const response = await axios.delete(url);
    return response.data;
  } catch (error) {
    log.error(`DELETE request failed: ${error.message}`);
    throw error;
  }
};

/**
 * Placeholder function for processing callback data from an external API.
 * This function should be implemented to handle specific callback logic.
 *
 * @function processCallback
 * @param {Object} callbackData - The data received from the callback.
 */
const processCallback = (callbackData) => {
  // Implement callback processing logic here
};

module.exports = { postAPI, getAPI, deleteAPI, processCallback };
