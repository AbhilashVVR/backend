const { getWeekNumber } = require("../services/dateFunction");
const { getGameWithId } = require("../dynamodb/database/game");
const { getSquadsByNameAndUserId } = require("../dynamodb/database/squad")
const { getUserById } = require("../dynamodb/database/user")

const {
  addNewLeaderBoard,
  getLeaderBoards,
  getLeaderBoardByUserIdAndGameId,
  getDailyLeaderBoardByGameId,
  getWeeklyLeaderBoardByGameId,
  getLifetimeLeaderBoardByGameId,
  getLeaderBoardById,
  updateLeaderBoardById,
  deleteLeaderBoard
} = require("../dynamodb/database/leaderboard");

const { getSquadByUserId } = require('./squad');

const { GetFriendListFunction } = require("./friend");
const { getDate } = require("date-fns");

const AddNewUserOnBoard = async (req, res) => {
  try {
    const user = await getUserById(req.body.userId);
    if (!user) {
      return res.json({ message: "User Not found" });
    }

    const game = await getGameWithId(req.body.gameId);
    if (!game) {
      return res.json({ message: "Game Not found" });
    }

    const score = await getLeaderBoardByUserIdAndGameId(req.body.userId, req.body.gameId);
    const userPreviousScore = score.Items;

    if (userPreviousScore.length) {
      const newScore =
        parseInt(userPreviousScore[0].score) > parseInt(req.body.score)
          ? userPreviousScore[0].score
          : req.body.score;
      const leaderboard = await updateLeaderBoardById(userPreviousScore[0], {
        userId: req.body.userId,
        userName: user.userName || user.uniqueId,
        email: user.email,
        gameId: req.body.gameId,
        score: newScore,
        scoreDate: new Date().getDate(),
        scoreMonth: new Date().getMonth() + 1,
        scoreYear: new Date().getFullYear(),
        week: getWeekNumber(),
      });
      res.json({
        score: newScore,
        leaderboard,
      });
    } else {
      const leaderboard = await addNewLeaderBoard({
        userId: req.body.userId,
        userName: user.userName || user.uniqueId,
        email: user.email,
        gameId: req.body.gameId,
        score: req.body.score || '0',
        created_at: new Date(),
        scoreDate: new Date().getDate(),
        scoreMonth: new Date().getMonth() + 1,
        scoreYear: new Date().getFullYear(),
        week: getWeekNumber(),
      });
      res.json({
        score: req.body.score,
        leaderboard,
      });
    }
  } catch (err) {
    res.json({
      error: err.message,
    });
  }
};

const GetFullLeaderBoard = async (req, res) => {
  try {
    const leaderboard = await getLeaderBoards();
    leaderboard.Items = leaderboard.Items.sort((a, b) => b.score - a.score);
    res.json({
      leaderboard,
    });
  } catch (err) {
    res.json({
      error: err.message,
    });
  }
};

