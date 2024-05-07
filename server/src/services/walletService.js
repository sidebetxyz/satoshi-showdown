/**
 * @fileoverview Wallet Service for Satoshi Showdown.
 * Provides functionalities for managing cryptocurrency wallets, specifically focusing on HD SegWit Bitcoin wallets.
 * It includes operations such as wallet creation, retrieval, balance update, transaction association, and generating new addresses.
 * This service is essential for financial transactions within the platform, ensuring secure and efficient management of wallets.
 *
 * @module services/walletService
 * @requires models/walletModel - Wallet data model for database interactions.
 * @requires utils/keyUtil - Utility functions for generating and handling Bitcoin keys.
 * @requires utils/errorUtil - Custom error classes and error handling utilities.
 * @requires utils/logUtil - Logging utility for application-wide logging.
 */

const Wallet = require("../models/walletModel");
const UTXO = require("../models/utxoModel");
const { createUTXO } = require("../services/utxoService");
const {
  generateHDSegWitWalletWithSeed,
  generateChildAddress,
} = require("../utils/keyUtil");
const { decryptPrivateKey } = require("../utils/encryptionUtil");
const { NotFoundError } = require("../utils/errorUtil");
const log = require("../utils/logUtil");

const bitcoin = require("bitcoinjs-lib");
const network = bitcoin.networks.testnet;

const ecPairFactory = require("ecpair").default;
const { BIP32Factory } = require("bip32");
const ecc = require("tiny-secp256k1");

// Initialize bip32 with tiny-secp256k1
const bip32 = BIP32Factory(ecc);

// Initialize ECPair factory with tiny-secp256k1
const ecPair = ecPairFactory(ecc);

/**
 * Creates a new HD SegWit wallet for an event, including the seed.
 *
 * @async
 * @function createHDSegWitWalletForEvent
 * @return {Promise<Object>} The created wallet object, including master public key, encrypted master private key, and encrypted seed.
 * @throws {Error} If there's an issue in wallet generation or saving the wallet to the database.
 */
const createHDSegWitWalletForEvent = async () => {
  const {
    masterPublicKey,
    encryptedMasterPrivateKey,
    encryptedSeed,
    derivationPath,
  } = generateHDSegWitWalletWithSeed();

  console.log("Master Public Key:", masterPublicKey);
  console.log("Encrypted Master Private Key:", encryptedMasterPrivateKey);
  console.log("Encrypted Seed:", encryptedSeed);
  console.log("Derivation Path:", derivationPath);

  const wallet = new Wallet({
    walletType: "HD-SegWit",
    masterPublicKey,
    encryptedMasterPrivateKey,
    encryptedSeed,
    derivationPath,
  });

  // Generate the initial address and path for the wallet
  const initialAddressData = await generateChildAddressForWallet(
    masterPublicKey,
    0,
  );

  // Add the initial address and path to the addresses array
  wallet.addresses.push(initialAddressData);

  try {
    await wallet.save();
    log.info(`HD Wallet created for event`);
    return wallet;
  } catch (err) {
    log.error(`Error in createHDSegWitWalletForEvent: ${err.message}`);
    throw err;
  }
};

/**
 * Generates a new child address from a given HD wallet's master public key.
 *
 * @async
 * @function generateChildAddressForWallet
 * @param {string} masterPublicKey - The master public key of the HD wallet.
 * @param {string} path - The derivation path for the child address.
 * @return {Promise<Object>} An object containing the child address and path.
 * @throws {Error} If there's an issue in address generation.
 */
const generateChildAddressForWallet = async (masterPublicKey, path) => {
  try {
    const { address, path: derivedPath } = generateChildAddress(
      masterPublicKey,
      path,
    );
    log.info(`Child address generated at path ${derivedPath}`);
    return { address, path: derivedPath };
  } catch (err) {
    log.error(`Error in generateChildAddressForWallet: ${err.message}`);
    throw err;
  }
};

