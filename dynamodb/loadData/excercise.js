const AWS = require("aws-sdk");

const tableName = 'excercise';

AWS.config.update({
    region: "ap-south-1",
    // endpoint: "dynamodb.ap-south-1.amazonaws.com"
    endpoint: "http://localhost:8000"
});
let dynamodb = new AWS.DynamoDB({ correctClockSkew: true });
var docClient = new AWS.DynamoDB.DocumentClient();

var fs = require('fs');

console.log("Importing Exercises into DynamoDB. Please wait.");

var allExercise = JSON.parse(fs.readFileSync('exercise.json', 'utf8'));
allExercise.forEach(function (exercise) {
    var params = {
        TableName: tableName,
        Item: {
            "id": exercise._id,
            "gameId": exercise.gameId,
            "gameCategoryId": exercise.gameCategoryId,
            "grade": exercise.grade,
            "date": exercise.date,
            "language": exercise.language,
            "img_url": exercise.img_url,
            "video_url": exercise.video_url,
            "audio_url": exercise.audio_url,
            "question": exercise.question,
            "option1": exercise.option1,
            "option2": exercise.option2,
            "option3": exercise.option3,
            "option4": exercise.option4,
            "correctAnswer": exercise.correctAnswer,
            "level": exercise.level,
            "timer": exercise.timer,
        }
    };

    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add exercise", exercise.question, ". Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("PutItem succeeded:", exercise.question);
        }
    });
});