const GetLeaderBoardByUserId = async (req, res) => {
  try {
    const leaderboard = await getLifetimeLeaderBoardByGameId(req.params.gameId);
    var userId = req.params.userId;
    const newLeaderBoard = [];
    leaderboard.Items = leaderboard.Items.sort((a, b) => b.score - a.score);

    const index = leaderboard.Items.map(i => i.userId).indexOf(userId);

    console.log(index);

    if (leaderboard.Items.length <= 5) {
      leaderboard.Items = newLeaderBoard;
      res.json({
        leaderboard,
      });
    }
    if (index <= 3) {
      newLeaderBoard[0] = leaderboard.Items[0];
      newLeaderBoard[1] = leaderboard.Items[1];
      newLeaderBoard[2] = leaderboard.Items[2];
      newLeaderBoard[3] = leaderboard.Items[3];
      newLeaderBoard[4] = leaderboard.Items[4];

      newLeaderBoard[0].rank = 1
      newLeaderBoard[1].rank = 2
      newLeaderBoard[2].rank = 3
      newLeaderBoard[3].rank = 4
      newLeaderBoard[4].rank = 5
    }
    else if (index === leaderboard.Count - 1) {
      newLeaderBoard[0] = leaderboard.Items[0];
      newLeaderBoard[1] = leaderboard.Items[index - 3];
      newLeaderBoard[2] = leaderboard.Items[index - 2];
      newLeaderBoard[3] = leaderboard.Items[index - 1];
      newLeaderBoard[4] = leaderboard.Items[index];

      newLeaderBoard[0].rank = 1
      newLeaderBoard[1].rank = index - 2
      newLeaderBoard[2].rank = index - 1
      newLeaderBoard[3].rank = index
      newLeaderBoard[4].rank = index + 1

    }
    else {
      newLeaderBoard[0] = leaderboard.Items[0];
      newLeaderBoard[1] = leaderboard.Items[index - 2];
      newLeaderBoard[2] = leaderboard.Items[index - 1];
      newLeaderBoard[3] = leaderboard.Items[index];
      newLeaderBoard[4] = leaderboard.Items[index + 1];

      newLeaderBoard[0].rank = 1
      newLeaderBoard[1].rank = index - 1
      newLeaderBoard[2].rank = index
      newLeaderBoard[3].rank = index + 1
      newLeaderBoard[4].rank = index + 2
    }
    leaderboard.Items = newLeaderBoard;
    res.json({
      leaderboard,
    });
  } catch (err) {
    res.json({
      error: err.message,
    });
  }
};

// get daily leaderboard by userid
const GetDailyLeaderBoardByUserId = async (req, res) => {
  try {
    const dateNew = new Date();
    const gameId = req.params.gameId;
    const dailyNumber = dateNew.getDate();
    const monthNumber = dateNew.getMonth() + 1;
    const yearNumber = dateNew.getFullYear();

    const leaderboard = await getDailyLeaderBoardByGameId(
      gameId,
      dailyNumber,
      monthNumber,
      yearNumber
    );

    var userId = req.params.userId;
    const newLeaderBoard = [];
    leaderboard.Items = leaderboard.Items.sort((a, b) => b.score - a.score);

    const index = leaderboard.Items.map(i => i.userId).indexOf(userId);

    console.log(leaderboard);

    if (leaderboard.Items.length <= 5) {
      leaderboard.Items = newLeaderBoard;
      res.json({
        leaderboard,
      });
    }
    if (index <= 3) {
      newLeaderBoard[0] = leaderboard.Items[0];
      newLeaderBoard[1] = leaderboard.Items[1];
      newLeaderBoard[2] = leaderboard.Items[2];
      newLeaderBoard[3] = leaderboard.Items[3];
      newLeaderBoard[4] = leaderboard.Items[4];

      newLeaderBoard[0].rank = 1
      newLeaderBoard[1].rank = 2
      newLeaderBoard[2].rank = 3
      newLeaderBoard[3].rank = 4
      newLeaderBoard[4].rank = 5
    }
    else if (index === leaderboard.Count - 1) {
      newLeaderBoard[0] = leaderboard.Items[0];
      newLeaderBoard[1] = leaderboard.Items[index - 3];
      newLeaderBoard[2] = leaderboard.Items[index - 2];
      newLeaderBoard[3] = leaderboard.Items[index - 1];
      newLeaderBoard[4] = leaderboard.Items[index];

      newLeaderBoard[0].rank = 1
      newLeaderBoard[1].rank = index - 2
      newLeaderBoard[2].rank = index - 1
      newLeaderBoard[3].rank = index
      newLeaderBoard[4].rank = index + 1

    }
    else {
      newLeaderBoard[0] = leaderboard.Items[0];
      newLeaderBoard[1] = leaderboard.Items[index - 2];
      newLeaderBoard[2] = leaderboard.Items[index - 1];
      newLeaderBoard[3] = leaderboard.Items[index];
      newLeaderBoard[4] = leaderboard.Items[index + 1];

      newLeaderBoard[0].rank = 1
      newLeaderBoard[1].rank = index - 1
      newLeaderBoard[2].rank = index
      newLeaderBoard[3].rank = index + 1
      newLeaderBoard[4].rank = index + 2
    }
    leaderboard.Items = newLeaderBoard;
    res.json({
      leaderboard,
    });
  } catch (err) {
    res.json({
      error: err.message,
    });
  }
};

