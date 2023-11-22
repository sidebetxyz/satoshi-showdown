const mongoose = require("mongoose");

// Wallet schema to manage user wallets.
const walletSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true }, // Blockchain address of the wallet.
  privateKey: {
    // Encrypted private key information.
    iv: { type: String, required: true },
    content: { type: String, required: true },
  },
  balance: { type: Number, default: 0 }, // Wallet balance for managing funds.
});

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = Wallet;
