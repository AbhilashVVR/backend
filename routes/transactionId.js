const express = require("express");
const router = express.Router();
const {
    AddNewTransactionId,
    GetTransactionByUserIdandGameId
} = require("../services/transactionId");

// CRUD FOR Transaction

//Registering New Transaction
router.post("/", AddNewTransactionId);

//Get All TransactionIds by UserId and GameId
router.get("/:userId/:gameId", GetTransactionByUserIdandGameId);

module.exports = router;