// weekly tournamnets by userid
const GetWeeklyLeaderBoardByUserId = async (req, res) => {
  try {
    const weekNumber = getWeekNumber();
    const leaderboard = await getWeeklyLeaderBoardByGameId(req.body.gameId, weekNumber);
    var userId = req.params.userId;
    const newLeaderBoard = [];
    leaderboard.Items = leaderboard.Items.sort((a, b) => b.score - a.score);

    const index = leaderboard.Items.map(i => i.userId).indexOf(userId);

    console.log(index);

    if (leaderboard.Items.length <= 5) {
      leaderboard.Items = newLeaderBoard;
      res.json({
        leaderboard,
      });
    }
    if (index <= 3) {
      newLeaderBoard[0] = leaderboard.Items[0];
      newLeaderBoard[1] = leaderboard.Items[1];
      newLeaderBoard[2] = leaderboard.Items[2];
      newLeaderBoard[3] = leaderboard.Items[3];
      newLeaderBoard[4] = leaderboard.Items[4];

      newLeaderBoard[0].rank = 1
      newLeaderBoard[1].rank = 2
      newLeaderBoard[2].rank = 3
      newLeaderBoard[3].rank = 4
      newLeaderBoard[4].rank = 5
    }
    else if (index === leaderboard.Count - 1) {
      newLeaderBoard[0] = leaderboard.Items[0];
      newLeaderBoard[1] = leaderboard.Items[index - 3];
      newLeaderBoard[2] = leaderboard.Items[index - 2];
      newLeaderBoard[3] = leaderboard.Items[index - 1];
      newLeaderBoard[4] = leaderboard.Items[index];

      newLeaderBoard[0].rank = 1
      newLeaderBoard[1].rank = index - 2
      newLeaderBoard[2].rank = index - 1
      newLeaderBoard[3].rank = index
      newLeaderBoard[4].rank = index + 1

    }
    else {
      newLeaderBoard[0] = leaderboard.Items[0];
      newLeaderBoard[1] = leaderboard.Items[index - 2];
      newLeaderBoard[2] = leaderboard.Items[index - 1];
      newLeaderBoard[3] = leaderboard.Items[index];
      newLeaderBoard[4] = leaderboard.Items[index + 1];

      newLeaderBoard[0].rank = 1
      newLeaderBoard[1].rank = index - 1
      newLeaderBoard[2].rank = index
      newLeaderBoard[3].rank = index + 1
      newLeaderBoard[4].rank = index + 2
    }
    leaderboard.Items = newLeaderBoard;
    res.json({
      leaderboard,
    });
  } catch (err) {
    res.json({
      error: err.message,
    });
  }
};


const GetLeaderBoardById = async (req, res) => {
  try {
    const leaderboard = await getLeaderBoardById(req.params.id);
    res.json({
      leaderboard,
    });
  } catch (err) {
    res.json({
      error: err.message,
    });
  }
};

const GetDailyLeaderBoardByGameId = async (req, res) => {
  const dateNew = new Date();
  try {
    const dailyNumber = dateNew.getDate();
    const monthNumber = dateNew.getMonth() + 1;
    const yearNumber = dateNew.getFullYear();
    const leaderboard = await getDailyLeaderBoardByGameId(
      req.params.gameId,
      dailyNumber,
      monthNumber,
      yearNumber
    );

    leaderboard.Items = leaderboard.Items.sort((a, b) => b.score - a.score);
    res.json({
      leaderboard: leaderboard.Items
    });
  } catch (err) {
    res.json({
      error: err.message,
    });
  }
};

