const express = require("express");
const router = express.Router();
const { GetOrder, RegisterOrder } = require("../services/order");

//Get All Games
router.get("/getOrder/:orderId", GetOrder);

//Submit Game
router.post("/addOrder", RegisterOrder);

module.exports = router;
