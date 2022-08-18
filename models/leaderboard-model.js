const mongoose = require("mongoose");

const leaderboardSchema = mongoose.Schema({
  userId: {
    type: String,
    require: true,
  },
  userName: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  gameId: {
    type: String,
    require: true,
  },
  score: {
    type: Number,
    require: true,
    default: 0,
  },
  date: {
    type: Number,
    require: true,
  },
  month: {
    type: Number,
    require: true,
  },
  year: {
    type: Number,
    require: true,
  },
  week: {
    type: Number,
    require: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Leaderboard", leaderboardSchema);
