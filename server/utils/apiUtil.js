// apiUtil.js
/**
 * API Interaction Utility for Satoshi Showdown
 *
 * Facilitates communication with external APIs, abstracting complexity and error handling.
 * Supports various types of API requests and responses.
 */

const axios = require("axios");
const log = require("./logUtil");

// GET Request Handler
const get = async (url, params = {}) => {
  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    log.error(`GET request failed: ${error.message}`);
    throw error;
  }
};

// POST Request Handler
const post = async (url, data) => {
  try {
    const response = await axios.post(url, data);
    return response.data;
  } catch (error) {
    log.error(`POST request failed: ${error.message}`);
    throw error;
  }
};

// Callback Processing Handler
const processCallback = (callbackData) => {
  // Implement callback processing logic here
};

module.exports = { get, post, processCallback };
