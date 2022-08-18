const express = require('express');
const router = express.Router();
const Wallet = require('../models/wallet-model');
const User = require('../models/user-model');

//Get All Wallet
router.get('/getWallets', async (req,res)=>{
   try{
       const wallet = await Wallet.find();
       if(wallet === null){
           res.json({
               message: "wallet is empty"
           })
       }else {
       res.json(wallet);
       }
    } catch (err){
        res.json({message: err });
    }
}); 


//Get All Wallet By User
router.get('/getWalletByUser/:userId', async (req,res)=>{
   try{
       const wallet = await Wallet.find({userId:req.params.userId});
       if(wallet == null){
        res.json({
            message: "wallet is empty"
        })
        }else {
       res.json(wallet);
        }
    } catch (err){
        res.json({message: err });
    }
});


//Get Wallet Balence
router.get('/getBalance/:userId', async (req,res)=>{
    try {

        const wallet = await Wallet.findOne().where({userId: req.params.userId});
        if(wallet == null){
            res.json({
                message: "wallet is empty"
            })
        }else {
        let balance = wallet.totalCredit - wallet.totalDebit;
        res.json({
            balance: balance
        });
    }
    } catch (err) {
        res.json({
            error: err.message
        })
    }
   // console.log('req.params.id',req.params.id);
    // try{
    //     const walletBalence = await Wallet.aggregate([
    //           {$match:{ userId:req.body.id}},
    //           { $group: {
    //                 _id: "$userId",
    //                 balence: { $sum: { $subtract: ['$credit', '$debit']}}
    //             }
    //          }
    //         ]);
    //     res.json(walletBalence);
    // } catch (err){
    //     res.json({message: err});
    // }
});

//Create Wallet with 0 credit
router.post('/wallet/:userId', async (req,res)=>{
    const getUser = await Wallet.findOne({userId: req.params.userId});
    console.log(getUser);
    if(!getUser){
    const wallet = new Wallet({
        userId:  req.params.userId,
        credit: 0,
        debit: 0,
        // deviceId: req.body.deviceId
    });
    try{
        const savedWallet = await wallet.save();
        const user = await User.findOne({_id: req.body.userId});
        user.walletId = savedWallet._id;
        await user.save();
        res.json(savedWallet);
    } catch (err){
        res.json({message: err});
    }
}
res.json({message: "Wallet Already Present"});
});

router.post('/creditWallet', async (req,res)=>{
    const wallet = new Wallet({
                userId:  req.body.userId,
                credit: req.body.credit,
                entrytype: req.body.entrytype,
                reason: req.body.reason,
                // deviceId: req.body.deviceId
            });
    try{
        const savedWallet = await wallet.save();
        const user = await User.findOne({_id: req.body.userId});
        user.walletId = savedWallet._id;
        await user.save();
        res.json(savedWallet);
    } catch (err){
        res.json({message: err});
    }
});

//Submit Debit Wallet
router.post('/debitWallet', async (req,res)=>{
    const wallet = new Wallet({
                userId:  req.body.userId,
                debit: req.body.debit,
                entrytype: req.body.entrytype,
                reason: req.body.reason,
                // deviceId: req.body.deviceId
            });
    try{
        const savedWallet = await wallet.save();
        res.json(savedWallet);
    } catch (err){
        res.json({message: err});
    }
});

//update credit wallet

router.put('/update-credit-wallet/:id', async (req, res) => {

    try {
        let wallet = await Wallet.findOne({_id: req.params.id});
        if(wallet == null){
            res.json({
                message: "wallet is empty"
            })
        } else {
            wallet.totalCredit = wallet.credit + req.body.credit;
            wallet.userId = req.body.userId;
            wallet.credit = req.body.credit;
            wallet.entrytype = req.body.entrytype;
            wallet.reason = req.body.reason;
            // wallet.deviceId = req.body.deviceId;

        await wallet.save();
        res.json({
            data: wallet
        });
    }
    } catch (err) {
        res.json({
            error: err.message
        })
    }
    
    // const walletId = req.params.id;
    // let credit = req.body.coin;
    // const entryType = req.body.entry_type;
    // const reason = req.body.reason;
    // const deviceId = req.body.device_id;

    // Wallet.findById(walletId)
    //     .then((wallet)=>{
    //         if (!wallet){
    //             let error = new Error("Wallet not found.");
    //             error.statusCode = 404;
    //             throw error;
    //         }

    //         Wallet.credit = wallet.credit + req.body.coin || credit;
    //         Wallet.entryType = wallet.entryType || entryType;
    //         wallet.reason = wallet.reason || reason;
    //         wallet.deviceId = wallet.deviceId || deviceId;

    //         return wallet.save();
    //     })
    //     .then((result) => {
    //         res
    //             .status(200)
    //             .json({ message: "Credit wallet updated!", wallet: result });
    //     })
    //     .catch((err) => {
    //         if (!err.statusCode) {
    //             err.statusCode = 500;
    //         }
    //         next(err);
    //     });

});

//update debit wallet

router.put('/update-debit-Wallet/:id', async (req, res) => {

    try {
        let wallet = await Wallet.findOne({_id: req.params.id});
        if(wallet == null){
            res.json({
                message: "wallet is empty"
            })
        } else {
            wallet.totalDebit = wallet.credit + req.body.debit;
            wallet.userId = req.body.userId;
            wallet.debit = req.body.debit;
            wallet.entrytype = req.body.entrytype;
            wallet.reason = req.body.reason;
            // wallet.deviceId = req.body.deviceId;

        await wallet.save();
        res.json({
            data: wallet
        });
    }
    } catch (err) {
        res.json({
            error: err.message
        })
    }
    // try{
    //     const updateWallet = await Wallet.findById({_id : req.params._id});
    //     wallet.credit = wallet.credit + req.body.coin
    // }
    // const walletId = req.params._id;
    // const debit = req.body.coin;
    // const entryType = req.body.entry_type;
    // const reason = req.body.reason;
    // const deviceId = req.body.device_id;

    // Wallet.findById(walletId)
    //     .then((wallet)=>{
    //         if (!wallet){
    //             const error = new Error("Wallet not found.");
    //             error.statusCode = 404;
    //             throw error;
    //         }

    //         Wallet.debit = wallet.debit + req.body.coin || debit;
    //         Wallet.entryType = wallet.entryType || entryType;
    //         wallet.reason = wallet.reason || reason;
    //         wallet.deviceId = wallet.deviceId || deviceId;

    //         return wallet.save();
    //     })
    //     .then((result) => {
    //         res
    //             .status(200)
    //             .json({ message: "debit wallet updated!", wallet: result });
    //     })
    //     .catch((err) => {
    //         if (!err.statusCode) {
    //             err.statusCode = 500;
    //         }
    //         next(err);
    //     });

})



//Delete Wallet
router.delete('/deleteWallet/:id', async (req,res)=>{
    try{
        const wallet = await Wallet.deleteOne({ _id: req.params.id}).exec();
        res.json(wallet);
    } catch (err){
        res.json({message: err});
    }
});

module.exports = router;    