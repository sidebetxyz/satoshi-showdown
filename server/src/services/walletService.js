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

/**
 * Updates the balance of an existing wallet record in the database by its MongoDB reference ID.
 * This function focuses on updating only the confirmed and unconfirmed balances of the wallet.
 * It retrieves the existing wallet record and applies balance updates as necessary.
 *
 * @async
 * @function updateWalletBalanceById
 * @param {string} walletId - The MongoDB reference ID of the wallet to update.
 * @param {Object} updateData - An object containing the new balance data for the wallet.
 * @return {Promise<Object>} A promise that resolves to the updated wallet object.
 * @throws {NotFoundError} Thrown if the wallet with the specified ID is not found in the database.
 * @throws {Error} Thrown if there is an error during the update process.
 */
const updateWalletBalanceById = async (walletId, updateData) => {
  try {
    const existingWallet = await Wallet.findById(walletId);
    if (!existingWallet) {
      throw new NotFoundError(`Wallet with ID ${walletId} not found`);
    }

    const updatesToApply = {
      confirmedBalance:
        updateData.confirmedBalance ?? existingWallet.confirmedBalance,
      unconfirmedBalance:
        updateData.unconfirmedBalance ?? existingWallet.unconfirmedBalance,
    };

    // Update only if there's a change in balance
    if (
      updatesToApply.confirmedBalance !== existingWallet.confirmedBalance ||
      updatesToApply.unconfirmedBalance !== existingWallet.unconfirmedBalance
    ) {
      const updatedWallet = await Wallet.findByIdAndUpdate(
        walletId,
        updatesToApply,
        { new: true },
      );
      log.info(`Wallet balance with ID ${walletId} updated`);
      return updatedWallet;
    } else {
      log.info(`No changes to update for wallet balance with ID ${walletId}`);
      return existingWallet;
    }
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(`Error updating wallet balance: ${error.message}`);
  }
};

module.exports = {
  createSegWitWalletForEvent,
  getWalletByAddress,
  addTransactionToWallet,
  updateWalletBalanceById,
};
