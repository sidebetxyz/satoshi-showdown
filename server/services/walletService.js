const bitcoin = require("bitcoinjs-lib");
const ECPairFactory = require("ecpair").default;
const ecc = require("tiny-secp256k1");
const { storePrivateKey } = require("../utils/storage");

const ECPair = ECPairFactory(ecc);
const network = bitcoin.networks.testnet;

async function createSegwitWallet() {
  const keyPair = ECPair.makeRandom({ network });
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: keyPair.publicKey,
    network,
  });

  const privateKey = keyPair.toWIF();
  const walletId = await storePrivateKey(address, privateKey);

  // Log the wallet details to the console
  console.log("Wallet created: Address -", address);
  console.log("Wallet ID -", walletId);

  // Return both the address and the _id of the saved wallet
  return { address, _id: walletId };
}

module.exports = { createSegwitWallet };
