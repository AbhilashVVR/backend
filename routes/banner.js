const express = require("express");
const fs = require("fs");
const router = express.Router();
const Banner = require("../models/banner-model");
const { CreateBanner, DeleteBanner, EnableDisableBanner, GetBanners } = require("../services/banner");

//Get All Banner
router.get("/getBanner", GetBanners);

router.post("/createBanner", CreateBanner);

//Delete Banner
router.delete("/deleteBanner/:id", DeleteBanner);


router.put("/:id", EnableDisableBanner);

module.exports = router;
