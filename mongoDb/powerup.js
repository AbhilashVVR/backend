const Power = require("../models/powerUp-model");

const getPowerupById = async (req, res, next) => {
  const powerupDetail = await Power.findById(req);
  return Promise.resolve(powerupDetail);
};

// update powerUp by ID,
const updatePowerup = async (id, status) => {
  var key = {
    isEnable: status,
  };

  const updatedPowerup = await Power.updateOne(
    { _id: id },
    {
      $set: key,
    }
  );
  return Promise.resolve(updatedPowerup);
};

// delete powerup by ID
const deletePowerup = async (id) => {
  Power.remove({
    _id: id,
  });
};

module.exports = { getPowerupById, updatePowerup, deletePowerup };
