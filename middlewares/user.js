const User = require('../models/user-model')

let middlewareObj = {};

middlewareObj.isNotVerified = async (req, res, next) => {
    try{
        const user = await User.findOne({userName: req.body.userName});
        if(user.isVerified){
            return next();
        }
        res.json('error', 'Your account is not been verified. Please check your email for verification link to verify your account');
        // return res.redirect('/')
    } catch (error) {
        console.log(error);
        res.json('error, something went wrong', error.message);
    }
}

module.exports = middlewareObj;