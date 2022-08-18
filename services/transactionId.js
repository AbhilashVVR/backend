const { addNewTransactionId, getTransactionIdWithId, updateTransactionIds } = require("../dynamodb/database/transactionId");
const {
    getUserById,
} = require("../dynamodb/database/user")

const {
    getGameWithId
} = require("../dynamodb/database/game");

const AddNewTransactionId = async (req, res, next) => {
    try {
        if (!req.body.userId) {
            return res.json({ message: "Please Provide UserId" });
        }

        if (!req.body.gameId) {
            return res.json({ message: "Please Provide GameId" });
        }

        const getUser = await getUserById(req.body.userId);

        if (!getUser) {
            return res.json({ message: "User Not found" });
        }

        const getGame = await getGameWithId(req.body.gameId);

        if (!getGame) {
            return res.json({ message: "Game Not found" });
        }

        const getTransactionId = await getTransactionIdWithId(req.body.userId, req.body.gameId);

        console.log(getTransactionId);

        const newTransactionId = GenerateTransactionId(req.body.userId, req.body.gameId);

        if (getTransactionId) {

            getTransactionId.transactionIds.push(newTransactionId)

            const updatedTransactionId = await updateTransactionIds(getTransactionId, getTransactionId.transactionIds);

            res.json({
                status: 200,
                newTransactionId: newTransactionId
            });

        }
        else {

            await addNewTransactionId({
                userId: req.body.userId,
                gameId: req.body.gameId,
                transactionIds: [newTransactionId]
            });

            res.json({
                status: 200,
                newTransactionId: newTransactionId
            });
        }
    } catch (err) {
        res.json({ message: err });
    }
};

const GetTransactionByUserIdandGameId = async (req, res) => {
    try {
        const savedRequest = await getTransactionIdWithId(req.params.userId, req.params.gameId)
        res.json(savedRequest);
    } catch (ex) {
        res.json({ message: ex });
    }
};

const GenerateTransactionId = (userId, gameId) => {
    date = new Date().toISOString();
    return `${userId}-${gameId}-${date}`;
}

module.exports = {
    AddNewTransactionId,
    GetTransactionByUserIdandGameId
};
