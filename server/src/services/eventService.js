/**
 * @fileoverview Event Service for Satoshi Showdown.
 * Provides functionalities for managing event-related operations such as creating,
 * updating, deleting, and retrieving events. Also manages financial transactions
 * and webhooks associated with events. This service acts as a bridge between the
 * event controllers and the database models, ensuring that business logic and data
 * manipulation are handled effectively.
 *
 * @module services/eventService
 * @requires models/eventModel - Event data model for database interactions.
 * @requires services/walletService - Service for wallet management, crucial for financial transactions.
 * @requires services/transactionService - Service for creating and managing transaction records.
 * @requires services/webhookService - Service for managing webhooks, important for event notifications.
 * @requires services/userService - Service for user management, used for verifying user details.
 * @requires utils/validationUtil - Utility for data validation, ensures the integrity of input data.
 * @requires utils/errorUtil - Custom error classes and error handling utilities for consistent error management.
 * @requires utils/logUtil - Logging utility for application-wide logging, critical for monitoring and debugging.
 */

const Event = require("../models/eventModel");
const Wallet = require("../models/walletModel");
const {
  selectUTXOsForTransaction,
  selectUTXOsForAward,
  markUTXOAsSpent,
} = require("./utxoService");
const {
  createHDSegWitWalletForEvent,
  generateChildAddressForWallet,
  createRawBitcoinTransaction,
} = require("./walletService");
const {
  createTransactionRecord,
  createRefundTransactionRecord,
  getTransactionRecordById,
} = require("./transactionService");
const { createWebhook } = require("./webhookService");
const { getUserById } = require("./userService");
const { validateEvent } = require("../utils/validationUtil");
const {
  getCurrentFeeRates,
  estimateTransactionFee,
  adjustAmountForFee,
} = require("../utils/feeUtil");
const { ValidationError, NotFoundError } = require("../utils/errorUtil");
const log = require("../utils/logUtil");

/**
 * Creates a new event based on the provided user and event data, including financial setup.
 * This process involves validating the event data, setting up a wallet, creating a transaction record,
 * and saving the event to the database. The function returns both the created event and transaction details.
 *
 * @async
 * @function createEvent
 * @param {Object} eventData - Comprehensive data for creating the event.
 * @return {Promise<{event: Object, transaction: Object}>} An object containing the created event and transaction details.
 * @throws {ValidationError} If the event data does not pass validation.
 * @throws {NotFoundError} If the user is not found in the database.
 */
const createEvent = async (eventData) => {
  try {
    // Destructure all necessary fields from eventData
    const { userId, userAddress, prizePoolContribution, ...eventDetails } =
      eventData;

    // Fetch the user based on userId
    const user = await getUserById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // Set the event creator and calculate the total prize pool
    eventDetails.creator = user._id.toString();
    eventDetails.prizePool = eventDetails.entryFee + prizePoolContribution;

    // Validate the event details
    const validation = validateEvent(eventDetails);
    if (validation.error) {
      throw new ValidationError(
        `Invalid event data: ${validation.error.details
          .map((d) => d.message)
          .join("; ")}`,
      );
    }

    // Handle the financial setup for the event
    const financialSetup = await handleFinancialSetup(
      userAddress,
      user._id,
      eventDetails.entryFee,
      prizePoolContribution,
    );

    // Add transaction reference to event details
    eventDetails.transactions = [financialSetup.transaction._id];
    eventDetails.walletRef = financialSetup.wallet._id;

    // Create and save the new event
    const newEvent = new Event(eventDetails);
    // Automatically add event creator as a participant
    newEvent.participants.push({
      userId: user._id,
      depositAddress: financialSetup.wallet.addresses[0].address,
      userAddress,
      joinedAt: new Date(),
    });
    await newEvent.save();

    // Now create a webhook for the event
    const webhook = await createWebhook(
      financialSetup.wallet.addresses[0].address,
      financialSetup.wallet._id,
      financialSetup.transaction._id,
      user._id,
      newEvent._id,
    );

    log.info(`New event created with webhook: ${newEvent._id}`);
    return {
      event: newEvent,
      transaction: financialSetup.transaction,
      webhook: webhook,
    };
  } catch (err) {
    log.error(`Error in createEvent: ${err.message}`);
    throw err;
  }
};

