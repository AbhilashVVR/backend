const url = require('url');
const exceljs = require('exceljs');
const formidable = require('formidable');
const {
    encodePaginationCursor,
    decodePaginationCursor
} = require('./encodingDecoding')

const {
    registerSinglePlayerQuestions,
    getSinglePlayerQuestions,
    getSinglePlayerQuestionsByGameId,
    getSinglePlayerQuestionsByGradeAndLevelAndGameId,
    getSinglePlayerQuestionsByGameIdAndLevel,
    getSinglePlayerQuestionById,
    editSinglePlayerQuestionById,
    deleteSinglePlayerQuestion
} = require('../dynamodb/database/singlePlayerQuestion')

const { getAnswersByUserIdAndQuestionId } = require("../dynamodb/database/answer")
const RegisterSinglePlayerQuestions = async (req, res) => {
    try {
        var form = new formidable.IncomingForm();
        const workBook = new exceljs.Workbook();
        let fileName = ''; var dataField = {}
        let files = await form.parse(req, function (err, fields) {
            dataField = fields
            console.log('fields', fields)
        });
        console.log('dataField', dataField)
        //let grade = await form.parse(req);
        fileName = files.openedFiles[0].path;
        console.log('fileName', fileName)
        let gradeIndex, gameCategoryIndex, levelIndex, gameIndex, languageIndex, dateIndex,
            correctAnswerIndex, questionIndex, optionAIndex, optionBIndex, optionCIndex, optionDIndex,
            noteIndex, categoryIndex, wordIndex, urlIndex, answerIndex;
        workBook.csv.readFile(fileName).then(async function () {
            var worksheet = workBook.getWorksheet();
            //console.log(worksheet);
            worksheet.eachRow({ includeEmpty: true }, async function (row, rowNumber) {
                let data = JSON.parse(JSON.stringify(row.values).split(',')), len = data.length;
                if (rowNumber === 1) {
                    gameIndex = data.indexOf('gameId');
                    gameCategoryIndex = data.indexOf('gameCategoryId');
                    levelIndex = data.indexOf('level');
                    gradeIndex = data.indexOf('grade');
                    languageIndex = data.indexOf('language');
                    dateIndex = data.indexOf('date');
                    correctAnswerIndex = data.indexOf('correctAnswer');
                    questionIndex = data.indexOf('question');
                    optionAIndex = data.indexOf('option1');
                    optionBIndex = data.indexOf('option2');
                    optionCIndex = data.indexOf('option3');
                    categoryDataType = data.indexOf('categoryType');
                    // optionDIndex = data.indexOf('option4');
                    noteIndex = data.indexOf('note');
                    categoryIndex = data.indexOf('categoryId');
                    wordIndex = data.indexOf('words');
                    urlIndex = data.indexOf('URL');
                    answerIndex = data.indexOf('answer');
                    timer = data.indexOf('timer'),
                        grid = data.indexOf('grid')
                }

                if (rowNumber >= 2) {
                    const dataUploeade = await registerSinglePlayerQuestions({
                        gameId: data[gameIndex],
                        grade: dataField.grade,
                        gameName: dataField.gameName,
                        gameCategory: dataField.gameCategory,
                        numberOfQuestions: req.body.numberOfQuestions,
                        gameCategoryId: data[gameCategoryIndex],
                        level: data[levelIndex],
                        language: data[languageIndex],
                        note: data[noteIndex] || null,
                        question: data[questionIndex] || null,
                        option1: data[optionAIndex] || null,
                        option2: data[optionBIndex] || null,
                        option3: data[optionCIndex] || null,
                        // option4: data[optionDIndex],
                        categoryType: data[categoryDataType],
                        correctAnswer: data[correctAnswerIndex] || null,
                        date: data[dateIndex],
                        words: data[wordIndex] || null,
                        categoryIndex: data[categoryIndex],
                        Questionurl: data[urlIndex] || null,
                        answer: data[answerIndex] || null,
                        timer: data[timer] || null,
                        grid: data[grid] || null
                    });

                    console.log(dataUploeade)
                }
            });
        });
        res.json({
            message: "saved successfully",
        });
    } catch (err) {
        res.json({ message: err });
    }
}

const GetSinglePlayerQuestions = async (req, res) => {

    try {
        const singlePlayerQuestions = await getSinglePlayerQuestions();
        res.json(singlePlayerQuestions);
    } catch (err) {
        res.json({ message: err });
    }
}

const GetSinglePlayerQuestionByGameId = async (req, res) => {
    try {
        const startPage = decodePaginationCursor(req.query.startPage);
        const limit = req.query.limit || 10;
        const singlePlayerQuestionByGameId = await getSinglePlayerQuestionsByGameId(req.params.gameId, startPage, limit);

        singlePlayerQuestionByGameId.LastEvaluatedKey = encodePaginationCursor(singlePlayerQuestionByGameId.LastEvaluatedKey)

        res.json({
            Items: singlePlayerQuestionByGameId.Items,
            count: singlePlayerQuestionByGameId.Count,
            nextPage: singlePlayerQuestionByGameId.LastEvaluatedKey
        });
    } catch (err) {
        res.json({ message: err });
    }
}

