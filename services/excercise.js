const url = require('url');
const formidable = require('formidable');
const csvtojson = require('csvtojson');
const fs = require('fs');
const {
    encodePaginationCursor,
    decodePaginationCursor
} = require('./encodingDecoding')
const {
    addNewExcercise,
    getExcercises,
    getExcercisesByGameId,
    getExcercisesByGameCategoryId,
    getExcercisesByGameCategoryAndLevel,
    getExcercisesByGameCategoryAndGrade,
    getExcercisesByGameCategoryAndLevelAndGrade,
    getExcerciseById,
    editExcerciseById,
    deleteExcerciseQuestion
} = require('../dynamodb/database/excercise')
const { getAnswersByUserIdAndQuestionId } = require("../dynamodb/database/answer")
const AddNewExcercise = async (req, res) => {
    try {
        var form = await new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var grade = fields.grade;
            var oldpath = files.file_path.path;
            var newpath = './uploads/' + files.file_path.name;
            //fs.rename(oldpath, newpath, function (err) {
            csvtojson().fromFile(oldpath).then(async (source) => {

                for (var i = 0; i < source.length; i++) {

                    const datass = await addNewExcercise({
                        gameId: source[i]["game id"],
                        grade: grade,
                        gameCategoryId: source[i]["game_category id"],
                        level: source[i]["level"],
                        language: source[i]["language_id"],
                        note: source[i]["note"] || null,
                        question: source[i]["question"],
                        option1: source[i]["option1"],
                        option2: source[i]["option2"] || null,
                        option3: source[i]["option3"] || null,
                        option4: source[i]["option4"] || null,
                        correctAnswer: source[i]["correct_answer"],
                        img_url: source[i]["image_url"] || null,
                        video_url: source[i]["audio_url"] || null,
                        audio_url: source[i]["video_url"] || null,
                        timer: source[i]["timer"] || null
                    });

                    console.log(datass);

                }

            });

        });


        res.json({ message: "saved successfully" });

    } catch (ex) {
        res.json({ message: ex });
    }

}

const GetAllExcercise = async (req, res) => {

    try {
        const excercise = await getExcercises();
        res.json(excercise);
    } catch (err) {
        res.json({ message: err });
    }
}

const GetExcerciseById = async (req, res) => {
    try {
        const excercise = await getExcerciseById(req.params.id);
        res.json(excercise);
    } catch (err) {
        res.json({ message: err });
    }

}

const GetAllExcerciseByGameId = async (req, res) => {
    try {
        const startPage = decodePaginationCursor(req.body.startPage);
        const limit = req.body.limit || 10;
        const excerciseByGameId = await getExcercisesByGameId(req.params.gameId, startPage, limit);
        excerciseByGameId.LastEvaluatedKey = encodePaginationCursor(excerciseByGameId.LastEvaluatedKey)

        res.json({
            Items: excerciseByGameId.Items,
            count: excerciseByGameId.Count,
            nextPage: excerciseByGameId.LastEvaluatedKey
        });
    } catch (err) {
        res.json({ message: err });
    }
}

const GetAllExcerciseByGameCategoryId = async (req, res) => {
    try {
        const startPage = decodePaginationCursor(req.body.startPage);
        const limit = req.body.limit || 10;
        const excerciseByGameCategoryId = await getExcercisesByGameCategoryId(req.params.gameCategoryId, startPage, limit);
        excerciseByGameCategoryId.LastEvaluatedKey = encodePaginationCursor(excerciseByGameCategoryId.LastEvaluatedKey)

        res.json({
            Items: excerciseByGameCategoryId.Items,
            count: excerciseByGameCategoryId.Count,
            nextPage: excerciseByGameCategoryId.LastEvaluatedKey
        });
    } catch (err) {
        res.json({ message: err });
    }
}

const GetAllExcerciseByGameCategoryAndLevel = async (req, res) => {
    try {
        const startPage = decodePaginationCursor(req.body.startPage);
        const limit = req.body.limit || 10;
        const excerciseByGameCategoryAndLevel = await getExcercisesByGameCategoryAndLevel(req.params.gameCategoryId, req.params.level, startPage, limit);
        excerciseByGameCategoryAndLevel.LastEvaluatedKey = encodePaginationCursor(excerciseByGameCategoryAndLevel.LastEvaluatedKey)

        res.json({
            Items: excerciseByGameCategoryAndLevel.Items,
            count: excerciseByGameCategoryAndLevel.Count,
            nextPage: excerciseByGameCategoryAndLevel.LastEvaluatedKey
        });
    } catch (err) {
        res.json({ message: err });
    }
}