/**
 * Updates an existing event based on the provided event ID and update data.
 * This function looks up the event by its ID and applies the provided updates.
 * It ensures that the event data is kept current and accurate.
 *
 * @async
 * @function updateEvent
 * @param {string} eventId - ID of the event to be updated.
 * @param {Object} updateData - Data containing the updates to be applied to the event.
 * @param {string} updateData.name - Updated name of the event.
 * @param {string} updateData.description - Updated detailed description of the event.
 * @param {string} updateData.type - Updated type or category of the event.
 * @param {Date} updateData.startTime - Updated scheduled start time of the event.
 * @param {Date} updateData.endTime - Updated scheduled end time of the event.
 * @param {string} updateData.status - Updated current status of the event.
 * @param {number} updateData.entryFee - Updated entry fee required to participate in the event.
 * @param {number} updateData.prizePool - Updated total prize pool available for the event winners.
 * @param {ObjectID} updateData.creator - Updated reference to the User model for the event creator.
 * @param {Array} updateData.participants - Updated list of participants in the event.
 * @param {Array} updateData.transactions - Updated associated financial transactions.
 * @param {Array} updateData.winners - Updated list of winners of the event.
 * @param {Object} updateData.config - Updated custom configuration options for the event.
 * @param {string} updateData.streamingUrl - Updated URL for live streaming of the event.
 * @param {Object} updateData.streamingSchedule - Updated schedule for the streaming of the event.
 * @param {Array} updateData.bettingOptions - Updated betting options available for the event.
 * @param {number} updateData.viewCount - Updated number of views or attendance count for the event.
 * @param {Array} updateData.feedback - Updated user feedback associated with the event.
 * @param {Array} updateData.socialSharingLinks - Updated links for social sharing of the event.
 * @param {number} updateData.ageRestriction - Updated age restriction for participation or viewing.
 * @param {Array} updateData.geographicRestrictions - Updated geographic restrictions for the event.
 * @return {Promise<Object>} The updated event object, reflecting the changes made.
 * @throws {NotFoundError} When no event with the provided ID is found in the database.
 */
const updateEvent = async (eventId, updateData) => {
  try {
    const event = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
    });
    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }
    log.info(`Event updated: ${event._id}`);
    return event;
  } catch (err) {
    log.error(`Error in updateEvent: ${err.message}`);
    throw err;
  }
};

/**
 * Adds a user to an event if there is space available, creates a transaction record,
 * and sets up a webhook for transaction monitoring.
 * Also handles optional prize pool contribution by the user.
 *
 * @async
 * @function joinEvent
 * @param {string} eventId - The unique identifier of the event to join.
 * @param {string} userId - The unique identifier (UUID) of the user attempting to join the event.
 * @param {number} [prizePoolContribution=0] - Optional contribution to the prize pool by the user.
 * @return {Promise<Object>} The updated event object reflecting the new participant and transaction.
 * @throws {NotFoundError} If the specified event or user is not found.
 * @throws {Error} If the event is already full or closed for new participants.
 */
