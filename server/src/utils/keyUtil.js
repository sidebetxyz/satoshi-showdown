/**
 * @fileoverview Key Utility for Satoshi Showdown.
 * This module provides functionalities related to cryptographic key generation and management,
 * especially for Bitcoin wallets. It utilizes bitcoinjs-lib and tiny-secp256k1 for cryptographic
 * operations and supports the generation of SegWit and Taproot Bitcoin wallet keys.
 *
 * @module utils/keyUtil
 * @requires bitcoinjs-lib - A JavaScript Bitcoin library for node.js and browsers.
 * @requires ecpair - Factory for creating Elliptic Curve pairs for Bitcoin.
 * @requires tiny-secp256k1 - A small elliptic curve library optimized for secp256k1 in JavaScript.
 * @requires utils/encryptionUtil - Utility for encrypting private keys.
 */

const bitcoin = require("bitcoinjs-lib");
const ecPairFactory = require("ecpair").default;
const ecc = require("tiny-secp256k1");
const { encryptPrivateKey } = require("./encryptionUtil");

// Initialize ECPair factory with tiny-secp256k1
const ecPair = ecPairFactory(ecc);

// Define the network for which to generate wallets (testnet or mainnet)
const network = bitcoin.networks.testnet;

/**
 * Generates a new SegWit Bitcoin wallet (P2WPKH).
 * Creates a random key pair and derives the corresponding SegWit address.
 * The private key is encrypted for security.
 *
 * @function generateSegWitBitcoinKeys
 * @return {Object} An object containing the generated SegWit address and the encrypted private key.
 */
const generateSegWitBitcoinKeys = () => {
  const keyPair = ecPair.makeRandom({ network });
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
 * Creates a random key pair and derives the corresponding Taproot address.
 * The private key is encrypted for security.
 *
 * @function generateTaprootBitcoinKeys
 * @return {Object} An object containing the generated Taproot address and the encrypted private key.
 */
const generateTaprootBitcoinKeys = () => {
  const keyPair = ecPair.makeRandom({ network, compressed: false });
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
