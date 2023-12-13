/**
 * @fileoverview Encryption Utility for Satoshi Showdown.
 * Provides functionality for encrypting and decrypting private keys,
 * focusing on securing sensitive data. It uses AES-256-GCM encryption,
 * which includes an authentication tag for additional security.
 *
 * @module utils/encryptionUtil
 * @requires crypto - Node.js Crypto module for encryption.
 */

const crypto = require("crypto");

// Default encryption algorithm
const algorithm = "aes-256-gcm";

// Secret key for AES-256, retrieved from environment variables
const secretKey = process.env.ENCRYPTION_SECRET_KEY;

// Initialization Vector (IV) length for AES-GCM
const ivLength = 12;

/**
 * Encrypts a private key using AES-256-GCM.
 * Generates an IV for each encryption and includes an authentication tag.
 * Throws an error if the secret key is not set in environment variables.
 *
 * @function encryptPrivateKey
 * @param {string} privateKey - The private key to encrypt.
 * @return {Object} An object containing the IV, encrypted content, and authentication tag.
 * @throws {Error} If the encryption secret key is not set.
 */
const encryptPrivateKey = (privateKey) => {
  if (!secretKey) {
    throw new Error(
      "Encryption secret key is not set in environment variables.",
    );
  }

  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    iv,
  );

  let encrypted = cipher.update(privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    content: encrypted,
    tag: cipher.getAuthTag().toString("hex"),
  };
};

/**
 * Decrypts an encrypted private key using AES-256-GCM.
 * Uses the provided IV and authentication tag for decryption.
 * Throws an error if the decryption process fails.
 *
 * @function decryptPrivateKey
 * @param {Object} encryptedPrivateKey - The encrypted private key object containing the IV, content, and tag.
 * @return {string} The decrypted private key.
 * @throws {Error} If the decryption process fails or the secret key is not set.
 */
const decryptPrivateKey = (encryptedPrivateKey) => {
  if (!secretKey) {
    throw new Error(
      "Encryption secret key is not set in environment variables.",
    );
  }

  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    Buffer.from(encryptedPrivateKey.iv, "hex"),
  );
  decipher.setAuthTag(Buffer.from(encryptedPrivateKey.tag, "hex"));

  let decrypted = decipher.update(encryptedPrivateKey.content, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

module.exports = { encryptPrivateKey, decryptPrivateKey };
