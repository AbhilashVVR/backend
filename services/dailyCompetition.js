const exceljs = require('exceljs');
const formidable = require('formidable');

const {
    registerDailyCompetitionQuestions,
    getDailyCompetitionQuestions,
    getDailyCompetitionQuestionByGameId,
    getDailyCompetitionQuestionByGradeAndLevelAndGameId
} = require('../dynamodb/database/dailyCompetition')
const RegisterDailyCompetitionQuestions = async (req, res) => {
    try {
        var form = new formidable.IncomingForm();
        const workBook = new exceljs.Workbook();
        let fileName = ''; var dataField = {}
        await form.parse(req, function (err, fields) {
            dataField = fields
        });
        let files = await form.parse(req);
        //let grade = await form.parse(req);
        fileName = files.openedFiles[0].path;
        let gradeIndex, gameCategoryIndex, levelIndex, gameIndex, languageIndex, dateIndex,
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
                    gradeIndex = data.indexOf('grade');
                    languageIndex = data.indexOf('language');
                    dateIndex = data.indexOf('date');
                    correctAnswerIndex = data.indexOf('correctAnswer');
                    questionIndex = data.indexOf('question');
                    optionAIndex = data.indexOf('option1');
                    optionBIndex = data.indexOf('option2');
                    optionCIndex = data.indexOf('option3');
                    categoryType = data.indexOf('category Type');
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
                    await registerDailyCompetitionQuestions({
                        gameId: data[gameIndex],
                        grade: dataField.grade,
                        gradeName: dataField.gameName,
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
                        categoryType: data[categoryType],
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

const GetDailyCompetitionQuestions = async (req, res) => {

    try {
        const dailyCompetitionQuestions = await getDailyCompetitionQuestions();
        res.json(dailyCompetitionQuestions.Items);
    } catch (err) {
        res.json({ message: err });
    }
}

const GetDailyCompetitionQuestionByGameId = async (req, res) => {
    try {
        const dailyCompetitionQuestionByGameId = await getDailyCompetitionQuestionByGameId(req.params.gameId);
        res.json(dailyCompetitionQuestionByGameId.Items);
    } catch (err) {
        res.json({ message: err });
    }
}

const GetDailyCompetitionQuestionByGradelAndGameId = async (req, res) => {
    const level = parseInt(req.params.level);
    try {
        const dailyCompetitionQuestionByGradeAndLevelAndGameId = await getDailyCompetitionQuestionByGradeAndLevelAndGameId(
            req.params.gameId,
            level
        );

        res.json(dailyCompetitionQuestionByGradeAndLevelAndGameId.Items);
    } catch (err) {
        res.json({ message: err });
    }
}
module.exports = {
    RegisterDailyCompetitionQuestions,
    GetDailyCompetitionQuestions,
    GetDailyCompetitionQuestionByGameId,
    GetDailyCompetitionQuestionByGradelAndGameId
}