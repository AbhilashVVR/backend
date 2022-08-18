
const {
    getAnalytics
} = require("../dynamodb/database/analytics")

const TotalAnalytics = async (req, res) => {
    try {

        const analytics = await getAnalytics();
        console.log(analytics);
        res.json(analytics);

    } catch (err) {
        res.json({ message: err });
    }
}

module.exports = {
    TotalAnalytics
}