const mongoose = require("mongoose");
const crypto = require("crypto");

const QueryDataSchema = mongoose.Schema({
  userUniqueId: {
    type: String,
    required: true,
    trim: true,
  },
  topic: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

module.exports = mongoose.model("QueryData", QueryDataSchema);