const joinEvent = async (
  eventId,
  userId,
  userWalletAddress,
  prizePoolContribution = 0,
) => {
  try {
    // Find the event by its ID.
    const event = await Event.findOne({ eventId: eventId });
    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }

    if (
      event.creator.toString() === userId ||
      event.participants.some(
        (participant) => participant.userId.toString() === userId,
      )
    ) {
      throw new Error(
        "Event creator or an already participating user cannot join the event",
      );
    }

    // Check if the event is open for new participants and not already full.
    if (!event.isOpen || event.participants.length >= event.maxParticipants) {
      throw new Error("Event is full or closed for new participants");
    }

    // Retrieve the user based on the provided userId.
    const user = await getUserById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // Retrieve the wallet
    const wallet = await Wallet.findById(event.walletRef);
    if (!wallet) {
      throw new NotFoundError(`Wallet with ID ${event.walletRef} not found`);
    }

    // Calculate total transaction amount (entry fee + optional prize pool contribution)
    const totalAmount = event.entryFee + prizePoolContribution;

    // Determine the next child index for the new address
    const childIndex = wallet.addresses.length;

    // Generate a new address based on the wallet
    const userDepositAddressData = await generateChildAddressForWallet(
      wallet.masterPublicKey,
      childIndex,
    );

    // Add the new address and path to the wallet
    wallet.addresses.push(userDepositAddressData);

    // Save the updated wallet
    await wallet.save();

    const transactionData = {
      userRef: user._id,
      walletRef: event.walletRef,
      transactionType: "incoming",
      expectedAmount: totalAmount,
      walletAddresses: [userDepositAddressData.address], // Add address to the first slot in the array      userAddress: userWalletAddress,
      userAddress: userWalletAddress,
      purpose:
        prizePoolContribution > 0 ? "payFeeAndFundPool" : "entryFeePayment",
    };

    const transaction = await createTransactionRecord(transactionData);

    // Update the prize pool if there's a contribution
    if (prizePoolContribution > 0) {
      event.prizePool += prizePoolContribution;
    }

    event.prizePool += event.entryFee;

    // Add the user to the event's participants list
    event.participants.push({
      userId: user._id,
      depositAddress: userDepositAddressData.address,
      userAddress: userWalletAddress,
      joinedAt: new Date(),
    });
    event.transactions.push(transaction._id);

    // Update event status to 'active' if it reaches the minimum number of participants.
    if (event.participants.length === event.minParticipants) {
      event.isOpen = false;
      event.status = "active";
    }

    // Save the updated event information to the database.
    await event.save();

    // Create a webhook for the transaction
    const webhook = await createWebhook(
      userDepositAddressData.address,
      wallet._id,
      transaction._id,
      user._id,
      event._id,
    );

    // Return the updated event object including transaction details.
    return {
      event: event,
      transaction: transaction,
      webhook: webhook,
    };
  } catch (err) {
    log.error(`Error in joinEvent: ${err.message}`);
    throw err;
  }
};

/**
 * Retrieves a specific event by its unique ID.
 * This function is used to get detailed information about a single event,
 * including its data and related transactions or webhooks.
 *
 * @async
 * @function getEvent
 * @param {string} eventId - ID of the event to be retrieved.
 * @return {Promise<Object>} The event object corresponding to the specified ID.
 * @throws {NotFoundError} When the event with the given ID does not exist in the database.
 */
const getEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }
    return event;
  } catch (err) {
    log.error(`Error in getEvent: ${err.message}`);
    throw err;
  }
};

/**
 * Retrieves all events available in the system.
 * This function is typically used to list all events, for example, in an administrative
 * dashboard or a public event listing. It provides a complete overview of all events.
 *
 * @async
 * @function getAllEvents
 * @return {Promise<Array>} An array containing all event objects in the database.
 */
const getAllEvents = async () => {
  try {
    return await Event.find({});
  } catch (err) {
    log.error(`Error in getAllEvents: ${err.message}`);
    throw err;
  }
};

/**
 * Deletes an event from the system based on its ID.
 * This function removes the event and any associated data from the database,
 * effectively canceling the event and cleaning up resources.
 *
 * @async
 * @function deleteEvent
 * @param {string} eventId - ID of the event to be deleted.
 * @return {Promise<void>} Indicates successful deletion of the event.
 * @throws {NotFoundError} When the event with the specified ID is not found.
 */
