const { getAPI } = require("./apiUtil");
const bitcoin = require("bitcoinjs-lib");

// Configuration for BlockCypher API
const apiBaseUrl = process.env.BLOCKCYPHER_BASE_URL;

/**
 * @fileoverview Utility functions for handling transaction fees in Satoshi Showdown.
 * Includes functionality for fetching current network fee rates and estimating
 * transaction fees based on transaction details.
 *
 * @module utils/feeUtil
 * @requires utils/apiUtil - For making API requests.
 * @requires bitcoinjs-lib - For transaction calculations.
 */

/**
 * Fetches the current Bitcoin network fee rates (high, medium, low) from BlockCypher.
 * @async
 * @return {Promise<{highFeePerByte: number, mediumFeePerByte: number, lowFeePerByte: number}>}
 *          An object containing high, medium, and low fee rates in satoshis per byte.
 * @throws {Error} If the request to the BlockCypher API fails.
 */
const getCurrentFeeRates = async () => {
  try {
    const url = `${apiBaseUrl}`;
    const data = await getAPI(url);

    return {
      highFeePerByte: Math.ceil(data.high_fee_per_kb / 1024),
      mediumFeePerByte: Math.ceil(data.medium_fee_per_kb / 1024),
      lowFeePerByte: Math.ceil(data.low_fee_per_kb / 1024),
    };
  } catch (error) {
    throw new Error(`Error fetching current fee rates: ${error.message}`);
  }
};

/**
 * Estimates the transaction fee in satoshis based on the number of inputs, outputs, and the fee rate.
 * Uses the formula for virtual size (vSize) to calculate the fee more accurately for SegWit transactions.
 *
 * @param {number} numInputs - Number of transaction inputs.
 * @param {number} numOutputs - Number of transaction outputs.
 * @param {number} feeRate - Fee rate in satoshis per byte.
 * @return {number} Estimated transaction fee in satoshis.
 */
const estimateTransactionFee = (numInputs, numOutputs, feeRate) => {
  // Create a dummy transaction to estimate its size
  const tx = new bitcoin.Transaction();

  // Dummy hash for inputs (32-byte zero buffer)
  const dummyHash = Buffer.alloc(32); // 32-byte buffer of zeros

  for (let i = 0; i < numInputs; i++) {
    // Add dummy inputs using a buffer of 32 bytes of zeros
    tx.addInput(dummyHash, 0); // Zero for index
  }

  for (let i = 0; i < numOutputs; i++) {
    // Add dummy outputs (script and value are irrelevant for size calculation)
    // Using a 22-byte buffer as a placeholder for the script
    tx.addOutput(Buffer.alloc(22), 0); // Zero for amount
  }

  // Calculate the virtual size (vSize) of the transaction
  const vSize = tx.virtualSize();

  console.log("vSize:", vSize);

  // Estimate fee = vSize * feeRate
  return Math.ceil(vSize * feeRate);
};

/**
 * Adjusts the transaction amount to account for the transaction fee.
 * This function ensures that the fee is deducted from the total amount, avoiding leaving dust in the wallet.
 *
 * @param {number} amount - Original transaction amount in satoshis.
 * @param {number} fee - Transaction fee in satoshis.
 * @return {number} Adjusted amount after deducting the fee.
 */
const adjustAmountForFee = (amount, fee) => {
  return Math.max(amount - fee, 0);
};

module.exports = {
  getCurrentFeeRates,
  estimateTransactionFee,
  adjustAmountForFee,
};
