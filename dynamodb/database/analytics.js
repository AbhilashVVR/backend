const { dynamodb, docClient } = require('../../config');
const randomstring = require("randomstring");
const tableName = 'analytics';
const { format, startOfDay } = require("date-fns");
const { utcToZonedTime, formatInTimeZone } = require("date-fns-tz");
const DATE_FORMAT = 'yyyy-MM-dd';

function createAnalyticsTable() {

    var params = {
        TableName: tableName,
        KeySchema: [
            { AttributeName: "id", KeyType: "HASH" },  //Partition key
            //{ AttributeName: "categoryName", KeyType: "RANGE" },  //Sort key
        ],
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            // { AttributeName: "categoryName", AttributeType: "S" },
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

const addAnalytics = async () => {

    var params = {
        TableName: tableName,
        Item: {}
    };
    params.Item.id = randomstring.generate(20);
    params.Item.createdAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
    params.Item.updatedAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
    params.Item.lastPaymentAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX');
    params.Item.totalUser = 0;
    params.Item.verfiedUser = 0;
    params.Item.guestUser = 0;
    params.Item.newUser = 0;
    params.Item.totalPayment = 0;
    params.Item.monthlyPayment = 0;
    params.Item.dailyPayment = 0;

    await docClient.put(params).promise();
    return params.Item.id
}

const editAnalyticsById = async (details) => {

    const analytics = await getAnalytics();
    const previousAnalytics = analytics.Items[0];

    console.log(previousAnalytics);

    const startDate = createStartDate();
    const lastUpdate = format(new Date(previousAnalytics.updatedAt), DATE_FORMAT);
    const lastPayment = format(new Date(previousAnalytics.lastPaymentAt), DATE_FORMAT);
    const updatedAt = formatInTimeZone(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ssXXX') // 2014-10-25 06:46:20-04:00


    const totalUser = details.totalUser ? previousAnalytics.totalUser + 1 : previousAnalytics.totalUser;
    const verfiedUser = details.verfiedUser ? previousAnalytics.verfiedUser + 1 : previousAnalytics.verfiedUser;
    const guestUser = details.guestUser ? previousAnalytics.guestUser : previousAnalytics.guestUser + 1;
    const newUser = startDate === lastUpdate ? previousAnalytics.newUser + 1 : 1;
    const totalPayment = details.totalPayment ? previousAnalytics.totalPayment + details.totalPayment : previousAnalytics.totalPayment;
    const lastPaymentAt = details.totalPayment ? updatedAt : previousAnalytics.lastPaymentAt;
    const dailyPayment =
        startDate === lastPayment ?
            details.totalPayment ?
                previousAnalytics.dailyPayment + details.totalPayment :
                previousAnalytics.dailyPayment :
            details.totalPayment ?
                details.totalPayment :
                0;
    console.log(dailyPayment);
    var params = {
        TableName: tableName,
        Key: {
            "id": previousAnalytics.id
        },
        UpdateExpression: `set
            totalUser = :totalUser,
            verfiedUser = :verfiedUser,
            guestUser = :guestUser,
            newUser = :newUser,
            totalPayment = :totalPayment,
            lastPaymentAt = :lastPaymentAt,
            dailyPayment = :dailyPayment,
            updatedAt = :updatedAt`,
        ExpressionAttributeValues: {
            ":totalUser": totalUser,
            ":verfiedUser": verfiedUser,
            ":guestUser": guestUser,
            ":newUser": newUser,
            ":totalPayment": totalPayment,
            ":dailyPayment": dailyPayment,
            ":lastPaymentAt": lastPaymentAt,
            ":updatedAt": updatedAt
        },
        ReturnValues: "UPDATED_NEW"
    };
    var response = await docClient.update(params).promise();
    console.log("res", response);
    return response.Attributes

}

const getAnalytics = async () => {

    var params = {
        TableName: tableName,
        Select: "ALL_ATTRIBUTES"
    };

    var response = await docClient.scan(params).promise();
    console.log("ANALYTICS",response);
    return response
}

const deleteTable = async (id) => {

    var params = {
        TableName: tableName,
    };
    const response = await dynamodb.deleteTable(params).promise();

    return response

}

const createStartDate = () => {
    const dateObj = startOfDay(new Date());
    const UTCDate = utcToZonedTime(dateObj.getTime(), 'Asia/Kolkata');
    return format(UTCDate, DATE_FORMAT);
};

//deleteTable()
//createAnalyticsTable()
//addAnalytics()
//editAnalyticsById({totalUser: 24})

module.exports = {
    getAnalytics,
    editAnalyticsById
};

// java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
