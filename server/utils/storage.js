import WalletModel from "../models/walletModel.js";
import { encrypt, decrypt } from "./encryption.js";

/**
 * Stores a private key securely in the database after encryption.
 * @param {string} address - The associated wallet address.
 * @param {string} privateKey - The private key to be stored.
 * @returns {Promise<string>} The ID of the stored wallet.
 */
export async function storePrivateKey(address, privateKey) {
  try {
    const encryptedKey = encrypt(privateKey);
    const wallet = new WalletModel({ address, privateKey: encryptedKey });
    await wallet.save();

    return wallet._id;
  } catch (error) {
    console.error("Error storing private key:", error);
    throw error;
  }
}

/**
 * Retrieves a private key from the database using the wallet address.
 * @param {string} address - The address of the wallet.
 * @returns {Promise<string|null>} The decrypted private key or null if not found.
 */
export async function retrievePrivateKey(address) {
  try {
    const wallet = await WalletModel.findOne({ address });
    return wallet ? decrypt(wallet.privateKey) : null;
  } catch (error) {
    console.error("Error retrieving private key:", error);
    return null; // Or handle the error as appropriate
  }
}
