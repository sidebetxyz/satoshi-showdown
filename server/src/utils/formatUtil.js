/**
 * @fileoverview Formatting Utility for Satoshi Showdown.
 * This module provides functions for standardizing and formatting data across the application,
 * such as dates, currencies, and other domain-specific data. It ensures consistency and readability,
 * enhancing the user experience and data handling.
 *
 * @module utils/formatUtil
 * @requires luxon - The Luxon library for date and time manipulation.
 */

const { DateTime } = require("luxon");

/**
 * Formats a JavaScript Date object into a specified string format using Luxon.
 *
 * @function formatDate
 * @param {Date} date - The date object to format.
 * @param {string} [formatStr="yyyy-MM-dd HH:mm:ss"] - The string format to use for the output.
 * @return {string} The formatted date string.
 */
const formatDate = (date, formatStr = "yyyy-MM-dd HH:mm:ss") =>
  DateTime.fromJSDate(date).toFormat(formatStr);

/**
 * Formats a numeric amount into a currency string.
 *
 * @function formatCurrency
 * @param {number} amount - The numeric amount to format.
 * @param {string} [currency="USD"] - The currency code to format the amount in (e.g., "USD").
 * @return {string} The formatted currency string.
 */
const formatCurrency = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount,
  );

/**
 * Placeholder function for formatting cryptocurrency addresses.
 * Can be implemented to format addresses according to specific requirements.
 *
 * @function formatCryptoAddress
 * @param {string} address - The cryptocurrency address to format.
 * @return {string} The formatted cryptocurrency address.
 */
const formatCryptoAddress = (address) => {
  // Implement specific formatting for cryptocurrency addresses if needed
  return address;
};

module.exports = {
  formatDate,
  formatCurrency,
  formatCryptoAddress,
  // Export other formatting functions as they are implemented
};