const GetDailyLeaderBoardByGameIdAndUserId = async (req, res) => {
  const dateNew = new Date();
  try {
    var leaderboards = [];
    var leaderboard;
    var userIds = [req.params.userId];
    var findUser;
    const gameId = req.params.gameId;
    const dailyNumber = dateNew.getDate();
    const monthNumber = dateNew.getMonth() + 1;
    const yearNumber = dateNew.getFullYear();

    const score = await getDailyLeaderBoardByGameId(
      gameId,
      dailyNumber,
      monthNumber,
      yearNumber
    );

    leaderboard = score.Items.filter(score => (
      score.userId === req.params.userId));
    if (leaderboard.length) {
      leaderboards.push(leaderboard[0]);
    }

    const friendList = await GetFriendListFunction(req.params.userId);

    if (friendList.length) {
      friendList.forEach(async (friend) => {
        findUser = userIds.find((user) => user === friend.senderId);
        if (!findUser) {
          userIds.push(friend.senderId);
          leaderboard = score.Items.filter(score => (
            score.userId === friend.senderId));
          if (leaderboard.length) {
            leaderboards.push(leaderboard[0]);
          }
        }
        findUser = userIds.find((user) => user === friend.receiverId);
        if (!findUser) {
          userIds.push(friend.receiverId);
          leaderboard = score.Items.filter(score => (
            score.userId === friend.receiverId));

          console.log(leaderboard);

          if (leaderboard.length) {
            leaderboards.push(leaderboard[0]);
          }
        }
      });
      leaderboards = leaderboards.sort((a, b) => b.score - a.score);
    }
    res.json({
      leaderboards,
    });

    //
  } catch (err) {
    res.json({
      error: err.message,
    });
  }
};

const GetDailyLeaderBoardByGameIdAndUserIdAndSquadName = async (req, res) => {
  const dateNew = new Date();
  try {
    var leaderboards = [];
    var leaderboard;
    const gameId = req.params.gameId;
    const dailyNumber = dateNew.getDate();
    const monthNumber = dateNew.getMonth() + 1;
    const yearNumber = dateNew.getFullYear();
    const squads = await getSquadByUserId(req.params.userId);

    const getSquad = squads.find(
      (element) => element.name === req.params.squadName
    );

    const score = await getDailyLeaderBoardByGameId(
      gameId,
      dailyNumber,
      monthNumber,
      yearNumber
    );

    if (!getSquad) {
      return res.json({ message: "Squad Not Found" });
    }
    getSquad.squadMember.forEach(async (member) => {
      leaderboard = score.Items.filter(score => score.userId === member);
      if (leaderboard.length) {
        leaderboards.push(leaderboard[0]);
      }
    });

    leaderboards = leaderboards.sort((a, b) => b.score - a.score);

    res.json({
      leaderboards,
    });

    //
  } catch (err) {
    res.json({
      error: err.message,
    });
  }
};

const GetWeeklyLeaderBoardByGameId = async (req, res) => {
  try {
    const weekNumber = getWeekNumber();
    const score = await getWeeklyLeaderBoardByGameId(req.params.gameId, weekNumber);
    var leaderboard = score.Items;
    leaderboard = leaderboard.sort((a, b) => b.score - a.score);
    res.json({
      leaderboard,
    });
  } catch (err) {
    res.json({
      error: err.message,
    });
  }
};

const GetWeeklyLeaderBoardByGameIdAndUserId = async (req, res) => {
  try {
    var leaderboards = [];
    var leaderboard;
    var userIds = [req.params.userId];
    var findUser;
    const gameId = req.params.gameId;
    const weekNumber = getWeekNumber();

    const score = await getWeeklyLeaderBoardByGameId(gameId, weekNumber)
    leaderboard = score.Items.filter(score => (
      score.userId === req.params.userId));

    if (leaderboard.length) {
      leaderboards.push(leaderboard[0]);
    }

    const friendList = await GetFriendListFunction(req.params.userId);
    if (friendList.length) {
      friendList.forEach(async (friend) => {
        findUser = userIds.find((user) => user === friend.senderId);
        if (!findUser) {
          userIds.push(friend.senderId);
          leaderboard = score.Items.filter(score => (
            score.gameId === friend.senderId));
          if (leaderboard.length) {
            leaderboards.push(leaderboard[0]);
          }
        }
        findUser = userIds.find((user) => user === friend.receiverId);
        if (!findUser) {
          userIds.push(friend.receiverId);
          leaderboard = score.Items.filter(score => (
            score.gameId === friend.receiverId));
          if (leaderboard.length) {
            leaderboards.push(leaderboard[0]);
          }
        }
      });

      leaderboards = leaderboards.sort((a, b) => b.score - a.score);
    }
    res.json({
      leaderboards,
    });

    //
  } catch (err) {
    res.json({
      error: err.message,
    });
  }
};

