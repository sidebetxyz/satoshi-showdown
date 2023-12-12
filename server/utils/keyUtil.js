/**
 * @fileoverview Key Utility for Satoshi Showdown.
 * Provides functionalities related to cryptographic key generation and management,
 * specifically for Bitcoin wallets. Utilizes bitcoinjs-lib and tiny-secp256k1 for cryptographic operations.
 */

const bitcoin = require('bitcoinjs-lib');
const ECPairFactory = require('ecpair').default;
const ecc = require('tiny-secp256k1');
const { encryptPrivateKey } = require('./encryptionUtil');

// Initialize ECPair factory with tiny-secp256k1
const ECPair = ECPairFactory(ecc);

// Define the network for which to generate wallets (testnet or mainnet)
const network = bitcoin.networks.testnet;

/**
 * Generates a new SegWit Bitcoin wallet (P2WPKH).
 * @returns {Object} An object containing the generated address and the encrypted private key.
 */
const generateSegWitBitcoinKeys = () => {
    const keyPair = ECPair.makeRandom({ network });
    const { address } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network });
    const privateKey = keyPair.toWIF();
    const encryptedPrivateKey = encryptPrivateKey(privateKey);
    return { address, encryptedPrivateKey };
};

/**
 * Generates a new Taproot Bitcoin wallet (P2TR).
 * @returns {Object} An object containing the generated address and the encrypted private key.
 */
const generateTaprootBitcoinKeys = () => {
    const keyPair = ECPair.makeRandom({ network, compressed: false });
    const { address } = bitcoin.payments.p2tr({ pubkey: keyPair.publicKey, network });
    const privateKey = keyPair.toWIF();
    const encryptedPrivateKey = encryptPrivateKey(privateKey);
    return { address, encryptedPrivateKey };
};

module.exports = {
    generateSegWitBitcoinKeys,
    generateTaprootBitcoinKeys
};
