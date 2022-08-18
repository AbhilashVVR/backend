const express = require("express");
const router = express.Router();
const { GetQuery, RegisterQuery } = require("../services/query");

//Get All Quesry
router.get("/getQuery", GetQuery);

//Submit Query
router.post("/addQuery", RegisterQuery);

module.exports = router;
