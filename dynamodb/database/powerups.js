const { dynamodb, docClient } = require('../../config');
const randomstring = require("randomstring");
const { formatInTimeZone } = require("date-fns-tz");
const tableName = 'powerups';

function createPowerupTable() {

    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },  //Partition key
            //{ AttributeName: "categoryName", KeyType: "RANGE" },  //Sort key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "gameId", AttributeType: "S" }
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
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 10
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

const addNewPowerup = async (powerupDetails) => {

    var params = {
        TableName: tableName,
        Item: powerupDetails
    };
    params.Item.id = randomstring.generate(20);
    params.Item.createdAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
    params.Item.updatedAt = null;

    console.log(params);

    await docClient.put(params).promise();
    return params.Item.id
}

const getPowerups = async () => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };

    console.log("Get powerups By Id...");
    var response = await docClient.scan(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getPowerupWithId = async (id) => {

    var params = {
        TableName: tableName,
        Key: {
            "id": id,
        }
    };

    var response = await docClient.get(params).promise()
    return response.Item
}

const editPowerupById = async (previousPowerup, details) => {

    const updatedAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX') // 2014-10-25 06:46:20-04:00

    var params = {
        TableName: tableName,
        Key: {
            "id": previousPowerup.id
        },
        UpdateExpression: `set
            powerName = :powerName,
            isEnable = :isEnable,
            coins = :coins,
            limitCount =:limitCount,
            gameId = :gameId,
            gameName = :gameName,
            isIAP = :isIAP,
            isBuyingLimit = :isBuyingLimit,
            updatedAt = :updatedAt`,
        ExpressionAttributeValues: {
            ":powerName": details.powerName || previousPowerup.powerName,
            ":isEnable": details.isEnable,
            ":coins" : details.coins || previousPowerup.coins,
            ":limitCount": details.limitCount || previousPowerup.limitCount,
            ":gameId": details.gameId || previousPowerup.gameId,
            ":gameName": details.gameName || previousPowerup.gameName,
            ":isIAP": details.isIAP,
            ":isBuyingLimit": details.isBuyingLimit,
            ":featuredType": details.featuredType || previousPowerup.featuredType,
            ":updatedAt": updatedAt
        },
        ReturnValues: "UPDATED_NEW"
    };
    var response = await docClient.update(params).promise();
    return response.Attributes

}

const getPowerupsByGameId = async (gameId) => {

    const params = {
        TableName: tableName,
        IndexName: 'gameId',
        KeyConditionExpression: '#gameId = :gameId',
        ExpressionAttributeNames: {
            '#gameId': 'gameId'
        },
        ExpressionAttributeValues: {
            ':gameId': `${gameId}`
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const deletePowerup = async (id) => {

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

//deleteTable()
//createPowerupTable()

module.exports = {
    addNewPowerup,
    getPowerups,
    getPowerupWithId,
    getPowerupsByGameId,
    editPowerupById,
    deletePowerup,
};

// java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
