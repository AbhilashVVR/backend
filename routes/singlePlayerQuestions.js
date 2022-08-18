const express = require('express');
const router = express.Router();

const { RegisterSinglePlayerQuestions, GetSinglePlayerQuestions, GetSinglePlayerQuestionByGameId, GetSinglePlayerQuestionByGradeAndLevelAndGameId, GetSinglePlayerQuestionByGradelAndGameId,  GetSinglePlayerQuestionById, UpdateSinglePlayer, DeleteSinglePlayerQuestion } = require('../services/singlePlayerQuestion')

//Get All Previously Added Questions
router.get('/', GetSinglePlayerQuestions);

//Get All Questions by GameId
router.get('/get/:gameId', GetSinglePlayerQuestionByGameId);

//Get All Questions by GameId
router.get('/get/:grade/:level/:gameId', GetSinglePlayerQuestionByGradeAndLevelAndGameId);

//Get All Questions by GameId and level
router.get('/get/:level/:gameId', GetSinglePlayerQuestionByGradelAndGameId);

//Get Single Exercise Based On id
router.get('/getSinglePlayerQuestion/:id', GetSinglePlayerQuestionById);

//Edit Excercise
router.put('/editSinglePlayerQuestion/:id', UpdateSinglePlayer);

//Delete Specific Excercise Question
router.delete("/deleteSinglePlayerQuestion/:id", DeleteSinglePlayerQuestion);

//Submit Questions
router.post('/register', RegisterSinglePlayerQuestions);
module.exports = router;