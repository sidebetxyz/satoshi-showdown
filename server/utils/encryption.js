import crypto from "crypto";

const algorithm = "aes-256-ctr";
const secretKey = process.env.ENCRYPTION_KEY; // Ensure this is 32 bytes for AES-256

/**
 * Encrypts a text using AES-256-CTR algorithm.
 * @param {string} text - The text to be encrypted.
 * @returns {Object} The encrypted data with IV and content.
 */
export function encrypt(text) {
  const iv = crypto.randomBytes(16); // AES block size is 16 bytes
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    iv
  );
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
}

/**
 * Decrypts an encrypted hash back to the original text.
 * @param {Object} hash - The hash object containing IV and encrypted content.
 * @returns {string} The decrypted text.
 */
export function decrypt(hash) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    Buffer.from(hash.iv, "hex")
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString();
}
