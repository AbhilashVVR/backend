const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const router = express.Router();
const Game = require('./models/game-model');

//Get All Games
router.get('/get-games', async (req,res)=>{
    try{
        const game = await Game.find();
        res.json(game);
     } catch (err){
         res.json({message: err });
     }
 });

 //Submit Game
 router.post('/register',async (req,res)=>{
        var form = await new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
              var data = fields.data;
              var oldpath = files.file_path.path;
              var file_name = new Date().getTime();
              var ext = files.file_path.name.split('.').pop();
              var icon_path = file_name+'.'+ext;
              var newpath = './uploads/' + icon_path;
               fs.rename(oldpath, newpath, function (err) {
                    if(err){ res.json(err); }
               });
              var obj = JSON.parse(data);
            const game = new Game({
                gameName: obj.gameName,
                gameDescription: obj.gameDescription,
                gameIcon: icon_path,        
                gameBanner: obj.gameBanner,
                bundleIdentifier: obj.bundleIdentifier,
                createdOn: obj.createdOn,
                gameType: obj.gameType,
                singlePlayer : obj.singlePlayer,
                multiPlayer : obj.multiPlayer,
                dailyCompetition : obj.dailyCompetition
            });
            try{
                  const savedGame = game.save();
                  res.json(savedGame);
            } catch (err){
                res.json({message: err});
            }
    });
    
 });

//Get Game by Id
router.get('/:id/get-game', async (req,res)=> {
    try {
        let data = await Game.findOne({ _id: req.params.id }).lean().exec();
        res.json(data)
    } catch (err) {
       res.json({message: err});
    }
});

 //Edit Game
 router.put('/:id/edit-game',async (req,res)=>{
        var form = await new formidable.IncomingForm();
            form.parse(req, function (err, fields, files) {
            try {
                    var getdata = fields.data;
                    var gameIcon = '';
                    if(files.file_path)
                    {
                        var oldpath = files.file_path.path;
                        var file_name = new Date().getTime();
                        var ext = files.file_path.name.split('.').pop();
                        var icon_path = file_name+'.'+ext;
                        var newpath = './uploads/' + icon_path;
                        gameIcon = icon_path;
                        fs.rename(oldpath, newpath, function (err) {
                            if(err){ res.json(err); }
                        });
                    }
                    
                    var obj = JSON.parse(getdata);
                    let gameData = {};
                    gameData.gameDescription = obj.gameDescription;
                    gameData.bundleIdentifier = obj.bundleIdentifier;
                    gameData.createdOn = obj.createdOn;
                  //  gameData.gameType = obj.gameType;
                    if(gameIcon){
                        gameData.gameIcon = gameIcon;
                    }
                    if(obj.gameBanner){
                        gameData.gameBanner=obj.gameBanner;
                    }
                    let data =  gameData.update({ _id: req.params.id },{ $set:{gameData}});
                   res.json(data)
            } catch (err) {
                    res.json({message: err});
             }
     });
 });

 //Enable and Disable Game

 router.put('/:id/enable-disable-game',async (req,res)=>{
    try {
        if (!req.params.id) {
            throw new validationError("enter valid id");
        }
        let gameData = await Game.findOne({ _id: req.params.id }).exec();
        gameData.status = req.body.enable ? "Active" : "Inactive";
        gameData.enable = req.body.enable;
        let data = await gameData.save();
        res.json(data)
    } catch (err) {
        res.json({message: err});
     }
 });
 module.exports = router;