/**
 * Creates a raw Bitcoin transaction using UTXOs, target address, amount, change address, and a pre-calculated transaction fee.
 * It signs the transaction inputs with the corresponding decrypted private keys from the wallets and includes the necessary witness scripts for SegWit transactions.
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
      console.log(utxo);
      const wallet = await Wallet.findOne({
        "addresses.address": utxo.address,
      });
      if (!wallet) {
        throw new Error(`Wallet not found for address ${utxo.address}`);
      }
      const decryptedMasterPrivateKey = decryptPrivateKey(
        wallet.encryptedMasterPrivateKey,
      );
      const node = bip32.fromBase58(decryptedMasterPrivateKey, network);
      const child = node.derivePath(utxo.keyPath);
      const pubkey = child.publicKey;

      const p2wpkh = bitcoin.payments.p2wpkh({ pubkey, network });
      psbt.addInput({
        hash: utxo.transactionHash,
        index: utxo.outputIndex,
        witnessUtxo: {
          script: Buffer.from(utxo.scriptPubKey, "hex"),
          value: utxo.amount,
        },
      });
      console.log(psbt.data.inputs);
    }

    // Add outputs for toAddress and changeAddress
    psbt.addOutput({
      address: toAddress,
      value: amountToSend,
    });

    const totalAmount = selectedUTXOs.reduce(
      (sum, utxo) => sum + utxo.amount,
      0,
    );
    const changeAmount = totalAmount - amountToSend - transactionFee;
    if (changeAmount > 0) {
      psbt.addOutput({ address: changeAddress, value: changeAmount });
    }
    console.log("totalAmount:", totalAmount);
    console.log("changeAmount:", changeAmount);

    // Sign each input
    for (const [index, utxo] of selectedUTXOs.entries()) {
      const wallet = await Wallet.findOne({
        "addresses.address": utxo.address,
      });
      const decryptedMasterPrivateKey = decryptPrivateKey(
        wallet.encryptedMasterPrivateKey,
      );
      const node = bip32.fromBase58(decryptedMasterPrivateKey, network);
      const child = node.derivePath(utxo.keyPath);
      const keyPair = ecPair.fromPrivateKey(child.privateKey, {
        network: network,
      });
      psbt.signInput(index, keyPair);
    }

    console.log(psbt.data.inputs);
    console.log("OUTPUTS:", psbt.data.outputs);

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
 * Retrieves a wallet by its MongoDB ObjectId from the database.
 * This function is essential for operations that require wallet details based on its unique ID.
 *
 * @async
 * @function getWalletById
 * @param {string} walletId - The MongoDB ObjectId of the wallet to retrieve.
 * @return {Promise<Wallet>} A promise that resolves to the wallet object.
 * @throws {NotFoundError} Thrown if no wallet is found with the given ID.
 */
