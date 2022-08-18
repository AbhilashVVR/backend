const {
    addNewReward,
    getRewards,
    getRewardsByName,
    getRewardWithId,
    editRewardById,
    deleteRewards, } = require("../dynamodb/database/rewards");

const CreateReward = async (req, res) => {
    const reward = {
        rewardName: req.body.name,
        amount: req.body.coin,
        isEnabled: true
    };
    try {
        const savedReward = await addNewReward(reward);
        res.json(savedReward);
    } catch (err) {
        res.json({ message: err });
    }
}

const GetAllRewards = async (req, res) => {
    try {
        const rewards = await getRewards();
        res.json(rewards.Items);
    } catch (err) {
        res.json({ message: err });
    }
}

const GetSingleReward = async (req, res) => {
    try {
        const singleReward = await getRewardWithId(req.body.id);
        res.json(singleReward)
    } catch (err) {
        res.json({ message: err });
    }
}

const GetRewardWithName = async (req, res) => {
    try {
      const rewardByName = await getRewardsByName(req.params.name);
      res.json(rewardByName.Items);
    } catch (err) {
      res.json({ message: err });
    }
  }
  

const UpdateReward = async (req, res) => {
    try {
        const singleReward = await getRewardWithId(req.body.id);

        const data = await editRewardById(singleReward, {
            rewardName: req.body.name,
            amount: req.body.coin,
            isEnabled: true
        });
        res.json(data)
    } catch (ex) {
        res.json({ message: ex });
    }
}

const DeleteReward = async (req, res) => {
    try {
        await deleteRewards(req.body.id);
        res.json({ message: 'Reward deleted' });
    } catch (err) {
        res.json({ message: err });
    }
}
module.exports = {
    GetAllRewards, CreateReward, GetSingleReward, GetRewardWithName, UpdateReward, DeleteReward
}