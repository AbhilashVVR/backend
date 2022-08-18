const express = require('express');
const router = express.Router();
const Answer = require('../models/answer-model');
const randomstring = require('randomstring');
const { RegisterAnswer, GetAnswersByQuestionId, GetAnswersByUserId, GetAnswersByUserIdAndQuestionId } = require('../services/answer')


// CRUD FOR ANSWER

//Registering New ANSWER

router.post('/', RegisterAnswer);

// Get Answer 
router.get('/:questionId', GetAnswersByQuestionId);

// Get Answer By userId
router.get('/byUserId/:userId', GetAnswersByUserId);

// Get Answer By userId
router.get('/byUserIdAndQuestionId/:userId/:questionId', GetAnswersByUserIdAndQuestionId);

// Get question Answered By User 
router.get('/:grade/:level/:gameId/:userId', async (req, res) => {
    try {
        const savedRequest = await Answer.find({
            userId: req.body.userId,
            grade: parseInt(req.body.grade),
            level: parseInt(req.body.level),
            gameId: req.body.gameId
        });
        res.json(savedRequest);
    } catch (ex) {
        res.json({ message: ex });
    }
});

module.exports = router;    