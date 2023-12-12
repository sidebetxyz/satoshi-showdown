/**
 * @fileoverview Wallet Model for Satoshi Showdown.
 * Manages cryptocurrency wallets for users, storing keys and transaction information.
 */

const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  publicAddress: { type: String, required: true, unique: true },
  encryptedPrivateKey: {
    iv: { type: String, required: true },
    content: { type: String, required: true },
    tag: { type: String, required: true }
  },
  walletType: {
    type: String,
    enum: ['SegWit', 'Taproot'],
    required: true
  },
  balance: { type: Number, default: 0 },
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
}, { timestamps: true }); // Enable automatic timestamps

const Wallet = mongoose.model('Wallet', walletSchema);
module.exports = Wallet;
