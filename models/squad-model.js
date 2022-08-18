const mongoose = require("mongoose");
const crypto = require("crypto");

const SquadSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  createdBy: {
      type: String,
      required: true
  },
  member: {
      type: Array,
      default: []
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Squad", SquadSchema);
