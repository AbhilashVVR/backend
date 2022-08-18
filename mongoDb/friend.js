const FriendRequest = require("../models/friend-request-model");

const getAllFriendRequest = async (req, res, next) => {
  const friendRequests = await FriendRequest.find({});
  return Promise.resolve(friendRequests);
};

const getAllActiveFriendRequestSend = async (senderId) => {
  const friendRequests = await FriendRequest.find({
    senderId: senderId,
    status: false,
  });
  return Promise.resolve(friendRequests);
};

const getAllActiveFriendRequestSendToSpecificUser = async (senderId, receiverId) => {
  const friendRequests = await FriendRequest.find({
    senderId: senderId,
    receiverId: receiverId,
  });
  return Promise.resolve(friendRequests);
};

const getAllActiveFriendWithSenderId = async (senderId) => {
  const friendRequests = await FriendRequest.find({
    senderId: senderId,
    status: true,
  });
  return Promise.resolve(friendRequests);
};

const getAllActiveFriendRequestRecieve = async (receiverId) => {
  const friendRequests = await FriendRequest.find({
    receiverId: receiverId,
    status: false,
  });
  return Promise.resolve(friendRequests);
};

const getAllActiveFriendWithRecieverId = async (receiverId) => {
  const friendRequests = await FriendRequest.find({
    receiverId: receiverId,
    status: true,
  });
  return Promise.resolve(friendRequests);
};

const getFriendRequestById = async (id) => {
  const friendRequest = await FriendRequest.findById(id);
  return Promise.resolve(friendRequest);
};


const sendFriendRequest = async (friendRequestDetails) => {
  const friendRequest = new FriendRequest(friendRequestDetails);
  return Promise.resolve(await friendRequest.save());
};

const acceptFriendRequest = async (id) => {
  
  var key = {
    status: true,
  };

  const acceptRequests = await FriendRequest.updateOne(
    { _id: id },
    {
      $set: key,
    }
  );

  return Promise.resolve(acceptRequests);
};

const deleteFriendRequest = async (id) => {
  const friendRequest = await FriendRequest.deleteOne({ _id: id });
  return Promise.resolve(friendRequest);
};

module.exports = {
  getAllFriendRequest,
  getAllActiveFriendRequestSend,
  getAllActiveFriendRequestSendToSpecificUser,
  getAllActiveFriendWithSenderId,
  getAllActiveFriendRequestRecieve,
  getAllActiveFriendWithRecieverId,
  getFriendRequestById,
  sendFriendRequest,
  acceptFriendRequest,
  deleteFriendRequest,
};
