const crypto = require("crypto");

// Encryption/decryption settings
const algorithm = "aes-256-ctr"; // or another algorithm of your choice
const secretKey = process.env.ENCRYPTION_KEY; // should be 32 bytes for aes-256-ctr
const ivLength = 16; // AES block size in bytes

// Encrypt function
function encrypt(text) {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
}

// Decrypt function
function decrypt(hash) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(hash.iv, "hex")
  );

  const decrpyted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);

  return decrpyted.toString();
}

module.exports = { encrypt, decrypt };
