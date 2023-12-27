const UTXO = require("../models/utxoModel");
const log = require("../utils/logUtil");

const utxoService = {
  /**
   * Creates a new UTXO record in the database.
   * @param {Object} utxoData - Data for the new UTXO.
   * @return {Promise<Object>} The created UTXO object.
   */
  async createUTXO(utxoData) {
    try {
      const utxo = new UTXO(utxoData);
      await utxo.save();
      log.info("UTXO created:", utxo);
      return utxo;
    } catch (error) {
      log.error("Error creating UTXO:", error);
      throw error;
    }
  },

  /**
   * Finds UTXOs by address.
   * @param {string} address - The address to find UTXOs for.
   * @return {Promise<Array>} An array of UTXO objects.
   */
  async findUTXOsByAddress(address) {
    try {
      const utxos = await UTXO.find({ address, spent: false });
      return utxos;
    } catch (error) {
      log.error("Error finding UTXOs by address:", error);
      throw error;
    }
  },

  /**
   * Marks a UTXO as spent.
   * @param {string} transactionHash - The transaction hash of the UTXO.
   * @param {number} outputIndex - The output index of the UTXO.
   * @return {Promise<Object>} The updated UTXO object.
   */
  async markUTXOAsSpent(transactionHash, outputIndex) {
    try {
      const updatedUTXO = await UTXO.findOneAndUpdate(
        { transactionHash, outputIndex },
        { spent: true },
        { new: true },
      );
      if (!updatedUTXO) {
        throw new Error("UTXO not found");
      }
      log.info("UTXO marked as spent:", updatedUTXO);
      return updatedUTXO;
    } catch (error) {
      log.error("Error marking UTXO as spent:", error);
      throw error;
    }
  },

  // Additional functions as needed, such as getUnspentUTXOs, updateUTXO, etc.
};

module.exports = utxoService;