const GetAllExcerciseByGameCategoryAndGrade = async (req, res) => {
    try {
        const excerciseByGameCategoryAndGrade = await getExcercisesByGameCategoryAndGrade(req.params.gameCategoryId, req.params.grade);

        res.json({
            Items: excerciseByGameCategoryAndGrade.Items
        });
    } catch (err) {
        res.json({ message: err });
    }
}

const GetAllExcerciseByGameCategoryAndLevelAndGrade = async (req, res) => {
    const queryObject = url.parse(req.url, true).query;
    var startPage = decodePaginationCursor(queryObject.startPage);
    var limit = parseInt(queryObject.limit) || 10;
    const maxLimit = limit;
    const userId = queryObject.userId;
    var response = {
        Items: [],
        count: 0,
        nextPage: 'null'
    };
    try {

        do {

            const excerciseByGameCategoryAndLevelAndGrade = await getExcercisesByGameCategoryAndLevelAndGrade(
                req.params.gameCategoryId,
                req.params.level,
                req.params.grade,
                startPage,
                100
            );

            startPage = excerciseByGameCategoryAndLevelAndGrade.LastEvaluatedKey;

            excerciseByGameCategoryAndLevelAndGrade.LastEvaluatedKey = encodePaginationCursor(excerciseByGameCategoryAndLevelAndGrade.LastEvaluatedKey)

            if (userId) {

                excerciseByGameCategoryAndLevelAndGrade.Items.forEach(async question => {
                    const answer = await getAnswersByUserIdAndQuestionId(userId, question.id);

                    if (!answer.Items.length && limit > 0) {
                        response.Items = response.Items.concat(question);
                        response.count = response.count + 1;
                        limit = maxLimit - response.count
                    }
                });

                response.nextPage = excerciseByGameCategoryAndLevelAndGrade.LastEvaluatedKey;
                if (response.nextPage === undefined) {
                    limit = 0;
                }
            }
            else {

                excerciseByGameCategoryAndLevelAndGrade.Items.forEach(async question => {

                    if (limit > 0) {
                        response.Items = response.Items.concat(question);
                        response.count = response.count + 1;
                        limit = maxLimit - response.count
                    }
                });

                response.nextPage = excerciseByGameCategoryAndLevelAndGrade.LastEvaluatedKey;
                if (response.nextPage === undefined || response.nextPage === null) {
                    limit = 0;
                }
            }

        } while (limit > 0)
        res.json(response);
    } catch (err) {
        res.json({ message: err });
    }
}

const UpdateExcercise = async (req, res) => {
    const previousExcercise = await getExcerciseById(req.params.id);

    if (!previousExcercise) {
        return res.json({ message: "Excercise Not Found" });
    }

    console.log(req.body)

    await editExcerciseById(previousExcercise, {
        note: req.body.note,
        question: req.body.question,
        option1: req.body.option1,
        option2: req.body.option2,
        option3: req.body.option3,
        option4: req.body.option4,
        correctAnswer: req.body.correctAnswer,
        timer: req.body.timer,
    });

    const updatedExcerciseQuestion = await getExcerciseById(req.params.id);

    res.json(updatedExcerciseQuestion);
};

const DeleteExcerciseQuestion = async (req, res) => {
    try {
        const delUser = await deleteExcerciseQuestion(req.params.id)
        res.json(delUser);
    } catch (err) {
        res.json({ message: err });
    }
}
module.exports = { AddNewExcercise, GetAllExcercise, GetExcerciseById, GetAllExcerciseByGameId, GetAllExcerciseByGameCategoryId, GetAllExcerciseByGameCategoryAndLevel, GetAllExcerciseByGameCategoryAndGrade, GetAllExcerciseByGameCategoryAndLevelAndGrade, UpdateExcercise, DeleteExcerciseQuestion }