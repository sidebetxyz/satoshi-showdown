const express = require("express");
const router = express.Router();
const { createNewWallet } = require("../services/wallet");

router.post("/createWallet", async (req, res) => {
  try {
    const wallet = await createNewWallet();
    res.json({ address: wallet.address });
  } catch (error) {
    console.error("Error creating wallet:", error);
    res.status(500).send("Error creating wallet");
  }
});

module.exports = router;
