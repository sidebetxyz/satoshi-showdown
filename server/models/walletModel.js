const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true },
  privateKey: {
    iv: { type: String, required: true },
    content: { type: String, required: true },
  },
  // Additional fields as necessary
});

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
