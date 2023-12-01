// encryption.js
/**
 * Encryption Utility
 *
 * Implements AES-256-GCM encryption to secure sensitive data, particularly wallet private keys.
 * This utility ensures strong cryptographic practices, including the use of a secure key,
 * random IVs for each operation, and integrity checking with GCM mode.
 */

const crypto = require("crypto");

const algorithm = "aes-256-gcm"; // AES-256 in GCM mode
const secretKey = process.env.ENCRYPTION_KEY; // Key should be 32 bytes (256 bits)
const ivLength = 16; // AES block size in bytes

// Encrypts text
exports.encrypt = (text) => {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString("hex"),
    content: encrypted,
    tag: tag.toString("hex"),
  };
};

// Decrypts text
exports.decrypt = (hash) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    Buffer.from(hash.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(hash.tag, "hex"));
  let dec = decipher.update(hash.content, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
};

// Ensure this utility is used in conjunction with secure key management practices