const getWalletById = async (walletId) => {
  try {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      throw new NotFoundError(`Wallet with ID ${walletId} not found`);
    }
    return wallet;
  } catch (err) {
    log.error(`Error in getWalletById: ${err.message}`);
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

    // Calculate potential new balances
    const updatedConfirmedBalance =
      existingWallet.confirmedBalance +
      (updateData.confirmedIncrement || 0) -
      (updateData.confirmedDecrement || 0);
    const updatedUnconfirmedBalance =
      existingWallet.unconfirmedBalance +
      (updateData.unconfirmedIncrement || 0) -
      (updateData.unconfirmedDecrement || 0);

    // Check if there are actual changes to apply
    if (
      existingWallet.confirmedBalance !== updatedConfirmedBalance ||
      existingWallet.unconfirmedBalance !== updatedUnconfirmedBalance
    ) {
      const updatesToApply = {
        confirmedBalance: updatedConfirmedBalance,
        unconfirmedBalance: updatedUnconfirmedBalance,
      };

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
 * @param {string} walletRef - The MongoDB ObjectId of the wallet.
 * @param {string} utxoId - The ID of the UTXO to add to the wallet.
 * @return {Promise<Object>} The updated wallet object with the new UTXO reference.
 * @throws {NotFoundError} Thrown if the wallet or UTXO is not found.
 * @throws {Error} Thrown if there is an issue updating the wallet.
 */
const addUTXOToWallet = async (walletRef, utxoData) => {
  try {
    // Retrieve the wallet by its MongoDB ObjectId
    const wallet = await Wallet.findById(walletRef);
    if (!wallet) {
      throw new NotFoundError(`Wallet with ID ${walletRef} not found`);
    }

    // Find the address data within the wallet to get the keyPath
    const addressData = wallet.addresses.find(
      (a) => a.address === utxoData.address,
    );
    if (!addressData) {
      throw new Error(`Address data not found for ${utxoData.address}`);
    }

    // Add keyPath to the UTXO data
    utxoData.keyPath = addressData.path;

    // Create UTXO with complete data
    const utxo = await createUTXO(utxoData);

    // Check if UTXO already exists in the wallet to avoid duplicates
    if (!wallet.utxoRefs.includes(utxo._id)) {
      // Add the UTXO reference to the wallet's UTXO references array
      wallet.utxoRefs.push(utxo._id);
      await wallet.save();
      log.info(`UTXO with ID ${utxo._id} added to wallet with ID ${walletRef}`);
    } else {
      log.info(
        `UTXO with ID ${utxo._id} already exists in wallet with ID ${walletRef}`,
      );
    }

    return wallet;
  } catch (err) {
    log.error(`Error in addUTXOToWallet: ${err.message}`);
    throw err;
  }
};

/**
 * Creates a raw Bitcoin transaction with an accurately calculated fee.
 *
 * @async
 * @function createAccurateFeeBitcoinTransaction
 * @param {Array} selectedUTXOs - Array of UTXOs to be used in the transaction.
 * @param {string} toAddress - The Bitcoin address to send the amount to.
 * @param {number} amountToSend - The amount to send in satoshis.
 * @param {string} changeAddress - The address where the change will be sent.
 * @param {number} feeRate - The fee rate in satoshis per byte.
 * @return {Promise<string>} - A promise that resolves to the raw transaction hex string.
 * @throws {Error} - Throws an error if transaction creation fails.
 */
const createAccurateFeeBitcoinTransaction = async (
  selectedUTXOs,
  toAddress,
  amountToSend,
  changeAddress,
  feeRate,
) => {
  try {
    const psbt = new bitcoin.Psbt({ network: network });

    // Add inputs
    selectedUTXOs.forEach((utxo) => {
      psbt.addInput({
        hash: utxo.transactionHash,
        index: utxo.outputIndex,
        witnessUtxo: {
          script: Buffer.from(utxo.scriptPubKey, "hex"),
          value: utxo.amount,
        },
      });
    });

    // Add outputs (initially without considering the transaction fee)
    psbt.addOutput({ address: toAddress, value: amountToSend });

    // Total amount from all UTXOs
    const totalInputAmount = selectedUTXOs.reduce(
      (acc, utxo) => acc + utxo.amount,
      0,
    );

    // Adding a dummy output for change to calculate the transaction size
    psbt.addOutput({
      address: changeAddress,
      value: totalInputAmount - amountToSend,
    });

    // Calculate the size of the transaction to estimate the fee
    const virtualSize = psbt.__CACHE.__TX.virtualSize();
    const estimatedFee = Math.ceil(virtualSize * feeRate);

    // Recalculate and update the change output considering the estimated fee
    const changeValue = totalInputAmount - amountToSend - estimatedFee;
    psbt.updateOutput(1, { address: changeAddress, value: changeValue });

    // Sign each input
    selectedUTXOs.forEach((utxo, index) => {
      const keyPair = ecPair.fromWIF(utxo.privateKeyWIF, network);
      psbt.signInput(index, keyPair);
    });

    // Finalize and extract the transaction
    psbt.finalizeAllInputs();
    const transaction = psbt.extractTransaction();

    return transaction.toHex();
  } catch (error) {
    throw new Error(
      `Error in creating accurate fee Bitcoin transaction: ${error.message}`,
    );
  }
};

module.exports = { createAccurateFeeBitcoinTransaction };

module.exports = {
  createHDSegWitWalletForEvent,
  createRawBitcoinTransaction,
  getWalletById,
  getWalletByAddress,
  updateWalletBalanceById,
  createHDSegWitWalletForEvent,
  generateChildAddressForWallet,
  addUTXOToWallet,
};
