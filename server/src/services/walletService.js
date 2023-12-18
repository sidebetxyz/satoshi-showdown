/**
 * @fileoverview Wallet Service for Satoshi Showdown.
 * Provides functionalities for managing cryptocurrency wallets, specifically for Bitcoin SegWit wallets.
 * It includes operations such as wallet creation, retrieval, balance update, and transaction association.
 * This service is essential for financial transactions within the platform, ensuring secure and efficient
 * management of user and event-related wallets.
 *
 * @module services/walletService
 * @requires models/walletModel - Wallet data model for database interactions.
 * @requires utils/keyUtil - Utility functions for generating and handling Bitcoin keys.
 * @requires utils/errorUtil - Custom error classes and error handling utilities.
 * @requires utils/logUtil - Logging utility for application-wide logging.
 */

const Wallet = require("../models/walletModel");
const { generateSegWitBitcoinKeys } = require("../utils/keyUtil");
const { NotFoundError } = require("../utils/errorUtil");
const log = require("../utils/logUtil");

/**
 * Creates a new Segregated Witness (SegWit) Bitcoin wallet, primarily for event-related financial activities.
 * Generates a unique Bitcoin address and corresponding encrypted private key.
 * This wallet type is optimized for Satoshi Showdown's transaction processing needs, ensuring security and efficiency.
 *
 * @async
 * @function createSegWitWalletForEvent
 * @return {Promise<Object>} The created wallet object, including public address and encrypted private key details.
 * @throws {Error} If there's an issue in key generation or saving the wallet to the database.
 */
const createSegWitWalletForEvent = async () => {
  const { address, encryptedPrivateKey } = generateSegWitBitcoinKeys();

  const wallet = new Wallet({
    publicAddress: address,
    encryptedPrivateKey,
    walletType: "SegWit",
  });

  try {
    await wallet.save();
    log.info(`Wallet created with address: ${wallet.publicAddress}`);
    return wallet;
  } catch (err) {
    log.error(`Error in createSegWitWalletForEvent: ${err.message}`);
    throw err;
  }
};

/**
 * Retrieves a wallet by its public address from the database.
 * This function is vital for various operations such as validating wallet existence,
 * conducting transactions, and querying wallet balance. It is a key component in ensuring
 * that operations involving a particular wallet address are accurately processed.
 *
 * @async
 * @function getWalletByAddress
 * @param {string} address - The public address of the wallet to be retrieved.
 * @return {Promise<Object>} The wallet object corresponding to the provided public address.
 * @throws {NotFoundError} Thrown if no wallet is found with the given public address.
 * @throws {Error} Thrown if there is an issue with the database query.
 */
const getWalletByAddress = async (address) => {
  try {
    const wallet = await Wallet.findOne({ publicAddress: address });
    if (!wallet) {
      throw new Error(`Wallet with address ${address} not found`);
    }
    return wallet;
  } catch (err) {
    log.error(`Error in getWalletByAddress: ${err.message}`);
    throw err;
  }
};

/**
 * Updates the balance of a wallet in the database, handling both confirmed and unconfirmed balances.
 * Initially, it updates the unconfirmed balance of the wallet when a new transaction is detected.
 * Once the transaction reaches six confirmations, it updates the confirmed balance and resets the unconfirmed balance.
 * This approach ensures accurate tracking of balances in the dynamic environment of cryptocurrency transactions.
 *
 * @async
 * @function updateWalletBalance
 * @param {string} walletId - The ID of the wallet to update.
 * @param {number} amountReceived - The amount received in the transaction.
 * @param {number} confirmations - The number of confirmations for the transaction.
 * @throws {NotFoundError} Thrown if the wallet with the given ID is not found.
 */
const updateWalletBalance = async (walletId, amountReceived, confirmations) => {
  try {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      throw new NotFoundError(`Wallet with ID ${walletId} not found`);
    }

    if (confirmations < 6) {
      // Update the unconfirmed balance for transactions with less than 6 confirmations
      wallet.unconfirmedBalance += amountReceived;
    } else {
      // Update the confirmed balance and reset unconfirmed balance for transactions with 6 or more confirmations
      wallet.confirmedBalance += amountReceived;
      wallet.unconfirmedBalance = 0;
    }

    await wallet.save();
    log.info(`Wallet balance updated for wallet ID: ${walletId}`);
  } catch (error) {
    throw new Error(`Error updating wallet balance: ${error.message}`);
  }
};

/**
 * Adds a transaction reference to the specified wallet's transaction history.
 * This function is essential for associating transaction records with the wallet,
 * aiding in the creation of a comprehensive transaction history. It enhances the
 * traceability and auditability of financial activities associated with the wallet.
 *
 * @async
 * @function addTransactionToWallet
 * @param {string} walletId - The unique identifier of the wallet to update.
 * @param {string} transactionId - The unique identifier of the transaction to be added to the wallet's history.
 * @return {Promise<Object>} The wallet object updated with the new transaction reference.
 * @throws {NotFoundError} Thrown if the wallet with the specified ID is not found in the database.
 * @throws {Error} Thrown if there is an issue with the database update.
 */
const addTransactionToWallet = async (walletId, transactionId) => {
  try {
    const wallet = await Wallet.findByIdAndUpdate(
      walletId,
      { $push: { transactionRefs: transactionId } },
      { new: true },
    );
    if (!wallet) {
      throw new Error(`Wallet with ID ${walletId} not found`);
    }
    return wallet;
  } catch (err) {
    log.error(`Error in addTransactionToWallet: ${err.message}`);
    throw err;
  }
};

module.exports = {
  createSegWitWalletForEvent,
  getWalletByAddress,
  updateWalletBalance,
  addTransactionToWallet,
};
