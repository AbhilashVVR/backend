require("dotenv").config();
const formidable = require('formidable');
const User = require("../models/user-model");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const randomstring = require("randomstring");

const { sendEmail } = require("../middlewares/mailer");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_APIKEY);

const JWT_SECRET = process.env.JWT;
const { AddNewTransaction } = require("../services/transactions");

const { uploadImage } = require("./s3bucket")

const {
  editAnalyticsById
} = require("../dynamodb/database/analytics")

const {
  addNewUser,
  getUsers,
  getUserByEmail,
  getUserByUniqueId,
  getUserByUserName,
  getUserByEmailToken,
  getUserById,
  updateUserById,
  deleteUser
} = require("../dynamodb/database/user")

const { getGameWithId } = require("../dynamodb/database/game");

const { getSubCategoryWithId } = require("../dynamodb/database/subCategory")

// user registration
const Register = async (req, res, next) => {
  let isRefered = false;
  if (req.body.email) {
    const users = await getUserByEmail(req.body.email);
    const userDetail = users.Items;

    if (userDetail.length) {
      return res.json({ message: "EmailId Already Present" });
    }

    if (req.body.referId) {
      const user1 = await getUserByUniqueId(req.body.referId)
      const userWhoRefer = user1.Items;
      if (!userWhoRefer.length) {
        return res.json({ message: "Sorry, you Entered wrong Refer Id" });
      }
      isRefered = true;
    }
  }

  const userName = req.body.userName;

  if (userName) {
    const user3 = await getUserByUserName(userName);
    const userDetail = user3.Items;
    if (userDetail.length) {

      return res.status(400).send({ message: "Username already registered" });
    }
  }
  const newUser = {
    firstName: req.body.firstName || null,
    lastName: req.body.lastName || null,
    userName: req.body.userName || null,
    email: req.body.email || null,
    uniqueId: randomstring.generate(8),
    grade: req.body.grade || '1',
    school: req.body.school || null,
    board: req.body.board || null,
    mobileNumber: req.body.mobileNumber || null,
    password: req.body.password || null,
    referedBy: req.body.referId || 'no-one',
    isRefered: isRefered,
    pincode: req.body.pincode || '',
    address: req.body.address || '',
    emailToken: crypto.randomBytes(64).toString("hex"),
    userRole: req.body.userRole || 'User',
    isSocialMedia: req.body.isSocialMedia || false,
    deviceToken: req.body.deviceToken || null,
  };

  newUser.isVerified = newUser.isSocialMedia ? true : false;
  newUser.password = req.body.password ?
    bcrypt.hashSync(req.body.password, 8) :
    "";

  const newUserId = await addNewUser(newUser);
  await editAnalyticsById({
    totalUser: true,
    verfiedUser: newUser.isVerified,
    guestUser: newUser.email
  })
  if (req.body.email && !newUser.isVerified && newUserId) {

    const msg = {
      from: "no-reply@langwayz.games",
      to: newUser.email,
      subject: "Lingowayz - Verify your Email",
      text: `
              Hello ${newUser.firstName} ${newUser.lastName}
              please click on the address to verify the account.
              http://${req.headers.host}/api/user/verifyEmail/${newUser.emailToken}
          `,
      html: `
              <h1>Hello ${newUser.firstName} ${newUser.lastName}</h1>
              <p>Thank you for registering on our application.</p>
              <p>Please click on the link bellow to verify your account.</p>
              <a href="http://${req.headers.host}/api/user/verifyEmail/${newUser.emailToken}">Click Here to Verify</a>
          `,
    };
    try {
      await sgMail.send(msg);
      return res
        .status(200)
        .json({
          sucess: "Thanks for registering. Please check your email to verify your account.",
          newUser: newUser,
        });
    } catch (error) {
      return res.json({ "error! something went wrong": error.message });
    }
  }
  return res
    .status(200)
    .json({ sucess: "Thanks for Registering", newUser: newUser });
};

// login
const Signin = async (req, res) => {
  const { userName, password } = req.body;

  // we made a function to verify our user login
  const response = await VerifyUserLogin(userName, password);

  if (response.status === "ok") {
    // storing our JWT web token as a cookie in our browser
    res.cookie("token", token, { maxAge: 12 * 60 * 60 * 1000, httpOnly: true }); // maxAge: 12 hours
    // res.redirect('/');
    res.json({
      message: "you are logged in successfully!",
      token: token,
      user: response.user,
    });
  } else {
    res.json(response);
  }
};