const deleteEvent = async (eventId) => {
  try {
    const event = await Event.findByIdAndRemove(eventId);
    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }
    log.info(`Event deleted: ${event._id}`);
  } catch (err) {
    log.error(`Error in deleteEvent: ${err.message}`);
    throw err;
  }
};

/**
 * Handles the financial setup for an event, including wallet and transaction creation.
 * This private function is used by `createEvent` to encapsulate the financial aspects of event setup.
 * It ensures a smooth and error-free process by creating a wallet and transaction for the event.
 *
 * @async
 * @private
 * @function handleFinancialSetup
 * @param {string} userAddress - Bitcoin address for the transaction.
 * @param {string} userRef - User reference ID.
 * @param {number} entryFee - Entry fee required to participate in the event.
 * @param {number} prizePoolContribution - Contribution to the prize pool, if any.
 * @return {Promise<Object>} An object containing details about the wallet and transaction created.
 * @throws {Error} When financial setup encounters an error, such as wallet creation failure.
 */
const handleFinancialSetup = async (
  userAddress,
  userRef,
  entryFee,
  prizePoolContribution,
) => {
  try {
    // Calculate the total amount the user needs to send in
    const totalAmount = entryFee + prizePoolContribution;
    let transactionPurpose;

    if (prizePoolContribution > 0) {
      transactionPurpose = "payFeeAndFundPool";
    } else {
      transactionPurpose = "entryFeePayment";
    }

    // MOVE THIS TO A SEPARATE FUNCTION
    // Generate a unique random amount of satoshis
    const uniqueSatoshis = Math.floor(Math.random() * 1000); // Adjust the range as needed
    // Add the unique amount to the total
    const expectedAmount = totalAmount + uniqueSatoshis;
    // END OF MOVE THIS TO A SEPARATE FUNCTION

    // Create a SegWit wallet for the event
    const wallet = await createHDSegWitWalletForEvent();

    // Prepare transaction data for the financial setup
    const transactionData = {
      userRef: userRef,
      walletRef: wallet._id,
      transactionType: "incoming",
      expectedAmount: expectedAmount,
      unconfirmedAmount: expectedAmount,
      walletAddresses: [wallet.addresses[0].address],
      userAddress: userAddress,
      purpose: transactionPurpose,
    };

    // Create a transaction record for the event
    const transaction = await createTransactionRecord(transactionData);

    log.info(
      `Financial setup completed for event: Wallet and transaction created`,
    );

    // Return an object containing wallet and transaction details
    return { wallet, transaction };
  } catch (err) {
    log.error(`Error in handleFinancialSetup: ${err.message}`);
    throw new Error(
      `Failed to set up financial aspects of the event: ${err.message}`,
    );
  }
};

/**
 * Refunds the creator of an event.
 * @async
 * @function refundEventCreator
 * @param {string} eventId - ID of the event to refund.
 * @return {Promise<Object>} Details of the refund transaction.
 * @throws {Error} If the refund process encounters an issue.
 */
