const express = require('express');
const router = express.Router();
const { GetAllExcercise, GetExcerciseById, GetAllExcerciseByGameId, GetAllExcerciseByGameCategoryId, GetAllExcerciseByGameCategoryAndLevel, GetAllExcerciseByGameCategoryAndGrade, GetAllExcerciseByGameCategoryAndLevelAndGrade, UpdateExcercise, DeleteExcerciseQuestion } = require('../services/excercise')
// CRUD FOR EXCERCISE

//Get All EXCERCISE Questions
router.get('/', GetAllExcercise);

//Get Single Exercise Based On id
router.get('/getexcercise/:id', GetExcerciseById);

//Get All EXCERCISE Questions of one Category
router.get('/getAllExcerciseByGameId/:gameId', GetAllExcerciseByGameId);

//Get All EXCERCISE Questions of one SubCategory
router.get('/getAllExcerciseByGameCategory/:gameCategoryId', GetAllExcerciseByGameCategoryId);

//Get All EXCERCISE Questions of one SubCategory with level
router.get('/getAllExcerciseByGameCategoryAndLevel/:gameCategoryId/:level', GetAllExcerciseByGameCategoryAndLevel);

//Get All EXCERCISE Questions of one SubCategory with grade
router.get('/getAllExcerciseByGameCategoryAndGrade/:gameCategoryId/:grade', GetAllExcerciseByGameCategoryAndGrade);

//Get All EXCERCISE Questions of one SubCategory with level and Grade
router.get('/getAllExcerciseByGameCategoryAndLevelAndGrade/:gameCategoryId/:level/:grade', GetAllExcerciseByGameCategoryAndLevelAndGrade);

//Edit Excercise
router.put('/editExcerciseQuestion/:id', UpdateExcercise);

//Delete Specific Excercise Question
router.delete("/deleteExcerciseQuestion/:id", DeleteExcerciseQuestion);

module.exports = router;
