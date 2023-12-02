// encryptionUtil.js
/**
 * Encryption Utility for Satoshi Showdown
 *
 * Implements AES-256-GCM encryption to secure sensitive data.
 * Ensures strong cryptographic practices and integrity checking.
 */

const crypto = require("crypto");

const algorithm = "aes-256-gcm";
const secretKey = process.env.ENCRYPTION_KEY;
const ivLength = 16;

// Encrypt Text
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

// Decrypt Text
exports.decrypt = (hash) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    Buffer.from(hash.iv, "hex")
  );
  decipher.setAuthTag(Buffer.from(hash.tag, "hex"));
  let decrypted = decipher.update(hash.content, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
