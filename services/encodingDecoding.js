const { sign, verify } = require('jsonwebtoken');

// For demonstration only. We should not store this key in the codebase.
const internalKey = "64647764289b31a6cd8916f4b";

const encodePaginationCursor = (lastEvaluatedKey) => {

    if (!lastEvaluatedKey) return null;

    return Buffer.from(sign(lastEvaluatedKey, internalKey)).toString("base64");
};

const decodePaginationCursor = (cursor) => {
    if (!cursor) return null;

    const decodedCursor = Buffer.from(cursor, "base64").toString();
    const decoded = verify(decodedCursor, internalKey);
    const toReturn = {
        id: decoded.id ? decoded.id: undefined,
        gameId: decoded.gameId ? decoded.gameId : undefined,
        level: decoded.level  ? decoded.level : undefined,
        gameCategoryId: decoded.gameCategoryId ?  decoded.gameCategoryId : undefined
    };

    return toReturn;
};

module.exports = {
    encodePaginationCursor,
    decodePaginationCursor
};