//get all users
const GetProfiles = async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users.Items);
  } catch (err) {
    res.json({ message: err });
  }
}

//get userById
const GetUserById = async (req, res) => {
  try {
    let data = await getUserById(req.params.id);
    res.json(data);
  } catch (err) {
    res.json({ message: err });
  }
};

//Get User By UniqueId
const GetUserByUniqueId = async (req, res) => {
  try {
    const users = await getUserByUniqueId(req.params.uniqueId);
    const userByUniqueId = users.Items;
    res.json(userByUniqueId);
  } catch (err) {
    res.json({ message: err });
  }
}

//Get User By Email
const GetUserByEmail = async (req, res) => {
  try {
    const users = await getUserByEmail(req.params.email);
    const userByEmailId = users.Items;
    res.json(userByEmailId);
  } catch (err) {
    res.json({ message: err });
  }
}

//Get User By userName
const GetUserByUsername = async (req, res) => {
  try {
    const users = await getUserByUserName(req.body.userName);
    const userByUniqueId = users.Items;
    res.json(userByUniqueId);
  } catch (err) {
    res.json({ message: err });
  }
}

// user forgot password sending request
const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.send({
        status: 400,
        error: true,
        message: "Cannot be processed",
      });
    }

    const users = await getUserByEmail(email);
    const user = users.Items;
    if (!user.length) {
      return res.send({
        success: true,
        message: "EmailId Not Found",
      });
    }
    let code = Math.floor(100000 + Math.random() * 900000).toString();
    const newPassword = code ? bcrypt.hashSync(code, 8) : "";

    await updateUserById(user[0], {
      password: newPassword,
      walletCoin: user[0].walletCoin,
      userName: user[0].userName || null,
    });

    const msg = {
      from: "no-reply@langwayz.games",
      to: user[0].email,
      subject: "Lingowayz - Verify your Email",
      text: ` This is your password
                Use this password to login`,
      html: `<p>This is your password : </p> <b>${code}</b>
        <br/>
        <p> Use this password to login</p>
            `,
    };

    await sgMail.send(msg);

    return res.json({ status: 200, message: "new password sent on your Registered email" });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

