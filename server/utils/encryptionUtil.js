/**
 * @fileoverview Encryption Utility for Satoshi Showdown.
 * Provides functionalities for key encryption and decryption, focusing on securing private keys.
 * Uses AES-256-GCM for robust encryption with authentication tags for additional security.
 */

const crypto = require("crypto");

// Default to AES-256-GCM for strong encryption
const algorithm = "aes-256-gcm";
// Use a 32-byte key (256 bits) for AES-256
const secretKey = process.env.ENCRYPTION_SECRET_KEY;
// 12 bytes IV length for AES-GCM
const ivLength = 12;

/**
 * Encrypts a private key using AES-256-GCM encryption.
 *
 * @param {string} privateKey - The private key to encrypt.
 * @return {Object} Encrypted data with IV and authentication tag.
 * @throws {Error} If encryption configuration is missing or invalid.
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
 * Decrypts an encrypted private key.
 *
 * @param {Object} encryptedPrivateKey - The encrypted private key object with IV, content, and tag.
 * @return {string} The decrypted private key.
 * @throws {Error} If decryption process fails.
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