const refundEventCreator = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }

    // Retrieve the original transaction record
    const originalTransactionId = event.transactions[0];
    const originalTransaction = await getTransactionRecordById(
      originalTransactionId,
    );

    const refundAmount = originalTransaction.confirmedAmount; // Assuming full refund
    const selectedUTXOs = await selectUTXOsForTransaction(
      event.creator,
      eventId,
      refundAmount,
    );

    // Fetch current fee rates and estimate transaction fee
    const feeRates = await getCurrentFeeRates();
    const feeRate = feeRates.lowFeePerByte;
    const estimatedFee = estimateTransactionFee(
      selectedUTXOs.length,
      1,
      feeRate,
    ); // Assuming 1 output

    console.log(feeRates);
    console.log(feeRate);
    console.log(estimatedFee);

    const adjustedRefundAmount = adjustAmountForFee(refundAmount, estimatedFee);

    // Prepare the refund transaction data
    const refundTransactionData = {
      userRef: originalTransaction.userRef,
      walletRef: originalTransaction.walletRef,
      transactionType: "outgoing",
      purpose: "refundUser",
      walletAddress: originalTransaction.walletAddress,
      userAddress: originalTransaction.userAddress,
      expectedAmount: adjustedRefundAmount,
      unconfirmedAmount: adjustedRefundAmount,
      confirmedAmount: 0,
      status: "pending",
      transactionHash: null,
    };

    const refundTransaction = await createRefundTransactionRecord(
      refundTransactionData,
    );

    event.status = "cancelled";
    event.transactions.push(refundTransaction._id);
    event.prizePool = 0;
    event.isOpen = false;
    event.closedAt = new Date();

    await event.save();

    // await createWebhook(refundTransaction.walletAddress, refundTransaction._id, event.creator, event._id);

    for (const utxo of selectedUTXOs) {
      await markUTXOAsSpent(utxo.transactionHash, utxo.outputIndex);
    }

    // Specify a change address - ideally, this should be a new address generated for the event or user
    const changeAddress =
      event.walletAddress || originalTransaction.walletAddress;

    const rawTransaction = await createRawBitcoinTransaction(
      selectedUTXOs,
      refundTransaction.userAddress,
      refundAmount - estimatedFee,
      changeAddress,
      estimatedFee,
    );

    console.log(rawTransaction);

    log.info(`Refund processed for event: ${eventId}`);
    return refundTransaction;
  } catch (err) {
    log.error(`Error in refundEventCreator: ${err.message}`);
    throw err;
  }
};

/**
 * Refunds a user associated with an event or a specific transaction.
 * @async
 * @function refundUser
 * @param {string} userId - ID of the user to refund.
 * @param {string} eventId - ID of the event associated with the refund.
 * @param {number} [refundAmount] - Amount to refund. If not provided, full amount is refunded.
 * @return {Promise<Object>} Details of the refund transaction.
 * @throws {Error} If the refund process encounters an issue.
 */
const refundUser = async (userId, eventId, refundAmount = null) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }

    // Determine the transaction to refund
    let transactionToRefund;
    for (const transactionId of event.transactions) {
      const transaction = await getTransactionRecordById(transactionId);
      if (transaction.userRef.toString() === userId.toString()) {
        transactionToRefund = transaction;
        break;
      }
    }

    if (!transactionToRefund) {
      throw new Error(
        `No transaction found for user ID ${userId} in event ID ${eventId}`,
      );
    }

    // If refundAmount not specified, refund the full transaction amount
    refundAmount = refundAmount || transactionToRefund.confirmedAmount;

    // Select UTXOs for the refund transaction
    const selectedUTXOs = await selectUTXOsForTransaction(
      userId,
      eventId,
      refundAmount,
    );

    // Estimate transaction fee and adjust refund amount
    const feeRates = await getCurrentFeeRates();
    const estimatedFee = estimateTransactionFee(
      selectedUTXOs.length,
      1,
      feeRates.lowFeePerByte,
    );
    const adjustedRefundAmount = adjustAmountForFee(refundAmount, estimatedFee);

    // Prepare the refund transaction data
    const refundTransactionData = {
      userRef: userId,
      walletRef: transactionToRefund.walletRef,
      transactionType: "outgoing",
      purpose: "refundUser",
      walletAddress: transactionToRefund.walletAddress,
      userAddress: transactionToRefund.userAddress,
      expectedAmount: adjustedRefundAmount,
      unconfirmedAmount: adjustedRefundAmount,
      confirmedAmount: 0,
      status: "pending",
      transactionHash: null,
    };

    const refundTransaction = await createRefundTransactionRecord(
      refundTransactionData,
    );

    // Update the event's transactions to include the refund transaction
    event.transactions.push(refundTransaction._id);
    await event.save();

    // Specify a change address - ideally, this should be a new address generated for the user or event
    const changeAddress =
      event.walletAddress || transactionToRefund.walletAddress;

    // Create the raw Bitcoin transaction
    const rawTransaction = await createRawBitcoinTransaction(
      selectedUTXOs,
      refundTransaction.userAddress,
      adjustedRefundAmount - estimatedFee,
      changeAddress,
      estimatedFee,
    );

    log.info(`Refund processed for user ${userId} in event ${eventId}`);
    return { refundTransaction, rawTransaction };
  } catch (err) {
    log.error("Error in refundUser: ${err.message}");
    throw err;
  }
};

