const {
  addNewPowerup,
  getPowerups,
  getPowerupWithId,
  getPowerupsByGameId,
  editPowerupById,
  deletePowerup,
} = require("../dynamodb/database/powerups")
const {
  getUserById,
  updateUserById,
} = require("../dynamodb/database/user")

const { getDate } = require("./dateFunction");
const { addNewTransaction } = require("../dynamodb/database/transactions");

const randomstring = require("randomstring");

const RegisterPowerUp = async (req, res) => {
  const power = {
    powerName: req.body.powerName,
    coins: req.body.coins,
    limitCount: req.body.limitCount,
    gameName: req.body.gameName,
    isEnable: req.body.isEnable,
    isIAP: req.body.isIAP,
    isBuyingLimit: req.body.isBuyingLimit,
    gameId: req.body.gameId,
  };
  try {
    const savedpower = await addNewPowerup(power);
    res.json(savedpower);
  } catch (err) {
    res.json({ message: err });
  }
}

const GetPowerups = async (req, res) => {
  try {
    const powerUps = await getPowerups();
    res.json(powerUps.Items);
  } catch (err) {
    res.json({ message: err });
  }
};

const GetPowerupsByGameId = async (req, res) => {
  try {
    const powerupsByGameId = await getPowerupsByGameId(req.params.gameId);
    res.json(powerupsByGameId);
  } catch (err) {
    res.json({ message: err });
  }
};

const GetPowerupById = async (req, res) => {
  try {
    console.log(req.params);
    const powerUp = await getPowerupWithId(req.params.id);
    console.log(powerUp);
    res.json(powerUp);
  } catch (err) {
    res.json({ message: err });
  }
};


const PurchasePowerupByUserId = async (req, res) => {
  let gameAndPowerupDetails;
  const userId = req.params.userId;
  const number = req.params.number;

  const getUser = await getUserById(userId);
  if (!getUser) {
    return res.json({ message: "User Not Found" });
  }
  const powerupId = req.params.powerupId;

  const powerup = await getPowerupWithId(powerupId);
  if (!powerup) {
    return res.json({ message: "PowerUp Not Found" });
  }

  if (!powerup.isEnable) {
    return res.json({ message: "PowerUp is Not Enabled" });
  }

  if (!powerup.isIAP) {
    return res.json({ message: "Power can only be earned in the game" });
  }

  if (powerup.isBuyingLimit && powerup.limitCount < parseInt(number)) {
    return res.json({
      message: "Power cannot be earned More than Buying Limit",
    });
  }

  const gameDetails = getUser.gameDetails;

  let gameDetailIndex = gameDetails.findIndex(
    (detail) =>
      detail.gameId === powerup.gameId);
  if (gameDetailIndex >= 0) {
    let powerUpIndex = gameDetails[gameDetailIndex].powerUps.findIndex(
      (detail) => detail.id === powerupId);

    if (powerUpIndex >= 0) {
      const newCoin =
        gameDetails[gameDetailIndex].powerUps[powerUpIndex].count +
        parseInt(number);

      if (powerup.isBuyingLimit && powerup.limitCount < parseInt(newCoin)) {
        return res.json({
          message: "Power cannot be earned More than Buying Limit",
        });
      }

      gameDetails[gameDetailIndex].powerUps[powerUpIndex] = {
        id: gameDetails[gameDetailIndex].powerUps[powerUpIndex].id,
        count: newCoin,
      };
    } else {
      gameDetails[gameDetailIndex].powerUps.push({
        id: powerupId,
        count: parseInt(number),
      });
    }
  } else {
    gameAndPowerupDetails = {
      gameId: powerup.gameId,
      level: 1,
      powerUps: [
        {
          id: powerupId,
          count: parseInt(number),
        },
      ],
    };

    gameDetails.push(gameAndPowerupDetails);
  }

  const walletCoins = getUser.walletCoin - powerup.coins * parseInt(number);

  if (walletCoins < 0) {
    return res.json({ message: "Sorry You Dont have enough Coins" });
  }
  const transaction = await addNewTransaction({
    transactionId: randomstring.generate(15),
    type: "Spend",
    coins: powerup.coins * parseInt(number),
    userId: userId,
    reason: req.body.reason,
    rewardId: "no-reward",
    date: getDate(),
  });

  if (transaction) {
    await updateUserById(getUser, {
      walletCoin: walletCoins,
      gameDetails: gameDetails,
      userName: getUser.userName || null,
    });
  }
  res.json(gameDetails);
};

