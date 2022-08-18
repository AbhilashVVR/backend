const { dynamodb, docClient } = require('../../config');
const randomstring = require("randomstring");
const { formatInTimeZone } = require("date-fns-tz");

const tableName = 'singleques';

function createSinglePlayerQuestionTable() {

    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },  //Partition key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "gameId", AttributeType: "S" },
            { AttributeName: "level", AttributeType: "N" },
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "gameId",
                KeySchema:
                    [
                        {
                            AttributeName: "gameId",
                            KeyType: "HASH"
                        }
                    ],
                Projection:
                    { ProjectionType: "ALL" },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 10,
                    WriteCapacityUnits: 10
                }
            },
            {
                IndexName: "levelAndGameId",
                KeySchema:
                    [
                        {
                            AttributeName: "gameId",
                            KeyType: "HASH"
                        },
                        {
                            AttributeName: "level",
                            KeyType: "RANGE"
                        }
                    ],
                Projection:
                    { ProjectionType: "ALL" },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 10,
                    WriteCapacityUnits: 10
                }
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 1000,
            WriteCapacityUnits: 1000
        }
    };

    dynamodb.createTable(params, function (err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

const registerSinglePlayerQuestions = async (singlePlayerQuestionDetails) => {

    var params = {
        TableName: tableName,
        Item: {
            gameId: singlePlayerQuestionDetails.gameId,
            // grade: singlePlayerQuestionDetails.grade,
            gameName: singlePlayerQuestionDetails.gameName,
            gameCategory: singlePlayerQuestionDetails.gameCategory,
            numberOfQuestions: singlePlayerQuestionDetails.numberOfQuestions,
            gameCategoryId: singlePlayerQuestionDetails.gameCategoryId,
            level: singlePlayerQuestionDetails.level,
            language: singlePlayerQuestionDetails.language,
            categoryType: singlePlayerQuestionDetails.categoryType,
            date: singlePlayerQuestionDetails.date,
            // categoryIndex: singlePlayerQuestionDetails[categoryIndex]
            categoryIndex: singlePlayerQuestionDetails.categoryIndex
        }
    };
    params.Item.id = randomstring.generate(20);
    params.Item.createdAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
    params.Item.updatedAt = null;

    // params.Item.notes = singlePlayerQuestionDetails.notes ? singlePlayerQuestionDetails.notes : null;
    // params.Item.question = singlePlayerQuestionDetails.question ? singlePlayerQuestionDetails.question : null;
    // params.Item.option1 = singlePlayerQuestionDetails.option1 ? singlePlayerQuestionDetails.option1 : null;
    // params.Item.option2 = singlePlayerQuestionDetails.option2 ? singlePlayerQuestionDetails.option2 : null;
    // params.Item.option3 = singlePlayerQuestionDetails.option3 ? singlePlayerQuestionDetails.option3 : null;
    // params.Item.correctAnswer = singlePlayerQuestionDetails.correctAnswer ? singlePlayerQuestionDetails.correctAnswer : null;
    // params.Item.words = singlePlayerQuestionDetails.words ? singlePlayerQuestionDetails.words : null;
    // params.Item.Questionurl = singlePlayerQuestionDetails.notes ? singlePlayerQuestionDetails.notes : null;
    // params.Item.answer = singlePlayerQuestionDetails.answer ? singlePlayerQuestionDetails.answer : null;
    // params.Item.timer = singlePlayerQuestionDetails.timer ? singlePlayerQuestionDetails.timer : null;
    // params.Item.grid = singlePlayerQuestionDetails.grid ? singlePlayerQuestionDetails.grid : null;

    if (singlePlayerQuestionDetails.grade){
        params.Item.grade = singlePlayerQuestionDetails.grade
    }else{
        params.Item.grade = 1
    }
    
    if(singlePlayerQuestionDetails.notes){
        params.Item.notes = singlePlayerQuestionDetails.notes
    }
    else{
        params.Item.notes = null
    }

    if(singlePlayerQuestionDetails.option1){
        params.Item.option1 = singlePlayerQuestionDetails.option1
    }
    else{
        params.Item.option1 = null
    }

    if(singlePlayerQuestionDetails.option2){
        params.Item.option2 = singlePlayerQuestionDetails.option2
    }
    else{
        params.Item.option2 = null
    }

    if(singlePlayerQuestionDetails.option3){
        params.Item.option3 = singlePlayerQuestionDetails.option3
    }
    else{
        params.Item.option3 = null
    }

    if(singlePlayerQuestionDetails.question){
        params.Item.question = singlePlayerQuestionDetails.question
    }
    else{
        params.Item.question = null
    }

    if(singlePlayerQuestionDetails.notes){
        params.Item.notes = singlePlayerQuestionDetails.notes
    }
    else{
        params.Item.notes = null
    }

    if(singlePlayerQuestionDetails.correctAnswer){
        params.Item.correctAnswer = singlePlayerQuestionDetails.correctAnswer
    }
    else{
        params.Item.correctAnswer = null
    }

    if(singlePlayerQuestionDetails.words){
        params.Item.words = singlePlayerQuestionDetails.words
    }
    else{
        params.Item.words = null
    }

    if(singlePlayerQuestionDetails.Questionurl){
        params.Item.Questionurl = singlePlayerQuestionDetails.Questionurl
    }
    else{
        params.Item.Questionurl = null
    }

    if(singlePlayerQuestionDetails.answer){
        params.Item.answer = singlePlayerQuestionDetails.answer
    }
    else{
        params.Item.answer = null
    }

    if(singlePlayerQuestionDetails.timer){
        params.Item.timer = singlePlayerQuestionDetails.timer
    }
    else{
        params.Item.timer = null
    }

    if(singlePlayerQuestionDetails.grid){
        params.Item.grid = singlePlayerQuestionDetails.grid
    }
    else{
        params.Item.grid = null
    }

    await docClient.put(params).promise();
    return params.Item.id
}

const getSinglePlayerQuestions = async () => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };

    var response = await docClient.scan(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getSinglePlayerQuestionsByGameId = async (gameId, startPage, limit) => {

    const params = {
        TableName: tableName,
        IndexName: 'gameId',
        KeyConditionExpression: '#gameId = :gameId',
        ExpressionAttributeNames: {
            '#gameId': 'gameId'
        },
        ExpressionAttributeValues: {
            ':gameId': `${gameId}`
        },
        // ExclusiveStartKey: startPage,
        // Limit: limit,
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getSinglePlayerQuestionsByGameIdAndLevel = async (gameId, level, startPage, limit) => {

    console.log(startPage);

    const params = {
        TableName: tableName,
        IndexName: 'levelAndGameId',
        KeyConditionExpression: '#gameId = :gameId AND #level = :level',
        ExpressionAttributeNames: {
            '#gameId': 'gameId',
            '#level': 'level'
        },
        ExpressionAttributeValues: {
            ':gameId': `${gameId}`,
            ':level': level
        },
        ExclusiveStartKey: startPage,
        Limit: limit,
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getSinglePlayerQuestionsByGradeAndLevelAndGameId = async (gameId, level, grade, startPage, limit) => {

    const params = {
        TableName: tableName,
        IndexName: 'levelAndGameId',
        FilterExpression: '#grade = :grade',
        KeyConditionExpression: '#gameId = :gameId AND #level = :level',
        ExpressionAttributeNames: {
            '#gameId': 'gameId',
            '#level': 'level',
            '#grade': 'grade',
        },
        ExpressionAttributeValues: {
            ':gameId': `${gameId}`,
            ':level': level,
            ':grade': `${grade}`
        },
        ExclusiveStartKey: startPage,
        Limit: limit,
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}


const getSinglePlayerQuestionById = async (id) => {
    var params = {
        TableName: tableName,
        Key: {
            "id": id,
        }
    };
    console.log("getSinglePlayerQuestionById", params);
    var response = await docClient.get(params).promise();
    console.log("getSinglePlayerQuestionById", response);
    return response.Item
}

const editSinglePlayerQuestionById = async (previouspreviousSinglePlayerQuestion, details) => {

    const updatedAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX') // 2014-10-25 06:46:20-04:00

    var params = {
        TableName: tableName,
        Key: {
            "id": previouspreviousSinglePlayerQuestion.id
        },
        UpdateExpression: `set
            note = :note,
            question = :question,
            option1 = :option1,
            option2 = :option2,
            option3 = :option3,
            correctAnswer = :correctAnswer,
            words = :words,
            questionUrl = :questionUrl,
            answer = :answer,
            timer = :timer,
            grid = :grid,
            updatedAt = :updatedAt`,
        ExpressionAttributeValues: {
            ":note": details.note || previouspreviousSinglePlayerQuestion.note || null,
            ":question": details.question || previouspreviousSinglePlayerQuestion.question || null,
            ":option1": details.option1 || previouspreviousSinglePlayerQuestion.option1 || null,
            ":option2": details.option2 || previouspreviousSinglePlayerQuestion.option2 || null,
            ":option3": details.option3 || previouspreviousSinglePlayerQuestion.option3 || null,
            ":correctAnswer": details.correctAnswer || previouspreviousSinglePlayerQuestion.correctAnswer || null,
            ":words": details.words || previouspreviousSinglePlayerQuestion.words || null,
            ":questionUrl": details.questionUrl || previouspreviousSinglePlayerQuestion.questionUrl || null,
            ":answer": details.answer || previouspreviousSinglePlayerQuestion.answer || null,
            ":timer": details.timer || previouspreviousSinglePlayerQuestion.timer || null,
            ":grid": details.grid || previouspreviousSinglePlayerQuestion.grid || null,
            ":updatedAt": updatedAt || null
        },
        ReturnValues: "UPDATED_NEW"
    };
    console.log("editSinglePlayerQuestionById", params);
    var response = await docClient.update(params).promise();
    console.log("response", response);
    return response

}

const deleteSinglePlayerQuestion = async (id) => {

    var params = {
        TableName: tableName,
        Key: {
            "id": id
        },
        ConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        }
    };
    const response = await docClient.delete(params).promise();

    return response

}

const deleteTable = async (id) => {

    var params = {
        TableName: tableName,
    };
    const response = await dynamodb.deleteTable(params).promise();

    return response

}

// deleteTable()
// createSinglePlayerQuestionTable()

module.exports = {
    registerSinglePlayerQuestions,
    getSinglePlayerQuestions,
    getSinglePlayerQuestionsByGameId,
    getSinglePlayerQuestionsByGradeAndLevelAndGameId,
    getSinglePlayerQuestionsByGameIdAndLevel,
    getSinglePlayerQuestionById,
    editSinglePlayerQuestionById,
    deleteSinglePlayerQuestion
};

// java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
