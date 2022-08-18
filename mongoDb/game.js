const gameModel = require("../models/game-model");

const registerNewGame = async (registerGameDetails) => {
  const newGame = new gameModel(registerGameDetails);
  return Promise.resolve(await newGame.save());
};

const getGameByGameId = async (req, res, next) => {
  const gameDetails = await gameModel.findById(req);
  return Promise.resolve(gameDetails);
};

const getGameByGameName = async (gameName) => {
  const query = {
    gameName: gameName,
  };
  const gameDetails = await gameModel.find(query);
  return Promise.resolve(gameDetails);
};

const enableDisableGame = async (id, details) => {
  var key = {};
  if (details.status) {
    key.status = details.status;
  }
    key.enable = details.enable;

  await gameModel.updateOne(
    { _id: id },
    {
      $set: key,
    }
  );
};
module.exports = {
  registerNewGame,
  getGameByGameId,
  getGameByGameName,
  enableDisableGame
};