// user reset password
const ResetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    if (!token || !newPassword || !confirmPassword) {
      return res.status(403).json({
        error: true,
        message: "Couldn't process request. Please provide all mandatory fields",
      });
    }
    const users = await getUsers();
    const user = users.Items.filter(user => (user.resetPasswordToken === req.body.token) && (user.resetPasswordExpires === Date.now()));
    if (!user) {
      return res.send({
        error: true,
        message: "Password reset token is invalid or has expired.",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: true,
        message: "Passwords didn't match",
      });
    }
    const hash = await User.hashPassword(req.body.newPassword);
    user.password = hash;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = "";
    await user.save();
    return res.send({
      success: true,
      message: "Password has been changed",
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

const UpdatePassword = async (req, res) => {
  try {
    const userId = req.body.id;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;

    if (!newPassword || !confirmPassword || !req.body.oldpassword) {
      return res.json({ message: "please provide password" });
    }
    const password = req.body.oldpassword;
    const user = await getUserById(userId);

    if (await bcrypt.compare(password, user.password)) {
      if (newPassword === confirmPassword) {
        await updateUserById(user, {
          password: bcrypt.hashSync(req.body.newPassword, 8),
          walletCoin: user.walletCoin,
          userName: user.userName || null,
        });
        const updateUser = await getUserById(userId);

        return res.status(200).json({
          success: "Your Password is Updated Successfully",
          user: updateUser,
        });
      } else {
        return res.json({
          message: "New password and confirm password didnot match",
        });
      }
    } else {
      return res.json({ message: "Please provide correct Password" });
    }
  } catch (err) {
    res.json({ message: err.message });
  }
}

// user update
const UpdateProfile = async (req, res, next) => {

  if (req.body.referId) {
    const user1 = await getUserByUniqueId(req.body.referId);
    const userWhoRefer = user1.Items;
    if (!userWhoRefer.length) {
      return res.json({ message: "Sorry, you Entered wrong Refer Id" });
    }
  }

  const userId = req.params.id;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const userName = req.body.userName || '';
  const email = req.body.email;
  const mobileNumber = req.body.mobileNumber;
  const school = req.body.school;
  const board = req.body.board;
  const pincode = req.body.pincode;
  const password = req.body.password ? bcrypt.hashSync(req.body.password, 8) : "";
  const grade = req.body.grade;
  const referedBy = req.body.referId;
  const isRefered = req.body.referId ? true : false;

  getUserById(userId)
    .then(async (user) => {
      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }

      console.log("test")

      if (email) {
        const user2 = await getUserByEmail(email);
        const userDetail = user2.Items;
        if (userDetail.length) {

          return res.status(400).send({ message: "Email Id already registered" });
        }
      }

      if (userName) {
        const user3 = await getUserByUserName(userName);
        const userDetail = user3.Items;
        if (userDetail.length) {

          return res.status(400).send({ message: "Username already registered" });
        }
      }

      await updateUserById(user, {
        firstName: firstName,
        lastName: lastName,
        userName: userName,
        email: email,
        mobileNumber: mobileNumber,
        school: school,
        board: board,
        pincode: pincode,
        password: password,
        grade: grade,
        walletCoin: user.walletCoin,
        isRefered: isRefered,
        referedBy: referedBy
      })

      const result = await getUserById(userId);

      if (result.isVerified === false && result.email) {
        const msg = {
          from: "no-reply@langwayz.games",
          to: result.email,
          subject: "Lingowayz - Verify your Email",
          text: `
                  Hello ${result.firstName} ${result.lastName}
                  please click on the address to verify the account.
                  http://${req.headers.host}/api/user/verifyEmail/${result.emailToken}
              `,
          html: `
                  <h1>Hello ${result.firstName} ${result.lastName}</h1>
                  <p>Thank you for registering on our application.</p>
                  <p>Please click on the link bellow to verify your account.</p>
                  <a href="http://${req.headers.host}/api/user/verifyEmail/${result.emailToken}">Click Here to Verify</a>
              `,
        };
        try {
          await sgMail.send(msg);
          return res
            .status(200)
            .json({ message: "user profile updated!", user: result });
        } catch (error) {
          return res.json({ "error! something went wrong": error.message });
        }
      }
      res.status(200).json({ message: "user profile updated!", user: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const VerifyEmailId = async (req, res, next) => {
  try {
    const users = await getUserByEmailToken(req.params.id);
    const user = users.Items;
    console.log(user);
    if (!user) {
      res.status(400).json({ error: "Token is invalid" });
    }
    await updateUserById(user[0], {
      emailToken: user[0].emailToken,
      isVerified: true,
      walletCoin: user[0].walletCoin,
      userName: user[0].userName || null,
    })

    await editAnalyticsById({
      verfiedUser: true
    })

    if (user[0].isRefered) {
      const user1 = await getUserByUniqueId(user[0].referedBy);
      console.log(user1)
      const userWhoRefered = user1.Items;
      const userWhoReferedReqBody = {
        body: {
          transactionId: randomstring.generate(10),
          userId: userWhoRefered[0].id,
          coins: 100,
          reason: `You Refered to ${user[0].uniqueId}`,
          type: "Refer",
        },
      };
      AddNewTransaction(userWhoReferedReqBody);

      const userWhoJionedReqBody = {
        body: {
          transactionId: randomstring.generate(10),
          userId: user[0].id,
          coins: 100,
          reason: `You are Refered By ${userWhoRefered[0].uniqueId}`,
          type: "Refer",
        },
      };
      AddNewTransaction(userWhoJionedReqBody);
    }
    await req.login(user, async (err) => {
      if (err) return next(err);
      res.status(200).json({ success: "welcome", user: user });
      const redirectUrl = req.session.redirectTo || "/";
      delete req.session.redirectTo;
      res.redirect(redirectUrl);
    });
  } catch (error) {
    res.status(500).json({ "error, something went wrong": error.message });
  }
}

const GetLevelByUserIdAndGameId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const getUser = await getUserById(userId);
    if (!getUser) {
      return res.json({ message: "User Not Found" });
    }
    const gameId = req.params.gameId;

    const game = await getGameWithId(gameId);
    if (!game) {
      return res.json({ message: "Game Not Found" });
    }

    const gameDetails = getUser.gameDetails;

    let userLevel = gameDetails.find((detail) => detail.gameId === gameId);

    if (userLevel) {
      return res.status(200).json({ level: userLevel.level });
    }

    const gameDetail = {
      gameId: gameId,
      level: 1,
      powerUps: [],
    };

    gameDetails.push(gameDetail);

    await updateUserById(getUser, {
      gameDetails: gameDetails,
      walletCoin: getUser.walletCoin,
      userName: getUser.userName || null,
    });

    return res.status(200).json({ level: 1 });
  } catch (err) {
    res.json({ message: err.message });
  }
};

const GetExcerciseLevelByUserIdAndSubCategoryId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const getUser = await getUserById(userId);
    if (!getUser) {
      return res.json({ message: "User Not Found" });
    }
    const subCategoryId = req.params.subCategoryId;

    const subCategory = await getSubCategoryWithId(subCategoryId);
    if (!subCategory) {
      return res.json({ message: "SubCategory Not Found" });
    }

    const excerciseDetails = getUser.excerciseDetails;

    let userLevel = excerciseDetails.find((detail) => detail.subCategoryId === subCategoryId);

    if (userLevel) {
      return res.status(200).json({ level: userLevel.level });
    }

    const excerciseDetail = {
      subCategoryId: subCategoryId,
      level: 1,
      powerUps: [],
    };

    excerciseDetails.push(excerciseDetail);

    await updateUserById(getUser, {
      excerciseDetails: excerciseDetails,
      walletCoin: getUser.walletCoin,
      userName: getUser.userName || null,
    });

    return res.status(200).json({ level: 1 });
  } catch (err) {
    res.json({ message: err.message });
  }
};

const GetGameDetailsByUserIdAndGameId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const getUser = await getUserById(userId);
    if (!getUser) {
      return res.json({ message: "User Not Found" });
    }
    const gameId = req.params.gameId;

    const game = await getGameWithId(gameId);
    if (!game) {
      return res.json({ message: "Game Not Found" });
    }

    const gameDetails = getUser.gameDetails;

    let gameDetail = gameDetails.find((detail) => detail.gameId === gameId);

    if (gameDetail) {
      return res.status(200).json({ gameDetail: gameDetail });
    }

    const newGameDetail = {
      gameId: gameId,
      level: 1,
      powerUps: [],
    };

    gameDetails.push(newGameDetail);

    await updateUserById(getUser, {
      gameDetails: gameDetails,
      walletCoin: getUser.walletCoin,
      userName: getUser.userName || null,
    });

    return res.status(200).json({ gameDetail: newGameDetail });
  } catch (err) {
    res.json({ message: err.message });
  }
};

