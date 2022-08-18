const Rewards = require("../models/rewards-model");

const getAllRewards = async () => {
  const rewards = await Rewards.find({});
  return Promise.resolve(rewards);
};

module.exports = {
  getAllRewards,
};
