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
const { decryptPrivateKey } = require("../utils/encryptionUtil");
const { generateSegWitBitcoinKeys } = require("../utils/keyUtil");
const { NotFoundError } = require("../utils/errorUtil");
const log = require("../utils/logUtil");

const bitcoin = require("bitcoinjs-lib");
const network = bitcoin.networks.testnet;
const ecPairFactory = require("ecpair").default;
const ecc = require("tiny-secp256k1");

// Initialize ECPair factory with tiny-secp256k1
const ecPair = ecPairFactory(ecc);

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
 * Creates a raw Bitcoin transaction using UTXOs, target address, amount, change address, and a pre-calculated transaction fee.
 * It signs the transaction inputs with the corresponding decrypted private keys from the wallets.
 *
 * @async
 * @function createRawBitcoinTransaction
 * @param {Array} selectedUTXOs - Array of selected UTXO objects for the transaction.
 * @param {string} toAddress - The Bitcoin address to send the amount to.
 * @param {number} amountToSend - The amount to send in satoshis.
 * @param {string} changeAddress - The address where the change will be sent.
 * @param {number} transactionFee - The pre-calculated transaction fee in satoshis.
 * @return {Promise<string>} A promise that resolves to the raw transaction hex string.
 * @throws {Error} Throws an error if transaction creation fails.
 */
const createRawBitcoinTransaction = async (
  selectedUTXOs,
  toAddress,
  amountToSend,
  changeAddress,
  transactionFee,
) => {
  try {
    const psbt = new bitcoin.Psbt({ network: network });

    // Add inputs with necessary UTXO details
    for (const utxo of selectedUTXOs) {
      psbt.addInput({
        hash: utxo.transactionHash,
        index: utxo.outputIndex,
        witnessUtxo: {
          script: Buffer.from(utxo.scriptPubKey, "hex"), // scriptPubKey as a Buffer
          value: utxo.amount, // Amount in satoshis
        },
      });
    }

    // Add outputs
    psbt.addOutput({
      address: toAddress,
      value: amountToSend,
    });

    const changeAmount =
      selectedUTXOs.reduce((acc, utxo) => acc + utxo.amount, 0) -
      amountToSend -
      transactionFee;
    if (changeAmount > 0) {
      psbt.addOutput({
        address: changeAddress,
        value: changeAmount,
      });
    }

    // Sign each input
    for (const utxo of selectedUTXOs) {
      const wallet = await Wallet.findOne({ publicAddress: utxo.address });
      if (!wallet) {
        throw new Error(`Wallet not found for address ${utxo.address}`);
      }
      const privateKey = decryptPrivateKey(wallet.encryptedPrivateKey);
      const keyPair = ecPair.fromWIF(privateKey, network);
      psbt.signInput(selectedUTXOs.indexOf(utxo), keyPair);
    }

    // Finalize and extract transaction
    psbt.finalizeAllInputs();
    const transaction = psbt.extractTransaction();

    return transaction.toHex();
  } catch (error) {
    throw new Error(
      `Error in creating raw Bitcoin transaction: ${error.message}`,
    );
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

/**
 * Adds a UTXO reference to a wallet.
 * This function is essential for updating the wallet's transaction history and balance.
 *
 * @async
 * @function addUTXOToWallet
 * @param {string} walletAddress - The public address of the wallet.
 * @param {string} utxoId - The ID of the UTXO to add to the wallet.
 * @return {Promise<Object>} The updated wallet object with the new UTXO reference.
 * @throws {NotFoundError} Thrown if the wallet or UTXO is not found.
 * @throws {Error} Thrown if there is an issue updating the wallet.
 */
const addUTXOToWallet = async (walletAddress, utxoId) => {
  try {
    // Retrieve the wallet by its public address
    const wallet = await Wallet.findOne({ publicAddress: walletAddress });
    if (!wallet) {
      throw new NotFoundError(`Wallet with address ${walletAddress} not found`);
    }

    // Check if UTXO already exists in the wallet to avoid duplicates
    if (!wallet.utxoRefs.includes(utxoId)) {
      // Add the UTXO reference to the wallet's UTXO references array
      wallet.utxoRefs.push(utxoId);
      await wallet.save();
      log.info(
        `UTXO with ID ${utxoId} added to wallet: ${wallet.publicAddress}`,
      );
    } else {
      log.info(
        `UTXO with ID ${utxoId} already exists in wallet: ${wallet.publicAddress}`,
      );
    }

    return wallet;
  } catch (err) {
    log.error(`Error in addUTXOToWallet: ${err.message}`);
    throw err;
  }
};

module.exports = {
  createSegWitWalletForEvent,
  createRawBitcoinTransaction,
  getWalletByAddress,
  updateWalletBalanceById,
  addUTXOToWallet,
};
