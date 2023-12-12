/**
 * @fileoverview Key Utility for Satoshi Showdown.
 * Provides functionalities related to cryptographic key generation and management,
 * specifically for Bitcoin wallets. Utilizes bitcoinjs-lib and tiny-secp256k1 for cryptographic operations.
 */

const bitcoin = require("bitcoinjs-lib");
const ecPairFactory = require("ecpair").default; // Rename the variable to start with a lowercase letter
const ecc = require("tiny-secp256k1");
const { encryptPrivateKey } = require("./encryptionUtil");

// Initialize ECPair factory with tiny-secp256k1
const ecPair = ecPairFactory(ecc); // Rename the variable to start with a lowercase letter

// Define the network for which to generate wallets (testnet or mainnet)
const network = bitcoin.networks.testnet;

/**
 * Generates a new SegWit Bitcoin wallet (P2WPKH).
 * @return {Object} An object containing the generated address and the encrypted private key.
 */
const generateSegWitBitcoinKeys = () => {
  const keyPair = ecPair.makeRandom({ network }); // Use ecPair instead of ECPair
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: keyPair.publicKey,
    network,
  });
  const privateKey = keyPair.toWIF();
  const encryptedPrivateKey = encryptPrivateKey(privateKey);
  return { address, encryptedPrivateKey };
};

/**
 * Generates a new Taproot Bitcoin wallet (P2TR).
 * @return {Object} An object containing the generated address and the encrypted private key.
 */
const generateTaprootBitcoinKeys = () => {
  const keyPair = ecPair.makeRandom({ network, compressed: false }); // Use ecPair instead of ECPair
  const { address } = bitcoin.payments.p2tr({
    pubkey: keyPair.publicKey,
    network,
  });
  const privateKey = keyPair.toWIF();
  const encryptedPrivateKey = encryptPrivateKey(privateKey);
  return { address, encryptedPrivateKey };
};

module.exports = {
  generateSegWitBitcoinKeys,
  generateTaprootBitcoinKeys,
};
