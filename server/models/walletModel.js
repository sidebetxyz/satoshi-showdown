/**
 * @fileoverview Wallet Model for Satoshi Showdown.
 * Manages cryptocurrency wallets for users, storing keys and transaction information.
 */

const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  publicAddress: { type: String, required: true, unique: true },
  encryptedPrivateKey: Object, // Stores iv, content, and tag
  currencyType: {
    type: String,
    required: true,
    enum: ['Bitcoin', 'Ethereum', 'Others']
  },
  balance: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

walletSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const Wallet = mongoose.model('Wallet', walletSchema);
module.exports = Wallet;
