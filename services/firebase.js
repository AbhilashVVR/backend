const axios = require("axios");
const {
  getUsers,
} = require("../dynamodb/database/user")
const { addNewNotification, getNotifications } = require("../dynamodb/database/notification")

const SendNotification = async (req, res) => {
  const title = req.body.title;
  const notification = req.body.notification;

  if (!title) {
    return res.json({ message: "Title Not Found" });
  }

  if (!notification) {
    return res.json({ message: "Notification Not Found" });
  }

  await addNewNotification({
    title: req.body.title,
    notification: req.body.notification
  });

  const users = await getUsers();

  try {
    var header = {
      "Content-Type": "application/json",
      "Authorization": "key=AAAA0GSzFPk:APA91bFYtb7fOJofA1JXfV1iYeZtodseVuORSJd48JGcX0TzJfx8vEJwFiLVgAqLaC6uD4skbVi7l73K4fPjGPPhHU70XX-u99mO-ssDbJUVp3UZ6cDq7Rk8RnPa6QNg78vi9LhbCGQO"
    };

    users.Items.forEach(async (user, index) => {
      console.log(index)
      if (user.deviceToken) {

        console.log('test');
        const body = {
          "to": user.deviceToken,
          "notification": {
            "title": title,
            "body": notification,
            "mutable_content": true,
            "sound": "Tri-tone"
          },

          // "data": {
          //   "url": "<url of media image>",
          //   "dl": "<deeplink action on tap of notification>"
          // }
        };

        const url = "https://fcm.googleapis.com/fcm/send";
        await axios.post(url, body, {
          headers: header,
        });
      }
    });
    res.json({ message: "Notification Send" });
  } catch (err) {
    res.json({ message: err });
  }
};

const GetNotifications = async (req, res) => {
  try {
    let data = await getNotifications();
    res.json(data.Items);
  } catch (err) {
    res.json({ message: err });
  }
};

module.exports = { SendNotification, GetNotifications };