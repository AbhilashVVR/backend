const Leaderboard = require("../models/leaderboard-model");

const AddNewUserOnLeaderBoard = async (userDetails) => {
  const scoreAddedOnLeaderBoard = new Leaderboard(userDetails);
  return Promise.resolve(await scoreAddedOnLeaderBoard.save());
};

const getUserScoreWithGameId = async (userId, gameId) => {
  const allScoreByUserIdAndGameId = await Leaderboard.find({
    userId: userId,
    gameId: gameId,
  }).exec();

  return Promise.resolve(allScoreByUserIdAndGameId);
};

const getLeaderBoardById = async (req, res, next) => {
  const leaderboard = await Leaderboard.findOne({
    _id: req,
  });
  return Promise.resolve(leaderboard);
};

const getFullLeaderBoard = async () => {
  const completeLeaderBoard = await Leaderboard.find({}).exec();

  return Promise.resolve(completeLeaderBoard);
};

const getDailyLeaderBoardByGameId = async (
  gameId,
  dailyNumber,
  monthNumber,
  yearNumber
) => {
  const completeLeaderBoard = await Leaderboard.find({
    gameId: gameId,
    date: dailyNumber,
    month: monthNumber,
    year: yearNumber,
  }).exec();

  return Promise.resolve(completeLeaderBoard);
};

const getDailyLeaderBoardByGameIdAndUserId = async (
  gameId,
  dailyNumber,
  monthNumber,
  yearNumber,
  userId
) => {
  const completeLeaderBoard = await Leaderboard.find({
    gameId: gameId,
    date: dailyNumber,
    month: monthNumber,
    year: yearNumber,
    userId: userId
  }).exec();

  return Promise.resolve(completeLeaderBoard);
};

const getWeeklyLeaderBoardByGameId = async (gameId, weekNumber) => {
  const completeLeaderBoard = await Leaderboard.find({
    gameId: gameId,
    week: weekNumber,
  }).exec();

  return Promise.resolve(completeLeaderBoard);
};

const getWeeklyLeaderBoardByGameIdAndUserId = async (gameId, weekNumber, userId) => {
  const completeLeaderBoard = await Leaderboard.find({
    gameId: gameId,
    week: weekNumber,
    userId: userId
  }).exec();

  return Promise.resolve(completeLeaderBoard);
};

const getLifeTimeLeaderBoardByGameId = async (gameId) => {
  const completeLeaderBoard = await Leaderboard.find({
    gameId: gameId,
  }).sort({"score": -1}).exec();

  return Promise.resolve(completeLeaderBoard);
};

const getLifeTimeLeaderBoardByGameIdAndUserId = async (gameId, userId) => {
  const completeLeaderBoard = await Leaderboard.find({
    gameId: gameId,
    userId: userId
  }).exec();

  return Promise.resolve(completeLeaderBoard);
};

const updateUserScore = async (id, details) => {
  var key = {};
  if (details.userName) {
    key.userName = details.userName;
  }
  if (details.score) {
    key.score = details.score;
  }
  if (details.date) {
    key.date = details.date;
  }
  if (details.month) {
    key.month = details.month;
  }
  if (details.year) {
    key.year = details.year;
  }
  if (details.week) {
    key.week = details.week;
  }

  await Leaderboard.updateOne(
    { _id: id },
    {
      $set: key,
    }
  );
};

module.exports = {
  AddNewUserOnLeaderBoard,
  getUserScoreWithGameId,
  getLeaderBoardById,
  getFullLeaderBoard,
  getDailyLeaderBoardByGameId,
  getDailyLeaderBoardByGameIdAndUserId,
  getWeeklyLeaderBoardByGameId,
  getWeeklyLeaderBoardByGameIdAndUserId,
  getLifeTimeLeaderBoardByGameId,
  getLifeTimeLeaderBoardByGameIdAndUserId,
  updateUserScore,
};