const GetExcerciseDetailsByUserIdAndSubCategoryId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const getUser = await getUserById(userId);
    if (!getUser) {
      return res.json({ message: "User Not Found" });
    }
    const subCategoryId = req.params.subCategoryId;

    const subcategory = await getSubCategoryWithId(subCategoryId);
    if (!subcategory) {
      return res.json({ message: "Subcategory Not Found" });
    }

    const excerciseDetails = getUser.excerciseDetails;

    let excerciseDetail = excerciseDetails.find((detail) => detail.subCategoryId === subCategoryId);

    if (excerciseDetail) {
      return res.status(200).json({ excerciseDetail: excerciseDetail });
    }

    const newExcerciseDetail = {
      subCategoryId: subCategoryId,
      level: 1,
      powerUps: [],
    };

    excerciseDetails.push(newExcerciseDetail);

    await updateUserById(getUser, {
      excerciseDetails: excerciseDetails,
      walletCoin: getUser.walletCoin,
      userName: getUser.userName || null,
    });

    return res.status(200).json({ excerciseDetails: newExcerciseDetail });
  } catch (err) {
    res.json({ message: err.message });
  }
};

const UpdateLevelByUserIdAndGameId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const getUser = await getUserById(userId);
    if (!getUser) {
      return res.json({ message: "User Not Found" });
    }
    const gameId = req.params.gameId;

    const game = await getGameWithId(gameId);
    if (!game) {
      return res.json({ message: "Game Not Found" });
    }
    let userLevel = 0;
    const newGameDetail = [];

    const gameDetails = getUser.gameDetails;
    gameDetails.forEach((detail) => {
      if (detail.gameId === gameId) {
        newGameDetail.push({
          gameId: detail.gameId,
          level: detail.level + 1,
          powerUps: detail.powerUps,
        });

        userLevel = detail.level + 1;
      } else {
        newGameDetail.push({
          gameId: detail.gameId,
          level: detail.level,
          powerUps: detail.powerUps,
        });
      }
    });

    await updateUserById(getUser, {
      gameDetails: newGameDetail,
      walletCoin: getUser.walletCoin,
      userName: getUser.userName || null,
    });

    return res.status(200).json({ level: userLevel });
  } catch (err) {
    res.json({ message: err.message });
  }
};

