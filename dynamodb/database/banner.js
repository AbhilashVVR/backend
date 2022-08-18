const { dynamodb, docClient } = require('../../config');
const { formatInTimeZone } = require("date-fns-tz");

const randomstring = require("randomstring");
const tableName = 'banners';
function createBannerTable() {

    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },  //Partition key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
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

const addNewBanner = async (bannerDetails) => {

    var params = {
        TableName: tableName,
        Item: bannerDetails
    };

    params.Item.id = randomstring.generate(20),
    params.Item.createdAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');

    await docClient.put(params).promise();
    return params.Item.id

}

const getBanners = async () => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };
    var response = await docClient.scan(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

function deleteBanner(id) {

    var params = {
        TableName: tableName,
        Key: {
            "id": id
        },
        ConditionExpression: "id === :id",
        ExpressionAttributeValues: {
            ":id": id
        }
    };

    docClient.delete(params, function (err, data) {
        if (err) {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
            return JSON.stringify(err, null, 2)
        } else {
            console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
            return JSON.stringify(data, null, 2)
        }
    });

}

const getBannerWithId = async (id) => {

    var params = {
        TableName: tableName,
        Key: {
            "id": id,
        }
    };

    var response = await docClient.get(params).promise()
    return response.Item
}

const enableDisableBanner = async (id, details) => {

    var params = {
        TableName: tableName,
        Key: {
            "id": id
        },
        UpdateExpression: "set bannerStatus = :bannerStatus, isEnable=:isEnable",
        ExpressionAttributeValues: {
            ":bannerStatus": details.bannerStatus,
            ":isEnable": details.isEnable
        },
        ReturnValues: "UPDATED_NEW"
    };

    var response = await docClient.update(params).promise();
    return response.Attributes

}

const deleteTable = async (id) => {

    var params = {
        TableName: tableName,
    };
    const response = await dynamodb.deleteTable(params).promise();
    return response
}

//deleteTable()
//createBannerTable();

module.exports = {
    addNewBanner,
    getBanners,
    deleteBanner,
    getBannerWithId,
    enableDisableBanner
};