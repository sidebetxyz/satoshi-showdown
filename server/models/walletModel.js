// walletModel.js
/**
 * Wallet Model
 *
 * Facilitates management of cryptocurrency wallets in the Satoshi Showdown application,
 * incorporating security features and transaction tracking.
 */

const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  // Wallet identification
  publicAddress: { type: String, required: true, unique: true },
  encryptedPrivateKey: { iv: String, content: String },

  // Cryptocurrency details
  currencyType: {
    type: String,
    required: true,
    enum: ["Bitcoin", "Ethereum", "Others"],
  },
  balance: { type: Number, default: 0 },

  // User and transaction associations
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

walletSchema.pre("save", function (next) {
  if (!this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = Wallet;
