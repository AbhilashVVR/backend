const express = require('express');
const router = express.Router();

const { RegisterWebsiteGameQuestions, GetWebsiteGameQuestions, GetWebsiteGameQuestionByGameId, GetWebsiteGameQuestionByLevelAndGameId } = require('../services/websiteGameQuestion')

//Get All Previously Added Questions
router.get('/', GetWebsiteGameQuestions);

//Get All Questions by GameId
router.get('/get/:gameId', GetWebsiteGameQuestionByGameId);

//Get All Questions by GameId and level
router.get('/get/:level/:gameId', GetWebsiteGameQuestionByLevelAndGameId);

//Submit Questions
router.post('/register', RegisterWebsiteGameQuestions);
module.exports = router;