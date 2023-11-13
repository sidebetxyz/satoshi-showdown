const express = require("express");
const router = express.Router();
const { createSegwitWallet } = require("../services/wallet");

router.get("/createWallet", async (req, res) => {
  try {
    const address = await createSegwitWallet();
    res.json({ address });
  } catch (error) {
    console.error("Error creating wallet:", error);
    res.status(500).send("Error creating wallet");
  }
});

module.exports = router;
