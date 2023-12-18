/**
 * @fileoverview Service for managing wallets in Satoshi Showdown.
 * This service provides essential functionalities for creating, retrieving,
 * updating, and managing cryptocurrency wallets, particularly Segregated Witness (SegWit) Bitcoin wallets.
 * These wallets are primarily used for handling financial transactions related to events.
 * The service interfaces with the wallet data model and external key generation utilities to ensure
 * secure and efficient management of wallet-related operations.
 *
 * @module services/walletService
 * @requires models/walletModel - Wallet data model for database interactions.
 * @requires utils/keyUtil - Utility for generating SegWit Bitcoin keys.
 * @requires utils/logUtil - Logging utility for application-wide logging.
 */

const Wallet = require("../models/walletModel");
const { generateSegWitBitcoinKeys } = require("../utils/keyUtil");
const { NotFoundError } = require("../utils/errorUtil");
const log = require("../utils/logUtil");

/**
 * Creates a SegWit Bitcoin wallet specifically for handling event-related financial transactions.
 * Generates a new set of Bitcoin keys (public and private) and initializes a wallet object,
 * which is then saved to the database. This service supports the creation of individual wallets
 * for users or events, ensuring unique and secure financial transactions.
 *
 * @async
 * @function createSegWitWalletForEvent
 * @return {Promise<Object>} The created wallet object, including public address, encrypted private key, and wallet type.
 * @throws {Error} Thrown if there is an issue in generating keys or saving the wallet to the database.
 * @throws {Error} Thrown if wallet creation fails for any reason.
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
