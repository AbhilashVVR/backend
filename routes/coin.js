const express = require("express");
const router = express.Router();
const {
  GetCoinWallets,
  CreateCoinWallet,
  GetCoinById,
  EditCoinById,
  DeleteCoin,
  GetCoinByName,
} = require("../services/coin");

//Get All Coin Wallet
router.get("/getCoinWallets", GetCoinWallets);

//Submit Coin Wallet
router.post("/createCoinWallet", CreateCoinWallet);

//Get Single Coin Data
router.get("/:id/get-coin", GetCoinById);

//Get Single Coin Data
router.get("/:name/get-coin-by-name", GetCoinByName);

//Edit Coin
router.put("/:id/edit-coin", EditCoinById);

//Delete Coin Wallet
router.delete("/:id/delete-coin", DeleteCoin);

module.exports = router;
