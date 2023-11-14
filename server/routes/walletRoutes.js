const express = require("express");
const router = express.Router();
const { createSegwitWallet } = require("../services/walletService");

router.post("/create", async (req, res) => {
  try {
    const wallet = await createSegwitWallet();
    res.json({ address: wallet.address });
  } catch (error) {
    console.error("Error creating wallet:", error);
    res.status(500).send("Error creating wallet");
  }
});

module.exports = router;
