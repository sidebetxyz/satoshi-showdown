const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  privateKey: { type: String, required: true },
  // You can add additional fields as needed, such as userId if wallets are tied to specific users
  // userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
