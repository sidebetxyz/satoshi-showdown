const WalletModel = require("../models/walletModel");
const { encrypt, decrypt } = require("../utils/encryption"); // Assuming you have encryption utilities

async function storePrivateKey(address, privateKey) {
  try {
    const wallets = WalletModel();
    const encryptedKey = encrypt(privateKey);
    await wallets.insertOne({ address, privateKey: encryptedKey });
  } catch (error) {
    console.error("Error storing private key:", error);
    throw error; // Or handle it as per your application's error handling strategy
  }
}

async function retrievePrivateKey(address) {
  try {
    const wallets = WalletModel();
    const result = await wallets.findOne({ address });
    return result ? decrypt(result.privateKey) : null;
  } catch (error) {
    console.error("Error retrieving private key:", error);
    return null; // Or handle the error as appropriate
  }
}

module.exports = { storePrivateKey, retrievePrivateKey };