/**
 * Settles an event based on participant votes.
 * @param {string} eventId - ID of the event to settle.
 */
const settleEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }

    if (event.status === "active" && new Date() > event.endTime) {
      event.status = "settling";
      event.settlementStatus = "voting";
      await event.save();
      log.info(`Event ${eventId} status updated to settling`);
    } else {
      throw new Error(
        "Event is not in a state to be settled or end time not reached",
      );
    }
  } catch (err) {
    log.error(`Error in settleEvent: ${err.message}`);
    throw err;
  }
};

/**
 * Casts a vote for an event participant.
 *
 * @async
 * @function castVote
 * @param {string} eventId - The event's unique identifier.
 * @param {string} userId - The user's unique identifier.
 * @param {string} vote - The vote cast by the user.
 * @return {Promise<Object>} Confirmation message.
 * @throws {NotFoundError} If the event or user is not found.
 * @throws {Error} If voting is not open or if invalid voting attempt.
 */
const castVote = async (eventId, userId, vote) => {
  try {
    const event = await Event.findOne({ eventId: eventId });
    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }

    if (event.status !== "settling" && event.settlementStatus !== "voting") {
      throw new Error("Voting is not open for this event");
    }

    const user = await getUserById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    const isParticipant = event.participants.some(
      (p) => p.userId.toString() === user._id.toString(),
    );
    const hasVoted = event.voteResults.some(
      (v) => v.userId.toString() === user._id.toString(),
    );

    if (!isParticipant || hasVoted) {
      throw new Error("Invalid voting attempt");
    }

    event.voteResults.push({ userId: user._id, vote, timestamp: new Date() });
    await event.save();

    log.info(`Vote recorded for user ${userId} in event ${eventId}`);
    return { message: "Vote cast successfully" };
  } catch (err) {
    log.error(`Error in castVote: ${err.message}`);
    throw err;
  }
};

/**
 * Determines the outcome of an event based on participant votes.
 * Retrieves the event from the database, checks the vote results against the number of participants,
 * and updates the event document accordingly.
 *
 * @async
 * @function determineOutcome
 * @param {string} eventId - The ID of the event to determine the outcome for.
 * @return {Promise<Object>} An object representing the outcome of the event.
 * @throws {Error} If the event is not found or if there's an error in processing the votes.
 */
const determineOutcome = async (eventId) => {
  try {
    // Retrieve the event from the database
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error(`Event with ID ${eventId} not found`);
    }

    // Ensure the number of votes is equal to the number of participants
    if (event.voteResults.length !== event.participants.length) {
      throw new Error("Not all participants have voted");
    }

    // Extract votes from the event document
    const { voteResults } = event;
    const voteCount = voteResults.reduce((acc, vote) => {
      acc[vote.vote] = (acc[vote.vote] || 0) + 1;
      return acc;
    }, {});

    // Determine outcome based on votes
    if (voteCount.win === 1 && voteCount.loss === 1) {
      const winnerVote = voteResults.find((v) => v.vote === "win");
      event.winners = [winnerVote.userId];
      event.isDisputed = false;
      event.settlementStatus = "processing";
      await event.save(); // Save the updated event
      return { winner: winnerVote.userId, isDisputed: false };
    } else if (voteCount.draw === event.participants.length) {
      event.isDisputed = false;
      await event.save(); // Save the updated event
      return { isDraw: true, isDisputed: false };
    } else {
      event.isDisputed = true;
      await event.save(); // Save the updated event
      // Any other combination is considered a dispute
      return { isDisputed: true };
    }
  } catch (err) {
    throw new Error(`Error in determineOutcome: ${err.message}`);
  }
};

