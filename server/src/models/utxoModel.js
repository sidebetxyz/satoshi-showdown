const mongoose = require("mongoose");

// UTXO Schema Definition
const utxoSchema = new mongoose.Schema(
  {
    transactionHash: { type: String, required: true },
    outputIndex: { type: Number, required: true },
    amount: { type: Number, required: true },
    script: { type: String, required: true },
    addresses: [{ type: String }],
    spent: { type: Boolean, default: false },
    walletRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
  },
  { timestamps: true },
);

/**
 * UTXO Model: Represents an Unspent Transaction Output in the Satoshi Showdown platform.
 * Encapsulates the details of individual transaction outputs that are unspent.
 * This model is key for managing and tracking UTXOs, crucial for transaction creation and validation.
 *
 * @typedef {mongoose.Model<UTXOSchema>} UTXOModel
 */

// UTXO Model Creation
const UTXO = mongoose.model("UTXO", utxoSchema);

module.exports = UTXO;
