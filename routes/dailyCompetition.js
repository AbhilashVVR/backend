const express = require('express');
const router = express.Router();

const {
    RegisterDailyCompetitionQuestions,
    GetDailyCompetitionQuestions,
    GetDailyCompetitionQuestionByGameId,
    GetDailyCompetitionQuestionByGradelAndGameId } = require('../services/dailyCompetition')

//Get All Previously Added Questions
router.get('/', GetDailyCompetitionQuestions);

//Get All Questions by GameId
router.get('/get/:gameId', GetDailyCompetitionQuestionByGameId);

//Get All Questions by GameId and level
router.get('/get/:level/:gameId', GetDailyCompetitionQuestionByGradelAndGameId);

//Submit Questions
router.post('/register', RegisterDailyCompetitionQuestions);
module.exports = router;