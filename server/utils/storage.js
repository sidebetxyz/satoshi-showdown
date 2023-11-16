const Wallet = require("../models/walletModel");
const { encrypt, decrypt } = require("./encryption"); // Assuming you have encryption utilities

async function storePrivateKey(address, privateKey) {
  try {
    const encryptedKey = encrypt(privateKey);
    const wallet = new Wallet({ address, privateKey: encryptedKey });
    await wallet.save();

    // Return the saved wallet's ID
    return wallet._id;
  } catch (error) {
    console.error("Error storing private key:", error);
    throw error;
  }
}

async function retrievePrivateKey(address) {
  try {
    const wallet = await Wallet.findOne({ address });
    return wallet ? decrypt(wallet.privateKey) : null;
  } catch (error) {
    console.error("Error retrieving private key:", error);
    return null; // Or handle the error as appropriate
  }
}

module.exports = { storePrivateKey, retrievePrivateKey };
