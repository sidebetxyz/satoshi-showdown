/**
 * @fileoverview Service for managing wallets in Satoshi Showdown.
 * Provides functionalities for creating and managing cryptocurrency wallets,
 * specifically tailored for event-related transactions.
 */

const Wallet = require('../models/walletModel');
const { generateSegWitBitcoinWallet } = require('../utils/keyUtil');

/**
 * Creates a wallet for a specific event and user.
 * Generates a new SegWit Bitcoin wallet and stores it in the database.
 *
 * @param {string} eventId - The ID of the event for which the wallet is being created.
 * @param {string} userId - The ID of the user to whom the wallet will belong.
 * @returns {Promise<Object>} The created wallet object.
 */
const createWalletForEvent = async (eventId, userId) => {
    const { address, encryptedPrivateKey } = generateSegWitBitcoinWallet();

    const wallet = new Wallet({
        publicAddress: address,
        encryptedPrivateKey,
        currencyType: "Bitcoin",
        user: userId
    });

    await wallet.save();
    return wallet;
};

module.exports = {
    createWalletForEvent
};
