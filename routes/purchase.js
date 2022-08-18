const express = require("express");
const router = express.Router();
const {
  GetPurchases,
  AddNewPurchase,
  GetPurchaseWithId,
  GetPurchaseWithTransactionId,
  GetPurchaseWithUserId,
  UpdatePurchaseStatus,
} = require("../services/purchase");
//Get All Wallet
router.get("/getPurchase", GetPurchases);
//Submit Purchase
router.post("/createPurchase", AddNewPurchase);
//Get Purchase By Id
router.get("/getPurchaseById/:id", GetPurchaseWithId);
//Get Purchase By TransactionId
router.get("/getPurchaseByTransactionId/:transactionId", GetPurchaseWithTransactionId);

//Get Purchase By UserId
router.get("/getPurchaseByUserId/:userId", GetPurchaseWithUserId);

//Get Purchase By UserId
router.put(
  "/updatePurchaseStatus/:transactionId/:status",
  UpdatePurchaseStatus
);
module.exports = router;