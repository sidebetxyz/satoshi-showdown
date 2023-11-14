const bitcoin = require("bitcoinjs-lib");
const ECPairFactory = require("ecpair").default;
const ecc = require("tiny-secp256k1");

const { storePrivateKey } = require("./storageService");

const ECPair = ECPairFactory(ecc);
const network = bitcoin.networks.testnet;

async function createSegwitWallet() {
  const keyPair = ECPair.makeRandom({ network });
  const { address } = bitcoin.payments.p2wpkh({
    pubkey: keyPair.publicKey,
    network,
  });

  const privateKey = keyPair.toWIF();
  await storePrivateKey(address, privateKey);

  return { address }; // Return an object with the address property
}

module.exports = { createSegwitWallet };
