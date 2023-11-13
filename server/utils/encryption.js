const crypto = require("crypto");

const algorithm = "aes-256-ctr";
const secretKey = process.env.ENCRYPTION_KEY; // Ensure this is 32 bytes for AES-256

function encrypt(text) {
  const iv = crypto.randomBytes(16); // AES block size is 16 bytes
  const cipher = crypto.createCipheriv(
    "aes-256-ctr",
    Buffer.from(secretKey, "hex"),
    iv
  );
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  };
}

function decrypt(hash) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"), // Convert the hex string back to bytes
    Buffer.from(hash.iv, "hex") // The IV needs to be in byte format
  );

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString();
}

module.exports = { encrypt, decrypt };
