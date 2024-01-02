const mongoose = require("mongoose");

const UTXOSchema = new mongoose.Schema(
  {
    transactionHash: { type: String, required: true }, // The hash of the transaction
    outputIndex: { type: Number, required: true }, // The output index in the transaction (vout)
    amount: { type: Number, required: true }, // Amount in satoshis
    address: { type: String, required: true }, // Address that owns this UTXO
    scriptPubKey: { type: String, required: true }, // ScriptPubKey for the output
    scriptType: { type: String, required: true }, // Type of script (e.g., pay-to-pubkey-hash)
    walletRef: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" }, // Reference to the wallet
    blockHeight: Number, // The block height at which this UTXO was mined
    timestamp: Date, // Timestamp of when the transaction was confirmed
    spent: { type: Boolean, default: false }, // Whether this UTXO has been spent
    spendingTxHash: String, // Reference to the transaction that spent this UTXO
    keyPath: { type: String, required: false }, // Optional: HD wallet key path for this UTXO
  },
  { timestamps: true },
);

const UTXO = mongoose.model("UTXO", UTXOSchema);

module.exports = UTXO;
