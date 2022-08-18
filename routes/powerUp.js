const express = require("express");
const router = express.Router();
const Power = require("../models/powerUp-model");

const {
  PurchasePowerupByUserId,
  UsePowerupByUserId,
  DeletePowerup,
  EnableDisablePowerupStatus,
  GetPowerupById,
  RegisterPowerUp,
  GetPowerups,
  GetPowerupsByGameId,
  EditPowerUpById
} = require("../services/powerup")

// Add PowerUp
router.post("/register", RegisterPowerUp);

//Get All PowerUp
router.get("/get-powerup", GetPowerups);

//Get PowerUp by GameId
router.get("/get-powerup/:gameId", GetPowerupsByGameId);

//Get PowerUp by id
router.get("/getPowerupById/:id", GetPowerupById);

//Purchase PowerUp by userId and PowerUpId
router.post(
  "/purchase-powerup/:userId/:powerupId/:number",
  PurchasePowerupByUserId
);

//Purchase PowerUp by userId and PowerUpId
router.get("/use-powerup/:userId/:powerupId", UsePowerupByUserId);

// delete powerup with id
router.delete("/delete-powerup/:id", DeletePowerup);

// enable disable
router.put("/enable-disable-powerup/:id", EnableDisablePowerupStatus);

// update powerups with id
router.put("/:id/update-power-up", EditPowerUpById);

module.exports = router;
