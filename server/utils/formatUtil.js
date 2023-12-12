/**
 * @fileoverview Formatting Utility for Satoshi Showdown.
 * Provides functions for standardizing and formatting data across the application.
 * This includes formatting dates, currencies, and other domain-specific data to ensure
 * consistency and readability.
 */

const { DateTime } = require("luxon");

/**
 * Formats a date into a specified string format.
 *
 * @param {Date} date - The date to format.
 * @param {string} [formatStr="yyyy-MM-dd HH:mm:ss"] - The string format to use.
 * @return {string} Formatted date string.
 */
const formatDate = (date, formatStr = "yyyy-MM-dd HH:mm:ss") =>
  DateTime.fromJSDate(date).toFormat(formatStr);

/**
 * Formats a number into a currency string.
 *
 * @param {number} amount - The amount to format.
 * @param {string} [currency="USD"] - The currency format to use.
 * @return {string} Formatted currency string.
 */
const formatCurrency = (amount, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount,
  );

/**
 * Formats a cryptocurrency address. Placeholder for domain-specific implementation.
 *
 * @param {string} address - The crypto address to format.
 * @return {string} Formatted crypto address.
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
