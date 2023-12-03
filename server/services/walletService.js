const Wallet = require('../models/walletModel');
const walletUtil = require('../utils/walletUtil');

const WalletService = {
    async createWalletForEvent(eventId, userId) {
        const { address, encryptedPrivateKey } = walletUtil.generateSegWitWallet();

        // Create a new wallet with the provided details
        const wallet = new Wallet({
            publicAddress: address,
            encryptedPrivateKey,
            currencyType: "Bitcoin",
            user: userId
        });

        // Save and return the new wallet
        await wallet.save();
        return wallet;
    }
    // Additional wallet management functions can be added here
};

module.exports = WalletService;
