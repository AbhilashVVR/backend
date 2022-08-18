const express = require("express");
const router = express.Router();
const {
  RegisterNewGame,
  GetGames,
  GetGameWithId,
  GetGameByGameName,
  EnableDisableGame,
  EditGameById,
} = require("../services/game");

//Get All Games
router.get("/get-games", GetGames);

//Submit Game
router.post("/register", RegisterNewGame);

//Get Game by Id
router.get("/:id/get-game", GetGameWithId);

//Get Game by Game Name
router.get("/:name/get-game-by-name", GetGameByGameName);

//Edit Game
router.put("/:id/edit-game", EditGameById);

//Enable and Disable Game
router.put("/:id/enable-disable-game", EnableDisableGame);

module.exports = router;