/**
 * Awards the prize to the winner of an event. This function is called after an event
 * has been settled and a winner has been determined. It retrieves the event's UTXOs,
 * calculates the total prize amount, creates a raw Bitcoin transaction for prize distribution,
 * and updates the event status to 'completed'.
 *
 * The function fetches the winner's user address from the participants array in the event document
 * using the winner's user ID stored in the winners field. It ensures that the event is in the
 * appropriate state for awarding the prize and that a winner is present. The prize is then
 * sent to the winner's user address.
 *
 * @async
 * @function awardWinner
 * @param {string} eventId - The unique identifier of the event whose winner is to be awarded.
 * @return {Promise<Object>} An object containing details of the prize distribution transaction and the raw transaction.
 * @throws {NotFoundError} If the event or the winner is not found.
 * @throws {Error} If the event is not in the correct state to award the winner or if there are issues in creating the transaction.
 */
const awardWinner = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }

    if (
      event.status !== "settling" ||
      event.settlementStatus !== "processing"
    ) {
      throw new Error("Event is not in a state to award the winner");
    }

    if (event.winners.length === 0) {
      throw new Error("No winners to award in this event");
    }

    const winnerId = event.winners[0];
    const winnerParticipant = event.participants.find((p) =>
      p.userId.equals(winnerId),
    );
    if (!winnerParticipant) {
      throw new NotFoundError(
        `Winner with ID ${winnerId} not found in participants`,
      );
    }

    // Since the UTXOs now directly reflect the prize pool, we don't need to pass the required amount
    const selectedUTXOs = await selectUTXOsForAward(eventId);

    // Estimate transaction fee
    const testnetFeeRate = 22; // Assuming testnet usage
    const estimatedFee = estimateTransactionFee(
      selectedUTXOs.length,
      1,
      testnetFeeRate,
    );

    console.log("estimatedFee:", estimatedFee);

    // Adjust prize amount after fee
    const prizeAmountAfterFee = event.prizePool - estimatedFee;

    // Create the raw Bitcoin transaction
    const rawTransaction = await createRawBitcoinTransaction(
      selectedUTXOs,
      winnerParticipant.userAddress,
      prizeAmountAfterFee,
      winnerParticipant.userAddress, // If there's change just send to user for now
      estimatedFee,
    );

    const prizeDistributionTransaction = {
      userRef: winnerId,
      walletRef: event.walletRef,
      transactionType: "outgoing",
      purpose: "winnerPayout",
      walletAddresses: selectedUTXOs.map((utxo) => utxo.address),
      userAddress: winnerParticipant.userAddress,
      expectedAmount: prizeAmountAfterFee,
      unconfirmedAmount: prizeAmountAfterFee,
      confirmedAmount: 0,
      status: "pending",
      transactionHash: null,
    };

    await createTransactionRecord(prizeDistributionTransaction);

    // Mark the used UTXOs as spent
    // for (const utxo of selectedUTXOs) {
    //   await markUTXOAsSpent(utxo.transactionHash, utxo.outputIndex);
    // }

    // event.status = "completed";
    // event.settlementStatus = "settled";
    // await event.save();

    log.info(`Prize awarded to winner for event ${eventId}`);
    return { transaction: prizeDistributionTransaction, rawTransaction };
  } catch (err) {
    log.error(`Error in awardWinner: ${err.message}`);
    throw err;
  }
};

module.exports = {
  createEvent,
  updateEvent,
  joinEvent,
  getEvent,
  getAllEvents,
  deleteEvent,
  refundUser,
  refundEventCreator,
  settleEvent,
  castVote,
  determineOutcome,
  awardWinner,
};
