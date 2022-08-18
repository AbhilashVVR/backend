const {
  addNewFriend,
  getFriends,
  getFriendWithId,
  getActiveFriendRequestSent,
  getActiveFriendRequestRecieve,
  getActiveFriendSent,
  getActiveFriendRecieve,
  getFriendRequestDetails,
  editFriendById,
  deleteFriend,
} = require("../dynamodb/database/friend")

const { getUserById } = require("../dynamodb/database/user")

const GetAllFriendRequest = async (req, res) => {
  try {
    const request = await getFriends();
    res.json(request);
  } catch (err) {
    res.json({ message: err });
  }
};

const GetAllActiveFriendRequestSend = async (req, res) => {
  try {
    const activeRequest = await getActiveFriendRequestSent(req.params.senderId);
    res.json(activeRequest.Items);
  } catch (err) {
    res.json({ message: err });
  }
};

const GetAllActiveFriendRequestRecieve = async (req, res) => {
  try {
    const activeRequest = await getActiveFriendRequestRecieve(req.params.receiverId);
    res.json(activeRequest.Items);
  } catch (err) {
    res.json({ message: err });
  }
};

const SendFriendRequest = async (req, res) => {
  if (req.body.senderId === req.body.receiverId) {
    return res.json({ message: "Receiver and Sender Canot be the same" });
  }
  const sender = await getUserById(req.body.senderId);
  if (!sender) {
    return res.json({ message: "Sender Not Found" });
  }

  const reciever = await getUserById(req.body.receiverId);
  if (!reciever) {
    return res.json({ message: "Receiver Not Found" });
  }

  const getFriendRequest1 = await getFriendRequestDetails(req.body.senderId, req.body.receiverId);
  const getFriendRequest2 = await getFriendRequestDetails(req.body.receiverId, req.body.senderId);

  const getFriendRequest = getFriendRequest1.Items.length ? getFriendRequest1.Items[0] : getFriendRequest2.Items[0];

  if (!getFriendRequest1.Items.length && !getFriendRequest2.Items.length) {
    try {
      const savedRequest = await addNewFriend({
        senderId: req.body.senderId,
        receiverId: req.body.receiverId,
        requestStatus: false
      });
      res.json(savedRequest);
    } catch (err) {
      res.json({ message: err });
    }
  } else if (getFriendRequest.requestStatus === 'true') {
    res.json({ message: "Already Your Friend", status: 400 });
  }

  res.json({ message: "FriendRequest Already Send", status: 400 });
};

const GetFriendStatus = async (req, res) => {
  if (req.body.senderId === req.body.receiverId) {
    return res.json({ message: "Receiver and Sender Canot be the same" });
  }
  const sender = await getUserById(req.body.senderId);
  if (!sender) {
    return res.json({ message: "Sender Not Found" });
  }

  const reciever = await getUserById(req.body.receiverId);
  if (!reciever) {
    return res.json({ message: "Receiver Not Found" });
  }

  const getFriendRequestStatus1 = await getFriendRequestDetails(req.body.senderId, req.body.receiverId);
  const getFriendRequestStatus2 = await getFriendRequestDetails(req.body.receiverId, req.body.senderId);

  const getFriendRequestStatus = getFriendRequestStatus1.Items.length ?
    getFriendRequestStatus1.Items[0] :
    getFriendRequestStatus2.Items.length ? getFriendRequestStatus2.Items[0] : [];

  console.log(getFriendRequestStatus);

  res.json(getFriendRequestStatus);

}

const AcceptFriendRequest = async (req, res) => {
  try {
    const friendRequest = await getFriendWithId(req.params.id);
    if (!friendRequest) {
      return res.json({ message: "Friend Request Not Found", status: 400 });
    } else if (friendRequest.requestStatus === 'true') {
      return res.json({
        message: "Friend Request is already Accepted",
        status: 400,
      });
    }
    await editFriendById(friendRequest, { requestStatus: 'true' });
    const updatedFriendRequest = await getFriendWithId(req.params.id);
    res.json(updatedFriendRequest);

  } catch (ex) {
    res.json({ message: ex });
  }
};

const RejectFriendRequest = async (req, res) => {
  try {
    const friendRequest = await getFriendWithId(req.params.id);
    if (!friendRequest) {
      return res.json({ message: "Friend Request Not Found", status: 400 });
    }
    if (friendRequest.requestStatus === 'true') {
      return res.json({ message: "You are Already Friend", status: 400 });
    }
    const savedRequest = await deleteFriend(req.params.id);
    res.json(savedRequest);
  } catch (ex) {
    res.json({ message: ex });
  }
};

const RemoveFriend = async (req, res) => {
  try {
    const friendRequest = await getFriendWithId(req.params.id);
    if (!friendRequest) {
      return res.json({ message: "Friend Request Not Found", status: 400 });
    }
    if (friendRequest.requestStatus === false) {
      return res.json({ message: "You are Not Friend", status: 400 });
    }
    const savedRequest = await deleteFriend(req.params.id);
    res.json(savedRequest);
  } catch (ex) {
    res.json({ message: ex });
  }
};

const GetFriendList = async (req, res) => {
  try {

    const friendList = await GetFriendListFunction(req.params.userId)

    if (friendList.length) {
      return res.json(friendList);
    } else {
      return res.json({ message: "You Don't have any Friend", status: 400 });
    }
  } catch (err) {
    res.json({ message: err });
  }
};

const GetFriendListFunction = async (userId) => {
  const getFriendRequestStatus1 = await getActiveFriendSent(userId);
  console.log(getFriendRequestStatus1);
  const getFriendRequestStatus2 = await getActiveFriendRecieve(userId);
  console.log(getFriendRequestStatus2);
  const friendList = getFriendRequestStatus1.Items.concat(getFriendRequestStatus2.Items);

  return friendList;
};

module.exports = {
  GetAllFriendRequest,
  GetAllActiveFriendRequestSend,
  GetAllActiveFriendRequestRecieve,
  SendFriendRequest,
  AcceptFriendRequest,
  RejectFriendRequest,
  RemoveFriend,
  GetFriendStatus,
  GetFriendList,
  GetFriendListFunction,
};
