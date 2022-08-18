const express = require("express");
const router = express.Router();
const {
  AddNewTransaction,
  AddRewardTransaction,
  GetTransactionByUserId,
  GetTransactionByType,
  GetTransactionByUserIdAndType
} = require("../services/transactions");

// CRUD FOR Transaction

//Registering New Transaction
router.post("/", AddNewTransaction);

//Adding Transaction For Reward
router.post("/Reward", AddRewardTransaction);

//Get All Transaction by UserId
router.get("/user/:userId", GetTransactionByUserId);

//Get All Transaction by Type
router.get("/type/:type", GetTransactionByType);

//Get All Transaction by Type
router.get("/userIdAndType/:userId/:type", GetTransactionByUserIdAndType);

module.exports = router;