const GetWeeklyLeaderBoardByGameIdAndUserIdAndSquadName = async (req, res) => {
  try {
    const weekNumber = getWeekNumber();
    var leaderboards = [];
    var leaderboard;
    const gameId = req.params.gameId;

    const squads = await getSquadByUserId(req.params.userId);

    const getSquad = squads.find(
      (element) => element.name === req.params.squadName
    );

    if (!getSquad) {
      return res.json({ message: "Squad Not Found" });
    }

    const score = await getWeeklyLeaderBoardByGameId(gameId, weekNumber);

    getSquad.squadMember.forEach(async (member) => {
      leaderboard = score.Items.filter(score => (
        score.userId === member));
      if (leaderboard.length) {
        leaderboards.push(leaderboard[0]);
      }
    });

    leaderboards = leaderboards.sort((a, b) => b.score - a.score);

    res.json({
      leaderboards,
    });

    //
  } catch (err) {
    res.json({
      error: err.message,
    });
  }
};

const GetLifeTimeLeaderBoardByGameId = async (req, res) => {
  try {
    const score = await getLifetimeLeaderBoardByGameId(req.params.gameId);
    score.Items = score.Items.sort((a, b) => b.score - a.score);
    res.json({
      leaderboard: score.Items,
    });
  } catch (err) {
    res.json({
      error: err.message,
    });
  }
};

const GetLifeTimeLeaderBoardByGameIdAndUserId = async (req, res) => {
  try {
    var leaderboards = [];
    var leaderboard;
    var userIds = [req.params.userId];
    var findUser;
    const gameId = req.params.gameId;


    const score = await getLifetimeLeaderBoardByGameId(gameId)
    leaderboard = score.Items.filter(score => (
      score.userId === req.params.userId));
    if (leaderboard.length) {
      leaderboards.push(leaderboard[0]);
    }

    const friendList = await GetFriendListFunction(req.params.userId);
    if (friendList.length) {
      friendList.forEach(async (friend) => {
        findUser = userIds.find((user) => user === friend.senderId);
        if (!findUser) {
          userIds.push(friend.senderId);
          leaderboard = score.Items.filter(score => (
            score.gameId === gameId) &&
            (score.userId === friend.senderId));
          if (leaderboard.length) {
            leaderboards.push(leaderboard[0]);
          }
        }
        findUser = userIds.find((user) => user === friend.receiverId);
        if (!findUser) {
          userIds.push(friend.receiverId);
          leaderboard = score.Items.filter(score => (
            score.gameId === gameId) &&
            (score.userId === friend.receiverId));
          if (leaderboard.length) {
            leaderboards.push(leaderboard[0]);
          }
        }
      });

      leaderboards = leaderboards.sort((a, b) => b.score - a.score);
    }

    res.json({
      leaderboards
    });

    //
  } catch (err) {
    res.json({
      error: err.message,
    });
  }
};

const GetLifeTimeLeaderBoardByGameIdAndUserIdAndSquadName = async (
  req,
  res
) => {
  try {
    var leaderboards = [];
    var leaderboard;
    const gameId = req.params.gameId;

    const squads = await getSquadByUserId(req.params.userId);

    const getSquad = squads.find(
      (element) => element.name === req.params.squadName
    );

    if (!getSquad) {
      return res.json({ message: "Squad Not Found" });
    }

    const score = await getLifetimeLeaderBoardByGameId(gameId)

    getSquad.squadMember.forEach(async (member) => {
      leaderboard = score.Items.filter(score => (
        score.userId === member));
      if (leaderboard.length) {
        leaderboards.push(leaderboard[0]);
      }
    });

    leaderboards = leaderboards.sort((a, b) => b.score - a.score);

    res.json(
      { leaderboards });

    //
  } catch (err) {
    res.json({
      error: err.message,
    });
  }
};
module.exports = {
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
};
