/**
 * @fileoverview Service for managing wallets in Satoshi Showdown.
 * Provides functionalities for creating and managing cryptocurrency wallets,
 * specifically tailored for event-related transactions.
 */

const Wallet = require("../models/walletModel");
const { generateSegWitBitcoinKeys } = require("../utils/keyUtil");
const log = require("../utils/logUtil");

/**
 * Creates a wallet for a specific event and user.
 * Generates a new SegWit Bitcoin wallet and stores it in the database.
 *
 * @return {Promise<Object>} The created wallet object.
 */
const createSegWitWalletForEvent = async () => {
  const { address, encryptedPrivateKey } = generateSegWitBitcoinKeys();

  const wallet = new Wallet({
    publicAddress: address,
    encryptedPrivateKey,
    walletType: "SegWit",
  });

  await wallet.save();
  log.info(`Wallet created with address: ${wallet.publicAddress}`);
  return wallet;
};

/**
 * Retrieves a wallet by its public address.
 *
 * @param {string} address - The public address of the wallet to retrieve.
 * @return {Promise<Object>} The retrieved wallet object.
 * @throws {Error} Thrown if the wallet is not found.
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
 * Updates the balance of a wallet.
 *
 * @param {string} walletId - The ID of the wallet to update.
 * @param {number} newBalance - The new balance to set for the wallet.
 * @return {Promise<Object>} The updated wallet object.
 */
const updateWalletBalance = async (walletId, newBalance) => {
  try {
    const wallet = await Wallet.findByIdAndUpdate(
      walletId,
      { balance: newBalance },
      { new: true },
    );
    if (!wallet) {
      throw new Error(`Wallet with ID ${walletId} not found`);
    }
    return wallet;
  } catch (err) {
    log.error(`Error in updateWalletBalance: ${err.message}`);
    throw err;
  }
};

/**
 * Adds a transaction reference to a wallet.
 *
 * @param {string} walletId - The ID of the wallet to update.
 * @param {string} transactionId - The ID of the transaction to add to the wallet.
 * @return {Promise<Object>} The updated wallet object.
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
