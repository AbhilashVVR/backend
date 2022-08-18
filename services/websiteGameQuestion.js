const exceljs = require('exceljs');
const formidable = require('formidable');

const {
    registerWebsiteGameQuestions,
    getWebsiteGameQuestions,
    getWebsiteGameQuestionsByGameId,
    getWebsiteGameQuestionByLevelAndGameId
} = require('../dynamodb/database/websiteGameQuestion')
const RegisterWebsiteGameQuestions = async (req, res) => {
    try {
        var form = new formidable.IncomingForm();
        const workBook = new exceljs.Workbook();
        let fileName = ''; var dataField = {}
        await form.parse(req, function (err, fields) {
            dataField = fields
        });
        let files = await form.parse(req);
        fileName = files.openedFiles[0].path;
        let gameCategoryIndex, levelIndex, gameIndex, languageIndex, dateIndex,
            correctAnswerIndex, questionIndex, optionAIndex, optionBIndex, optionCIndex, optionDIndex,
            noteIndex, categoryIndex, wordIndex, urlIndex, answerIndex;
        workBook.csv.readFile(fileName).then(async function () {
            var worksheet = workBook.getWorksheet();
            worksheet.eachRow({ includeEmpty: true }, async function (row, rowNumber) {
                let data = JSON.parse(JSON.stringify(row.values).split(',')), len = data.length;
                if (rowNumber === 1) {
                    gameIndex = data.indexOf('gameId');
                    gameCategoryIndex = data.indexOf('gameCategoryId');
                    levelIndex = data.indexOf('level');
                    languageIndex = data.indexOf('language');
                    dateIndex = data.indexOf('date');
                    correctAnswerIndex = data.indexOf('correctAnswer');
                    questionIndex = data.indexOf('question');
                    optionAIndex = data.indexOf('option1');
                    optionBIndex = data.indexOf('option2');
                    optionCIndex = data.indexOf('option3');
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
                    await registerWebsiteGameQuestions({
                        gameId: data[gameIndex],
                        gameName: dataField.gameName,
                        gameCategory: dataField.gameCategory,
                        numberOfQuestions: req.body.numberOfQuestions,
                        gameCategoryId: data[gameCategoryIndex],
                        level: data[levelIndex],
                        language: data[languageIndex],
                        note: data[noteIndex],
                        question: data[questionIndex],
                        option1: data[optionAIndex],
                        option2: data[optionBIndex],
                        option3: data[optionCIndex],
                        // option4: data[optionDIndex],
                        correctAnswer: data[correctAnswerIndex],
                        date: data[dateIndex],
                        words: data[wordIndex],
                        categoryIndex: data[categoryIndex],
                        url: data[urlIndex],
                        answer: data[answerIndex],
                        timer: data[timer],
                        grid: data[grid]
                    });
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

const GetWebsiteGameQuestions = async (req, res) => {

    try {
        const websiteGameQuestions = await getWebsiteGameQuestions();
        res.json(websiteGameQuestions);
    } catch (err) {
        res.json({ message: err });
    }
}

const GetWebsiteGameQuestionByGameId = async (req, res) => {
    try {
        const websiteGameQuestionByGameId = await getWebsiteGameQuestionsByGameId(req.params.gameId);
        res.json(websiteGameQuestionByGameId.Items);
    } catch (err) {
        res.json({ message: err });
    }
}

const GetWebsiteGameQuestionByLevelAndGameId = async (req, res) => {

    const level = parseInt(req.params.level);

    try {
        const websiteGameQuestionByLevelAndGameId = await getWebsiteGameQuestionByLevelAndGameId(
            req.params.gameId,
            level
        );
        res.json(websiteGameQuestionByLevelAndGameId.Items);
    } catch (err) {
        res.json({ message: err });
    }
}
module.exports = { RegisterWebsiteGameQuestions, GetWebsiteGameQuestions, GetWebsiteGameQuestionByGameId, GetWebsiteGameQuestionByLevelAndGameId }