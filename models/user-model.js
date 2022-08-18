const mongoose = require("mongoose");
const crypto = require("crypto");

const UserSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  userName: {
    type: String,
  },
  mobileNumber: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
  },
  school: {
    type: String,
  },
  board: {
    type: String,
  },
  grade: {
    type: String,
    default: 1,
  },
  pincode: {
    type: String,
  },
  address: {
    type: String,
  },
  role: {
    type: String,
    enum: "Admin|User".split("|"),
  },
  uniqueId: {
    type: String,
    required: true,
    unique: true,
  },
  walletCoin: {
    type: Number,
    required: true,
    default: 100,
  },
  gameDetails: {
    type: Array,
    default: [],
  },
  isRefered: {
    type: Boolean,
    default: false,
  },
  referedBy: {
    type: String,
    default: "no-one",
  },
  emailToken: String,

  isVerified: { type: Boolean, default: false },

  image: String,

  cloudinary_id: String,

  isSocialMedia: {
    type: Boolean,
    required: true,
    default: false,
  },

  password: { type: String },

  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },

  created: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
