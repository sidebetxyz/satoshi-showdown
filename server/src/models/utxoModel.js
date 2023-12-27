const mongoose = require("mongoose");

const UTXOSchema = new mongoose.Schema({
  transactionHash: { type: String, required: true },
  outputIndex: { type: Number, required: true },
  amount: { type: Number, required: true }, // In satoshis
  address: { type: String, required: true },
  scriptPubKey: { type: String, required: true },
  scriptType: { type: String, required: true },
  spent: { type: Boolean, default: false },
  walletRef: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
  blockHeight: Number,
  timestamp: Date,
  // Reference to the spending transaction
  spendingTxHash: String,
});

const UTXO = mongoose.model("UTXO", UTXOSchema);

module.exports = UTXO;
