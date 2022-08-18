const express = require("express");
const router = express.Router();
const {
    removeFromCloudinary,
} = require("../services/cloudinary");
const {
    Register,
    Signin,
    GetProfiles,
    GetUserById,
    GetUserByUniqueId,
    GetUserByUsername,
    GetUserByEmail,
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
} = require("../services/user");

//Get All Users
router.get("/", GetProfiles);

// router.get('/', userController.getProfiles);
router.post("/register", Register);
router.post("/login", Signin);

router.post("/forgot-password", ForgotPassword);
router.post("/reset-password", ResetPassword);
// router.post('/verifyEmail/:id', userController.verifyEmail);

router.put("/update-password", UpdatePassword);

router.get("/getLevel/:userId/:gameId", GetLevelByUserIdAndGameId);

router.get("/getExcerciseLevel/:userId/:subCategoryId", GetExcerciseLevelByUserIdAndSubCategoryId);

router.get("/getGameDetails/:userId/:gameId", GetGameDetailsByUserIdAndGameId);

router.get("/getSubCategoryDetails/:userId/:subCategoryId", GetExcerciseDetailsByUserIdAndSubCategoryId);

router.get("/updateLevel/:userId/:gameId", UpdateLevelByUserIdAndGameId);

router.get("/updateExcerciseLevel/:userId/:subCategoryId", UpdateExcerciseLevelByUserIdAndSubCategoryId);

router.get("/verifyEmail/:id", VerifyEmailId);

router.put("/edit/:id", UpdateProfile);

// Search By UserId
router.get("/searchById/:id", GetUserById);

// Search By UniqueId
router.get("/searchByUniqueId/:uniqueId", GetUserByUniqueId);

// Search By EmailId
router.get("/searchByEmail/:email", GetUserByEmail);

router.post("/searchByUserName", GetUserByUsername);

//Delete Specific User
router.delete("/delete-user/:userId", DeleteUser);

// Upload User Image
router.post("/upload-image/:id", UploadImage);

// Delete User Image
router.delete("/image/:id", async (req, res) => {
    try {
        //Find user
        const user = await User.findOne({ _id: req.params.id });
        //Find it's publicId
        const cloudinary_id = user.cloudinary_id;
        //Remove it from cloudinary
        await removeFromCloudinary(cloudinary_id);
        //Remove it from the Database
        const deleteImg = await User.updateOne({ _id: req.params.id }, {
            $set: {
                image: "",
                cloudinary_id: "",
            },
        });
        res.status(200).json("user image deleted with success!", deleteImg);
    } catch (error) {
        res.status(400).json(error);
    }
});

module.exports = router;