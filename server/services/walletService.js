import bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";
import ecc from "tiny-secp256k1";
import { storePrivateKey } from "../utils/storage.js";

/**
 * WalletService for managing cryptocurrency wallets.
 * This service handles operations such as creating new wallets, especially SegWit wallets for Bitcoin.
 */
export class WalletService {
  constructor() {
    this.network = bitcoin.networks.testnet; // Set network to Bitcoin's testnet for wallet operations
  }

  /**
   * Creates a new SegWit wallet using Bitcoin's testnet.
   * SegWit (Segregated Witness) wallets offer benefits like reduced transaction fees.
   * @returns {Object} Object containing the wallet's address and ID.
   */
  async createSegwitWallet() {
    const keyPair = ECPair.makeRandom({ network: this.network }); // Generate random key pair
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: this.network,
    }); // Derive address
    const privateKey = keyPair.toWIF(); // Convert private key to Wallet Import Format
    const walletId = await storePrivateKey(address, privateKey); // Store private key securely
    return { address, _id: walletId }; // Return wallet details
  }

  // Additional wallet management methods can be implemented as needed
}

export default WalletService;
