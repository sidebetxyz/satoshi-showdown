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
const network = process.env.BITCOIN_NETWORK; // Dynamically set network based on environment variable

/**
 * Generates a new SegWit Bitcoin wallet.
 * Creates a P2WPKH address and encrypts the corresponding private key.
 * 
 * @returns {Object} An object containing the generated address and the encrypted private key.
 */
const generateSegWitBitcoinWallet = () => {
    const keyPair = ECPair.makeRandom({ network });
    const { address } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network });
    const privateKey = keyPair.toWIF();
    const encryptedPrivateKey = encryptPrivateKey(privateKey);

    return { address, encryptedPrivateKey };
};

module.exports = {
    generateSegWitBitcoinWallet
};
