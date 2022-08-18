const router = require("express").Router();
const {
  AddNewUserOnBoard,
  GetFullLeaderBoard,
  GetLeaderBoardByUserId,
  GetDailyLeaderBoardByUserId,
  GetWeeklyLeaderBoardByUserId,
  GetLeaderBoardById,
  GetDailyLeaderBoardByGameId,
  GetDailyLeaderBoardByGameIdAndUserId,
  GetDailyLeaderBoardByGameIdAndUserIdAndSquadName,
  GetWeeklyLeaderBoardByGameId,
  GetWeeklyLeaderBoardByGameIdAndUserId,
  GetWeeklyLeaderBoardByGameIdAndUserIdAndSquadName,
  GetLifeTimeLeaderBoardByGameId,
  GetLifeTimeLeaderBoardByGameIdAndUserId,
  GetLifeTimeLeaderBoardByGameIdAndUserIdAndSquadName,
} = require("../services/leaderboard");

router.post("/register", AddNewUserOnBoard);

router.get("/", GetFullLeaderBoard);

// router.get("/get/:userId", GetLeaderBoardByUserId);

router.get("/get/lifeTime/:gameId/:userId", GetLeaderBoardByUserId);

router.get("/get/daily/:gameId/:userId", GetDailyLeaderBoardByUserId);

router.get("/get/weekly/:gameId/:userId", GetWeeklyLeaderBoardByUserId);

// router.get("/:id", GetLeaderBoardById);

//get Daily Details
router.get("/daily/:gameId", GetDailyLeaderBoardByGameId);

//get Daily Details by Friendlist
router.get(
  "/dailyByFriendList/:gameId/:userId",
  GetDailyLeaderBoardByGameIdAndUserId
);

//get Daily Details by Squad Name
router.get(
  "/dailyBySquadName/:gameId/:userId/:squadName",
  GetDailyLeaderBoardByGameIdAndUserIdAndSquadName
);

// get weekly details
router.get("/weekly/:gameId", GetWeeklyLeaderBoardByGameId);

//get Weekly Details By Friendlist
router.get(
  "/weeklyByFriendList/:gameId/:userId",
  GetWeeklyLeaderBoardByGameIdAndUserId
);

//get Weekly Details By Squad Name
router.get(
  "/weeklyBySquadName/:gameId/:userId/:squadName",
  GetWeeklyLeaderBoardByGameIdAndUserIdAndSquadName
);
//get Lifetime Details By Friendlist
router.get("/lifetime/:gameId", GetLifeTimeLeaderBoardByGameId);

//get Lifetime Details By Friendlist
router.get(
  "/lifeTimeByFriendList/:gameId/:userId",
  GetLifeTimeLeaderBoardByGameIdAndUserId
);

//get Lifetime Details By Squad Name
router.get(
  "/lifeTimeBySquadName/:gameId/:userId/:squadName",
  GetLifeTimeLeaderBoardByGameIdAndUserIdAndSquadName
);

module.exports = router;
