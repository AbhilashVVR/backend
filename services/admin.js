const Admin = require('../models/admin-model');

// const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT;

const {
    addNewAdmin,
    getAdmins,
    deleteAdmin,
    getAdminWithId,
    editAdminById
} = require('../dynamodb/database/admin')

const GetAllAdmin = async (req, res) => {
    try {
        const admin = await getAdmins();
        res.json(admin.Items);
    } catch (err) {
        res.json({ message: err });
    }
}

const RegisterNewAdmin = async (req, res) => {
    const admin = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: bcrypt.hashSync(req.body.password, 8),
        address: req.body.address
    };
    try {
        const savedAdmin = await addNewAdmin(admin);
        res.json(savedAdmin);
    } catch (err) {
        res.json({ message: err });
    }
}

const LoginAdmin = async (req, res) => {
    const { userName, password } = req.body;
    // we made a function to verify our user login
    console.log("USERNAME",userName);
    const response = await verifyAdminLogin(userName, password);
    if (response.status === 'ok') {
        // storing our JWT web token as a cookie in our browser
        res.cookie('token', token, { maxAge: 12 * 60 * 60 * 1000, httpOnly: true });  // maxAge: 12 hours
        // res.redirect('/');
        res.json({
            message: "you are logged in successfully!",
            token: token,
        });
    } else {
        res.json(response);
    }
}

const DeleteAdmin = async (req, res) => {
    try {

        const removedAdmin = await deleteAdmin(req.params.id);
        res.json(removedAdmin);
    } catch (err) {
        res.json({
            message: err.message
        });

    }
}

// user login function
const verifyAdminLogin = async (userName, password) => {
    try {
        const admins = await getAdmins();
        const admin = admins.Items.filter(admin => admin.userName === userName);
        console.log(admin)
        if (!admin) {
            return { status: 'error', error: 'user not found' }
        }
        if (await bcrypt.compare(password, admin[0].password)) {
            // creating a JWT token
            token = jwt.sign({ id: admin[0].id, username: admin[0].userName, type: 'admin' }, JWT_SECRET)
            return { status: 'ok', data: token }
        }
        return { status: 'error', error: 'invalid password or username' }
    } catch (error) {
        return { status: 400, 'error': error.message };
    }
};

module.exports = {
    GetAllAdmin,
    RegisterNewAdmin,
    LoginAdmin,
    DeleteAdmin
}