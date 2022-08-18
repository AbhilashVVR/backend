const express = require('express');
const router = express.Router();
const User = require('../models/user-model');
const Wallet = require('../models/wallet-model');
const Rewards = require('../models/rewards-model');

const {GetAllRewards, CreateReward, GetSingleReward, GetRewardWithName, UpdateReward, DeleteReward} = require("../services/rewards")
//Get All Rewards
router.post('/getRewards', async (req,res)=>{
   try{
       const totalRewards = await Wallet.find({ userId: req.body.user_id, entryType: 1}).count();
       let amount = 0;
       if(totalRewards == 1)
       {
         let data = await Rewards.findOne({ name: "Day"+totalRewards }).lean().exec();
         amount = data.amount;
       }else if(totalRewards == 2)
       {
            let data = await Rewards.findOne({ name: "Day"+totalRewards }).lean().exec();
            amount = data.amount;
       }else if(totalRewards == 3)
       {
            let data = await Rewards.findOne({ name: "Day"+totalRewards }).lean().exec();
            amount = data.amount;
       }else if(totalRewards == 4)
       {
            let data = await Rewards.findOne({ name: "Day"+totalRewards }).lean().exec();
            amount = data.amount;
       }else if(totalRewards == 5)
       {
            let data = await Rewards.findOne({ name: "Day"+totalRewards }).lean().exec();
            amount = data.amount;
       }else if(totalRewards == 6)
       {
            let data = await Rewards.findOne({ name: "Day"+totalRewards }).lean().exec();
            amount = data.amount;
       }else if(totalRewards == 7)
       {
            let data = await Rewards.findOne({ name: "Day"+totalRewards }).lean().exec();
            amount = data.amount;
       }else
       {
            var rewardModule = totalRewards % 7;
            if(rewardModule == 1)
           {
                let data = await Rewards.findOne({ name: "Day"+rewardModule }).lean().exec();
                amount = data.amount;
           }else if(rewardModule == 2)
           {
                let data = await Rewards.findOne({ name: "Day"+rewardModule }).lean().exec();
                amount = data.amount;
           }else if(rewardModule == 3)
           {
               let data = await Rewards.findOne({ name: "Day"+rewardModule }).lean().exec();
               amount = data.amount;
           }else if(rewardModule == 4)
           {
                let data = await Rewards.findOne({ name: "Day"+rewardModule }).lean().exec();
                amount = data.amount;
           }else if(rewardModule == 5)
           {
                let data = await Rewards.findOne({ name: "Day"+rewardModule }).lean().exec();
                amount = data.amount;
           }else if(rewardModule == 6)
           {
                let data = await Rewards.findOne({ name: "Day"+rewardModule }).lean().exec();
                amount = data.amount;
           }else if(rewardModule == 7)
           {
                let data = await Rewards.findOne({ name: "Day"+rewardModule }).lean().exec();
                amount = data.amount;
           }
       }
       const wallet = new Wallet({
                userId:  req.body.user_id,
                credit:  amount,
                entryType: 1,
                reson: "Rewards",
                // deviceId: req.body.device_id?req.body.device_id:''
        });
       const savedWallet = await wallet.save();
       res.json(savedWallet);
    } catch (err){
        res.json({message: err });
    }
}); 

//Get All Rewards
router.get('/getAllRewards', GetAllRewards); 

router.get("/:name/get-reward-by-name", GetRewardWithName); 

//Submit Rewards
router.post('/createReward', CreateReward);

//Get Single Reward Data
router.post('/getSingleReward', GetSingleReward);

//Edit Coin
 router.post('/updateReward',UpdateReward);

//Delete Rewards
router.post('/deleteRewards', DeleteReward);

module.exports = router;    