const { dynamodb, docClient } = require('../../config');
const randomstring = require("randomstring");
const { formatInTimeZone } = require("date-fns-tz");
const tableName = 'rewards';

function createRewardsTable() {

    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },  //Partition key
            //{ AttributeName: "rewardName", KeyType: "RANGE" },  //Sort key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "rewardName", AttributeType: "S" }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "rewardName",
                KeySchema:
                    [
                        {
                            AttributeName: "rewardName",
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

const addNewReward = async (rewardDetails) => {

    var params = {
        TableName: tableName,
        Item: rewardDetails
    };
    params.Item.id = randomstring.generate(20);
    params.Item.createdAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
    params.Item.updatedAt = null;

    await docClient.put(params).promise();
    return params.Item.id
}

const getRewards = async () => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };

    console.log("Get reward By Id...");
    var response = await docClient.scan(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getRewardWithId = async (id) => {

    var params = {
        TableName: tableName,
        Key: {
            "id": id,
        }
    };

    var response = await docClient.get(params).promise()
    return response.Item
}

const getRewardsByName = async (rewardName) => {

    const params = {
        TableName: tableName,
        IndexName: 'rewardName',
        KeyConditionExpression: '#rewardName = :rewardName',
        ExpressionAttributeNames: {
            '#rewardName': 'rewardName'
        },
        ExpressionAttributeValues: {
            ':rewardName': `${rewardName}`
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const editRewardById = async (previousReward, details) => {

    const updatedAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX') // 2014-10-25 06:46:20-04:00

    var params = {
        TableName: tableName,
        Key: {
            "id": previousReward.id
        },
        UpdateExpression: "set rewardName = :rewardName, amount = :amount, isEnabled = :isEnabled, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
            ":rewardName": details.rewardName || previousReward.rewardName,
            ":amount": details.amount || previousReward.amount,
            ":isEnabled": details.isEnabled,
            ":updatedAt": updatedAt
        },
        ReturnValues: "UPDATED_NEW"
    };

    console.log(params)
    var response = await docClient.update(params).promise();
    return response.Attributes

}

const deleteRewards = async (id) => {

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
//createRewardsTable()

module.exports = {
    addNewReward,
    getRewards,
    getRewardWithId,
    getRewardsByName,
    editRewardById,
    deleteRewards,
};

// java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
