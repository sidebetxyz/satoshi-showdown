const walletService = require("./walletService");

const eventService = {
  async createEvent(eventData) {
    try {
      // Step 1: Create Wallet
      const wallet = await walletService.createSegwitWallet();

      // Print the wallet address and ID on separate lines to the console
      console.log("Wallet created: Address -", wallet.address);
      console.log("Wallet ID -", wallet._id);

      // You can return the wallet or handle it as needed
      return wallet;
    } catch (error) {
      console.error("Error creating wallet:", error);
      throw error;
    }
  },
  // Additional methods can be added here...
};

module.exports = eventService;
