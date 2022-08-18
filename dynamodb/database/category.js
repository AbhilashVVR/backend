const { dynamodb, docClient } = require('../../config');
const randomstring = require("randomstring");
const { formatInTimeZone } = require("date-fns-tz");
const tableName = 'category';

function createCategoryTable() {

    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },  //Partition key
            //{ AttributeName: "categoryName", KeyType: "RANGE" },  //Sort key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "categoryName", AttributeType: "S" }
        ],
        GlobalSecondaryIndexes: [
            {
                IndexName: "categoryName",
                KeySchema:
                    [
                        {
                            AttributeName: "categoryName",
                            KeyType: "HASH"
                        }
                    ],
                Projection:
                    { ProjectionType: "ALL" },
                ProvisionedThroughput: {
                    ReadCapacityUnits: 100,
                    WriteCapacityUnits: 100
                }
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 100,
            WriteCapacityUnits: 100
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

const addNewCategory = async (categoryDetails) => {

    var params = {
        TableName: tableName,
        Item: categoryDetails
    };
    params.Item.id = randomstring.generate(20);
    params.Item.createdAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
    params.Item.updatedAt = null;

    console.log(params);

    await docClient.put(params).promise();
    return params.Item.id
}

const getCategories = async () => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };

    console.log("Get category By Id...");
    var response = await docClient.scan(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const getCategoryWithId = async (id) => {

    var params = {
        TableName: tableName,
        Key: {
            "id": id,
        }
    };

    var response = await docClient.get(params).promise()
    return response.Item
}

const editCategoryById = async (previousCategory, details) => {

    const updatedAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX') // 2014-10-25 06:46:20-04:00

    var params = {
        TableName: tableName,
        Key: {
            "id": previousCategory.id
        },
        UpdateExpression: `set categoryName = :categoryName, categoryGrades = :categoryGrades, numberOfSubCat = :numberOfSubCat, isEnabled = :isEnabled, updatedAt = :updatedAt`,
        ExpressionAttributeValues: {
            ":categoryName": details.categoryName || previousCategory.categoryName,
            ":categoryGrades": details.categoryGrades || previousCategory.categoryGrades,
            ":numberOfSubCat": details.numberOfSubCat || previousCategory.numberOfSubCat,
            ":isEnabled": details.isEnabled,
            ":updatedAt": updatedAt
        },
        ReturnValues: "UPDATED_NEW"
    };

    var response = await docClient.update(params).promise();
    return response

}

const getCategoriesByName = async (categoryName) => {

    const params = {
        TableName: tableName,
        IndexName: 'categoryName',
        KeyConditionExpression: '#categoryName = :categoryName',
        ExpressionAttributeNames: {
            '#categoryName': 'categoryName'
        },
        ExpressionAttributeValues: {
            ':categoryName': `${categoryName}`
        }
    };

    var response = await docClient.query(params).promise();

    response.Items = response.Items.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));

    return response
}

const deleteCategory = async (id) => {

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
//createCategoryTable()

module.exports = {
    addNewCategory,
    getCategories,
    getCategoryWithId,
    getCategoriesByName,
    editCategoryById,
    deleteCategory,
};

// java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb


//sls config credentials --key AKIAUHGCFUEZLQTCXGWO --secret 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 --provider aws