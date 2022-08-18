const { User } = require("../models/user-model");
const Token = require("../models/token");
const crypto = require("crypto");
const express = require("express");
const router = express.Router();
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_APIKEY)
const { getUserByUserId } = require("../mongoDb/user")

router.post("/", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user)
            return res.status(400).send("user with given email doesn't exist");

        let token = await Token.findOne({ userId: user._id });
        if (!token) {
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }

        const msg = {
            from: 'no-reply@langwayz.games',
            to: newUser.email,
            subject: 'Lingowayz - Verify to change your account password!',
            text: `
                Hello ${newUser.firstName} ${newUser.lastName}
                please click on the address to verify the account to reset the password.
                ${req.headers.host}/password-reset/${user._id}/${token.token}
            `,
            html:`
                <h1>Hello ${newUser.firstName} ${newUser.lastName}</h1>
                <p>Thank you for registering on our application.</p>
                <p>Please click on the link bellow to verify your account to reset the password.</p>
                <a href="${req.headers.host}/password-reset/${user._id}/${token.token}"></a>
            `
        }
        await sgMail.send(msg);
        res.send("password reset link sent to your email account");
    } catch (error) {
        res.send("An error occured");
    }
});

router.post("/:userId/:token", async (req, res) => {
    try {
        const user = await getUserByUserId(req.params.userId);
        if (!user) return res.status(400).send("invalid link or expired");

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) return res.status(400).send("Invalid link or expired");

        user.password = req.body.password;
        await user.save();
        await token.delete();

        res.send("password reset sucessfully.");
    } catch (error) {
        res.send("An error occured");
    }
});

module.exports = router;