const UpdateExcerciseLevelByUserIdAndSubCategoryId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const getUser = await getUserById(userId);
    if (!getUser) {
      return res.json({ message: "User Not Found" });
    }
    const subCategoryId = req.params.subCategoryId;

    const subCategory = await getSubCategoryWithId(subCategoryId);
    if (!subCategory) {
      return res.json({ message: "SubCategory Not Found" });
    }
    let userLevel = 0;
    const newExcerciseDetail = [];

    const excerciseDetails = getUser.excerciseDetails;
    excerciseDetails.forEach((detail) => {
      if (detail.subCategoryId === subCategoryId) {
        newExcerciseDetail.push({
          subCategoryId: detail.subCategoryId,
          level: detail.level + 1,
          powerUps: detail.powerUps,
        });

        userLevel = detail.level + 1;
      } else {
        newExcerciseDetail.push({
          subCategoryId: detail.subCategoryId,
          level: detail.level,
          powerUps: detail.powerUps,
        });
      }
    });

    await updateUserById(getUser, {
      excerciseDetails: newExcerciseDetail,
      walletCoin: getUser.walletCoin,
      userName: getUser.userName || null,
    });

    return res.status(200).json({ level: userLevel });
  } catch (err) {
    res.json({ message: err.message });
  }
};

const VerifyUserLogin = async (userName, password) => {
  try {
    console.log(userName)
    console.log(password)
    var user = await getUserByUserName(userName);
    if (!user.Items.length) {
      user = await getUserByUniqueId(userName);
      if (!user.Items.length) {
        user = await getUserByEmail(userName);
        if (!user.Items.length) {
          return { status: "error", error: "user not found" };
        }
      }
    }

    console.log(user);

    if (await bcrypt.compare(password, user.Items[0].password)) {
      // creating a JWT token
      token = jwt.sign({ id: user.Items[0].id, username: user.Items[0].userName, type: "user" },
        JWT_SECRET
      );
      return { status: "ok", data: token, user: user };
    }
    return { status: "error", error: "invalid password" };
  } catch (error) {
    return { status: "error", error: error.message };
  }
};

const DeleteUser = async (req, res) => {
  try {
    const delUser = await deleteUser(req.params.id)
    res.json(delUser);
  } catch (err) {
    res.json({ message: err });
  }
}

const UploadImage = async (req, res) => {
  try {
    //Upload Image to Cloudinary
    var form = await new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      try {
        // ADD S3 Bucket for files
        var urlLink = ''
        if (files) {
          urlLink = await uploadImage(files.file_path);

          const getUser = await getUserById(req.params.id);
          const savedImg = await updateUserById(getUser, {
            userImage: urlLink,
            userName: getUser.userName || null,
            walletCoin: getUser.walletCoin,
          });
          res.json(savedImg);
        }
      } catch (err) {
        res.json({ message: err });
      }
    })

  } catch (error) {
    res.status(400).send(error);
  }
}

module.exports = {
  Register,
  Signin,
  GetProfiles,
  GetUserById,
  GetUserByUniqueId,
  GetUserByEmail,
  GetUserByUsername,
  ForgotPassword,
  ResetPassword,
  UpdatePassword,
  UpdateProfile,
  VerifyEmailId,
  GetLevelByUserIdAndGameId,
  GetExcerciseLevelByUserIdAndSubCategoryId,
  GetGameDetailsByUserIdAndGameId,
  GetExcerciseDetailsByUserIdAndSubCategoryId,
  UpdateLevelByUserIdAndGameId,
  UpdateExcerciseLevelByUserIdAndSubCategoryId,
  DeleteUser,
  UploadImage
};
