const UTXO = require("../models/utxoModel");
const log = require("../utils/logUtil");

/**
 * Creates a new UTXO record in the database.
 * @param {Object} utxoData - Data for the new UTXO.
 * @return {Promise<Object>} The created UTXO object.
 */
const createUTXO = async (utxoData) => {
  try {
    const utxo = new UTXO(utxoData);
    await utxo.save();
    log.info("UTXO created:", utxo);
    return utxo;
  } catch (error) {
    log.error("Error creating UTXO:", error);
    throw error;
  }
};

/**
 * Finds UTXOs by address.
 * @param {string} address - The address to find UTXOs for.
 * @return {Promise<Array>} An array of UTXO objects.
 */
const findUTXOsByAddress = async (address) => {
  try {
    const utxos = await UTXO.find({ address, spent: false });
    return utxos;
  } catch (error) {
    log.error("Error finding UTXOs by address:", error);
    throw error;
  }
};

/**
 * Marks a UTXO as spent.
 * @param {string} transactionHash - The transaction hash of the UTXO.
 * @param {number} outputIndex - The output index of the UTXO.
 * @return {Promise<Object>} The updated UTXO object.
 */
const markUTXOAsSpent = async (transactionHash, outputIndex) => {
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
};

/**
 * Selects UTXOs for a transaction based on specific criteria.
 * @param {string} userId - The user's ID to select UTXOs for.
 * @param {string} eventId - The event's ID to select UTXOs for.
 * @param {number} requiredAmount - The minimum total amount needed from the UTXOs.
 * @return {Promise<Array>} An array of selected UTXO objects.
 */
const selectUTXOsForTransaction = async (userId, eventId, requiredAmount) => {
  try {
    const utxos = await UTXO.find({
      userRef: userId,
      eventRef: eventId,
      spent: false,
    });

    const selectedUTXOs = [];
    let totalAmount = 0;

    for (const utxo of utxos) {
      if (totalAmount >= requiredAmount) break;
      selectedUTXOs.push(utxo);
      totalAmount += utxo.amount;
    }

    if (totalAmount < requiredAmount) {
      throw new Error("Insufficient funds: Unable to select enough UTXOs.");
    }

    return selectedUTXOs;
  } catch (error) {
    log.error("Error selecting UTXOs for transaction:", error);
    throw error;
  }
};

/**
 * Selects UTXOs for awarding a winner based on the event's ID and the required amount.
 * This function is tailored for selecting UTXOs for the purpose of awarding event winners.
 * It aggregates UTXOs related to an event until the required amount is met or exceeded.
 * @param {string} eventId - The event's ID to select UTXOs for.
 * @param {number} requiredAmount - The minimum total amount needed from the UTXOs.
 * @return {Promise<Array>} An array of selected UTXO objects.
 */
const selectUTXOsForAward = async (eventId, requiredAmount) => {
  try {
    const utxos = await UTXO.find({
      eventRef: eventId,
      spent: false
    });

    const selectedUTXOs = [];
    let totalAmount = 0;

    for (const utxo of utxos) {
      if (totalAmount >= requiredAmount) break;
      selectedUTXOs.push(utxo);
      totalAmount += utxo.amount;
    }

    if (totalAmount < requiredAmount) {
      throw new Error("Insufficient funds: Unable to select enough UTXOs.");
    }

    return selectedUTXOs;
  } catch (error) {
    log.error("Error selecting UTXOs for award:", error);
    throw error;
  }
};

module.exports = {
  createUTXO,
  findUTXOsByAddress,
  markUTXOAsSpent,
  selectUTXOsForTransaction,
  selectUTXOsForAward,
};
