const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  publicAddress: { type: String, required: true, unique: true },
  encryptedPrivateKey: { iv: String, content: String },
  currencyType: { type: String, required: true, enum: ['Bitcoin', 'Ethereum', 'Others'] },
  balance: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware to update updatedAt on save
walletSchema.pre('save', function (next) {
  if (this.isModified() || this.isNew) {
    this.updatedAt = new Date();
  }
  next();
});

const Wallet = mongoose.model('Wallet', walletSchema);
module.exports = Wallet;