const UsePowerupByUserId = async (req, res) => {
  const userId = req.params.userId;

  const getUser = await getUserById(userId);
  if (!getUser) {
    return res.json({ message: "User Not Found" });
  }
  const powerupId = req.params.powerupId;

  const powerup = await getPowerupWithId(powerupId);
  if (!powerup) {
    return res.json({ message: "PowerUp Not Found" });
  }
  const gameDetails = getUser.gameDetails;

  let gameDetailIndex = gameDetails.findIndex(
    (detail) => detail.gameId === powerup.gameId);
  if (gameDetailIndex >= 0) {
    let powerUpIndex = gameDetails[gameDetailIndex].powerUps.findIndex(
      (detail) => detail.id === powerupId);

    if (powerUpIndex >= 0) {
      if (gameDetails[gameDetailIndex].powerUps[powerUpIndex].count === 0) {
        return res.json({ message: "Sorry this PowerUp Cannot be used" });
      }

      if (gameDetails[gameDetailIndex].powerUps[powerUpIndex].count === 0) {
        return res.json({
          message: "Sorry, you don't have this Power to use",
        });
      }
      gameDetails[gameDetailIndex].powerUps[powerUpIndex] = {
        id: gameDetails[gameDetailIndex].powerUps[powerUpIndex].id,
        count: gameDetails[gameDetailIndex].powerUps[powerUpIndex].count - 1,
      };
    } else {
      return res.json({ message: "Sorry this PowerUp Cannot be used" });
    }
  } else {
    return res.json({ message: "Sorry this PowerUp Cannot be used" });
  }

  await updateUserById(getUser, {
    gameDetails: gameDetails,
    walletCoin: getUser.walletCoin,
    userName: getUser.userName || null,
  });

  res.json(gameDetails);
};

// add function for deleting powerup by ID
const DeletePowerup = async (req, res) => {
  //Delete Specific powerup
  try {
    const power = await deletePowerup(req.params.id);
    res.json(power);
  } catch (err) {
    res.json({
      message: err,
    });
  }
};

//  add function to enable and disable powerup by ID
const EnableDisablePowerupStatus = async (req, res) => {
  const previousPowerup = await getPowerupWithId(req.params.id);

  if (previousPowerup) {
    await editPowerupById(previousPowerup, {
      isEnable: !previousPowerup.isEnable,
      isIAP: previousPowerup.isIAP,
      isBuyingLimit: previousPowerup.isBuyingLimit,
    });
  }

  res.json(previousPowerup);
};

//  add function to updating powerup by ID
const EditPowerUpById = async (req, res) => {
  const previousPowerup = await getPowerupWithId(req.params.id);
  console.log(previousPowerup);
  var isIAP = previousPowerup.isIAP;
  var isBuyingLimit = previousPowerup.isBuyingLimit;

  if (req.body.isIAP) {
    isIAP = req.body.isIAP
  }

  if (req.body.isBuyingLimit) {
    isBuyingLimit = req.body.isBuyingLimit
  }
  if (previousPowerup) {
    await editPowerupById(previousPowerup, {
      powerName: req.body.powerName,
      coins: req.body.coins,
      limitCount: req.body.limitCount,
      isEnable: true,
      isIAP: isIAP,
      isBuyingLimit: isBuyingLimit,
    });
  }
  const updatedPowerup = await getPowerupWithId(req.params.id);
  res.json(updatedPowerup);
};

module.exports = {
  RegisterPowerUp,
  GetPowerups,
  GetPowerupsByGameId,
  GetPowerupById,
  PurchasePowerupByUserId,
  UsePowerupByUserId,
  DeletePowerup,
  EnableDisablePowerupStatus,
  EditPowerUpById
};
