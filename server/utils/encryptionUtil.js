/**
 * @fileoverview Encryption Utility for Satoshi Showdown.
 * Provides key encryption and decryption functionalities using environment-configured settings.
 * This abstraction enhances security by allowing encryption details to be managed and altered
 * without affecting the core application logic.
 */

const crypto = require("crypto");

const algorithm = process.env.PRIVATE_KEY_ALGORITHM;
const secretKey = process.env.PRIVATE_KEY_SECRET_KEY;
const ivLength = parseInt(process.env.PRIVATE_KEY_IV_LENGTH, 10);

/**
 * Encrypts a private key using AES encryption.
 * 
 * @param {string} key - The key to encrypt.
 * @returns {Object} The encrypted key, including iv (initialization vector) and auth tag.
 */
const encryptPrivateKey = (key) => {
  if (!algorithm || !secretKey || !ivLength) {
    throw new Error("Encryption configuration is not properly set in .env");
  }

  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    iv
  );
  let encrypted = cipher.update(key, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString("hex"),
    content: encrypted,
    tag: tag.toString("hex"),
  };
};

/**
 * Decrypts an encrypted private key.
 * 
 * @param {Object} encryptedKey - The encrypted private key object containing iv, content, and tag.
 * @returns {string} The decrypted key.
 */
const decryptPrivateKey = (encryptedKey) => {
  if (!algorithm || !secretKey || !ivLength) {
    throw new Error("Encryption configuration is not properly set in .env");
  }

  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    Buffer.from(encryptedKey.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(encryptedKey.tag, "hex"));
  let decrypted = decipher.update(encryptedKey.content, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

module.exports = { encryptPrivateKey, decryptPrivateKey };
