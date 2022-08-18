const mongoose = require("mongoose");
const crypto = require("crypto");

const BannerSchema = mongoose.Schema({
  name: {
    type: String,
  },
  banner: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Active", "InActive"],
    required: true,
  },
  enable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Banner", BannerSchema);
