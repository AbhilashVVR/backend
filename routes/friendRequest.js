const express = require("express");
const router = express.Router();
const {
  GetAllFriendRequest,
  GetAllActiveFriendRequestSend,
  GetAllActiveFriendRequestRecieve,
  SendFriendRequest,
  AcceptFriendRequest,
  RejectFriendRequest,
  RemoveFriend,
  GetFriendList,
  GetFriendStatus
} = require("../services/friend");

//Get All FriendRequest
router.get("/getFriendRequest", GetAllFriendRequest);

//Get All friendRequest Send by User
router.get("/friendRequestSend/:senderId", GetAllActiveFriendRequestSend);

//Get All friendRequest Recieve by User
router.get(
  "/friendRequestRecieve/:receiverId",
  GetAllActiveFriendRequestRecieve
);

//Get All friendRequest Status by User
router.post("/getFriendStatus", GetFriendStatus);

//Submit Friend Request
router.post("/createRequest", SendFriendRequest);

// Accept Friend Request
router.put("/acceptRequest/:id", AcceptFriendRequest);

// Reject Friend Request
router.put("/rejectRequest/:id", RejectFriendRequest);

// Remove Friend
router.put("/removeFriend/:id", RemoveFriend);

// Get FriedList
router.get("/friendList/:userId", GetFriendList);

module.exports = router;
