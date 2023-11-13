const WalletModel = require('../models/walletModel');
const { encrypt, decrypt } = require('../utils/encryption'); // Assuming you have encryption utilities

async function storePrivateKey(address, privateKey) {
    const wallets = WalletModel();
    await wallets.insertOne({ address, privateKey: encrypt(privateKey) });
}

async function retrievePrivateKey(address) {
    const wallets = WalletModel();
    const result = await wallets.findOne({ address });
    return result ? decrypt(result.privateKey) : null;
}

module.exports = { storePrivateKey, retrievePrivateKey };
