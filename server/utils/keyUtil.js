// walletUtil.js
/**
 * Provides functionality for generating Segregated Witness (SegWit) Bitcoin wallets.
 * Utilizes bitcoinjs-lib and ecpair for creating wallet addresses and private keys,
 * and employs encryptionUtil for securing private keys.
 */

const bitcoin = require('bitcoinjs-lib');
const ECPairFactory = require('ecpair').default;
const ecc = require('tiny-secp256k1');
const encryptionUtil = require('./encryptionUtil');

// Initialize ECPair factory with tiny-secp256k1
const ECPair = ECPairFactory(ecc);

const network = bitcoin.networks.testnet; // Use bitcoin.networks.bitcoin for mainnet

const keyUtil = {
    /**
     * Generates a new SegWit Bitcoin wallet.
     * Creates a P2WPKH address and encrypts the corresponding private key.
     */
    generateSegWitWallet: function () {
        const keyPair = ECPair.makeRandom({ network });
        const { address } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network });
        const privateKey = keyPair.toWIF();
        const encryptedPrivateKey = encryptionUtil.encrypt(privateKey);

        return { address, encryptedPrivateKey };
    }
};

module.exports = keyUtil;
