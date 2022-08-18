require("dotenv").config();

const User = require("../models/user-model");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const randomstring = require("randomstring");

const { sendEmail } = require("../middlewares/mailer");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_APIKEY);

const JWT_SECRET = process.env.JWT;
const { getUserByUserId, getUserByEmail } = require("../mongoDb/user")

// registration
exports.signup = async (req, res, next) => {
    let isRefered = false;
    if (req.body.email) {
        const userDetail = await User.find({ email: req.body.email });

        if (userDetail.length) {
            return res.json({ message: "EmailId Already Present" });
        }

        if (req.body.referId) {
            const userWhoRefer = await User.find({ uniqueId: req.body.referId });
            if (!userWhoRefer.length) {
                return res.json({ message: "Sorry, you Entered wrong Refer Id" });
            }
            isRefered = true;
        }
    }
    const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        email: req.body.email,
        uniqueId: randomstring.generate(8),
        grade: req.body.grade,
        school: req.body.school,
        board: req.body.board,
        mobileNumber: req.body.mobileNumber,
        password: req.body.password,
        referedBy: req.body.referId,
        isRefered: isRefered,
        emailToken: crypto.randomBytes(64).toString("hex"),
        role: req.body.role,
        isSocialMedia: req.body.isSocialMedia,
    });

    newUser.isVerified = newUser.isSocialMedia ? true : false;
    newUser.password = req.body.password ?
        bcrypt.hashSync(req.body.password, 8) :
        "";

    if (req.body.email && !newUser.isVerified) {
        newUser.save(async (err, user) => {
            if (err) {
                return res.json({ error: err.message });
                // return res.redirect("/register")
            }
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
        });
    }
    await newUser.save();
    return res
        .status(200)
        .json({ sucess: "Thanks for Registering", newUser: newUser });
};

const verifyUserLogin = async (userName, password) => {
    try {
        var user = await User.findOne({ userName }).lean();
        if (!user) {
            user = await User.findOne({ uniqueId: userName }).lean();
            if (!user) {
                user = await User.findOne({ email: userName }).lean();
                if (!user) {
                    return { status: "error", error: "user not found" };
                }
            }
        }
        if (await bcrypt.compare(password, user.password)) {
            // creating a JWT token
            token = jwt.sign({ id: user._id, username: user.userName, type: "user" },
                JWT_SECRET
            );
            return { status: "ok", data: token, user: user };
        }
        return { status: "error", error: "invalid password" };
    } catch (error) {
        return res.json({ error: error.message });
    }
};

// login
exports.signin = async (req, res) => {
    const { userName, password } = req.body;

    // we made a function to verify our user login
    const response = await verifyUserLogin(userName, password);

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

// user update
exports.updateProfile = async (req, res, next) => {
    const userId = req.params._id;

    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const userName = req.body.userName;
    const email = req.body.email;
    const mobileNumber = req.body.mobileNumber;
    const school = req.body.school;
    const board = req.body.board;
    const pincode = req.body.pincode;
    const grade = req.body.grade;

    getUserByUserId(userId)
        .then(async (user) => {
            if (!user) {
                const error = new Error("User not found.");
                error.statusCode = 404;
                throw error;
            }

            if (email) {
                const userDetail = await getUserByEmail(email);
                if (userDetail.length) {

                    res.status(400).send({ message: "Email Id already registered" });
                }
            }

            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.userName = userName || user.userName;
            user.email = user.isVerified ? user.email : email;
            user.mobileNumber = mobileNumber || user.mobileNumber;
            user.isVerified = user.isVerified;
            user.school = school || user.school;
            user.board = board || user.board;
            user.pincode = pincode || user.pincode;
            user.grade = grade || user.grade;

            return user.save();
        })
        .then(async (result) => {
            if (result.isVerified === false) {
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

exports.getProfiles = (req, res, next) => {
    User.find({}, (err, users) => {
        if (err) return res.status(400).send(err);
        res.status(200).send(users);
    });
};

// user forgot password sending request
exports.ForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.send({
                status: 400,
                error: true,
                message: "Cannot be processed",
            });
        }
        const user = await User.findOne({
            email: email,
        });
        if (!user) {
            return res.send({
                success: true,
                message: "If that email address is in our database, we will send you an email to reset your password",
            });
        }
        let code = Math.floor(100000 + Math.random() * 900000);
        let response = await sendEmail(user.email, code);
        if (response.error) {
            return res.status(500).json({
                error: true,
                message: "Couldn't send mail. Please try again later.",
            });
        }
        let expiry = Date.now() + 60 * 1000 * 15;
        user.resetPasswordToken = code;
        user.resetPasswordExpires = expiry; // 15 minutes
        await user.save();
        // return res.send({
        //     success: true,
        //     message: "If that email address is in our database, we will send you an email to reset your password",
        // });
        return res.redirect("/reset-password");
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

// user reset password
exports.ResetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;
        if (!token || !newPassword || !confirmPassword) {
            return res.status(403).json({
                error: true,
                message: "Couldn't process request. Please provide all mandatory fields",
            });
        }
        const user = await User.findOne({
            resetPasswordToken: req.body.token,
            resetPasswordExpires: { $gt: Date.now() },
        });
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