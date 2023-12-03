// formatUtil.js
/**
 * Formatting Utility for Satoshi Showdown
 *
 * Provides functions for standardizing and formatting data across the application.
 * This includes formatting dates, currencies, and other domain-specific data to ensure
 * consistency and readability.
 */

const { DateTime } = require("luxon");

// Common Formatting Functions
const formatDate = (date, formatStr = "yyyy-MM-dd HH:mm:ss") => {
  return DateTime.fromJSDate(date).toFormat(formatStr);
};

const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount
  );
};

// Domain-Specific Formatting
const formatCryptoAddress = (address) => {
  // Implement specific formatting for cryptocurrency addresses if needed
  return address;
};

// More domain-specific formatting functions can be added as required

module.exports = {
  formatDate,
  formatCurrency,
  formatCryptoAddress,
  // Export other formatting functions as they are implemented
};