const GetSinglePlayerQuestionByGradeAndLevelAndGameId = async (req, res) => {
    var level = parseInt(req.params.level);
    const queryObject = url.parse(req.url, true).query;
    var startPage = decodePaginationCursor(queryObject.startPage);
    var limit = queryObject.limit || 10;
    const maxLimit = limit;
    const userId = queryObject.userId;
    var response = {
        Items: [],
        count: 0,
        nextPage: 'null'
    };
    try {

        while (limit > 0) {

            const singlePlayerQuestionByGradeAndLevelAndGameId = await getSinglePlayerQuestionsByGradeAndLevelAndGameId(
                req.params.gameId,
                level,
                req.params.grade,
                startPage,
                100
            );

            startPage = singlePlayerQuestionByGradeAndLevelAndGameId.LastEvaluatedKey;

            singlePlayerQuestionByGradeAndLevelAndGameId.LastEvaluatedKey = encodePaginationCursor(singlePlayerQuestionByGradeAndLevelAndGameId.LastEvaluatedKey);

            if (userId) {

                // singlePlayerQuestionByGradeAndLevelAndGameId.Items.forEach(async question => {
                for (var i = 0; i < singlePlayerQuestionByGradeAndLevelAndGameId.Items.length; i++) {
                    const question = singlePlayerQuestionByGradeAndLevelAndGameId.Items[i];
                    const answer = await getAnswersByUserIdAndQuestionId(userId, question.id);

                    if (!answer.Items.length && limit > 0) {
                        response.Items = response.Items.concat(question);
                        response.count = response.count + 1;
                        limit = maxLimit - response.count
                    }
                }

                response.nextPage = singlePlayerQuestionByGradeAndLevelAndGameId.LastEvaluatedKey;
                if (response.nextPage === undefined || response.nextPage === null) {
                    limit = 0;
                }
            }

            else {

                singlePlayerQuestionByGradeAndLevelAndGameId.Items.forEach(async question => {

                    if (limit > 0) {
                        response.Items = response.Items.concat(question);
                        response.count = response.count + 1;
                        limit = maxLimit - response.count
                    }
                });


                response.nextPage = singlePlayerQuestionByGradeAndLevelAndGameId.LastEvaluatedKey;

                if (response.nextPage === undefined || response.nextPage === null) {
                    limit = 0;
                }
            }

        }
        res.json(response);
    } catch (err) {
        console.log(err)
        res.json({ message: err });
    }
}

const GetSinglePlayerQuestionByGradelAndGameId = async (req, res) => {
    const level = parseInt(req.params.level);
    const startPage = decodePaginationCursor(req.body.startPage);
    const limit = req.body.limit || 10;
    try {
        const singlePlayerQuestionByGradeAndLevelAndGameId = await getSinglePlayerQuestionsByGameIdAndLevel(
            req.params.gameId,
            level,
            startPage,
            limit
        );

        singlePlayerQuestionByGradeAndLevelAndGameId.LastEvaluatedKey = encodePaginationCursor(singlePlayerQuestionByGradeAndLevelAndGameId.LastEvaluatedKey)

        res.json({
            Items: singlePlayerQuestionByGradeAndLevelAndGameId.Items,
            count: singlePlayerQuestionByGradeAndLevelAndGameId.Count,
            nextPage: singlePlayerQuestionByGradeAndLevelAndGameId.LastEvaluatedKey
        });
    } catch (err) {
        res.json({ message: err });
    }
}

const GetSinglePlayerQuestionById = async (req, res) => {
    try {
        const singleQuestion = await getSinglePlayerQuestionById(req.params.id);
        res.json(singleQuestion);
    } catch (err) {
        res.json({ message: err });
    }

}

const UpdateSinglePlayer = async (req, res) => {
    const previousSinglePlayerQuestion = await getSinglePlayerQuestionById(req.params.id);

    if (!previousSinglePlayerQuestion) {
        return res.json({ message: "Single Player Question Not Found" });
    }

    console.log(req.body)
    console.log(previousSinglePlayerQuestion);

    await editSinglePlayerQuestionById(previousSinglePlayerQuestion, {
        note: req.body.note,
        question: req.body.question,
        option1: req.body.option1,
        option2: req.body.option2,
        option3: req.body.option3,
        correctAnswer: req.body.correctAnswer,
        words: req.body.words,
        url: req.body.url,
        timer: req.body.timer,
        answer: req.body.answer,
        grid: req.body.grid,
    });

    const updatedSinglePlayerQuestion = await getSinglePlayerQuestionById(req.params.id);

    res.json(updatedSinglePlayerQuestion);
};

const DeleteSinglePlayerQuestion = async (req, res) => {
    try {
        const delUser = await deleteSinglePlayerQuestion(req.params.id)
        res.json(delUser);
    } catch (err) {
        res.json({ message: err });
    }
}
module.exports = { RegisterSinglePlayerQuestions, GetSinglePlayerQuestions, GetSinglePlayerQuestionByGameId, GetSinglePlayerQuestionByGradeAndLevelAndGameId, GetSinglePlayerQuestionByGradelAndGameId, GetSinglePlayerQuestionById, UpdateSinglePlayer, DeleteSinglePlayerQuestion }