const express = require("express");
const router = express.Router();
const {
  CreateSquad,
  GetSquadWithId,
  GetSquadByUserId,
  GetAllSquads,
  AddSquadMember,
  RemoveSquadMember,
  DeleteSquad
} = require("../services/squad");

//Submit request for creating Squad
router.post("/createSquad", CreateSquad);

//Submit request for Getting Squad by Id
router.get("/getSquadWithId/:id", GetSquadWithId);

//Submit request for Getting Squads by userId
router.get("/getSquadByUserId/:userId", GetSquadByUserId);

//Submit request for Getting All Squads
router.get("/getAllSquads", GetAllSquads);

//Submit request for Adding Member in squad
router.put("/addSquadMember", AddSquadMember);

//Submit request for Removing Member From Squad
router.put("/removeSquadMember", RemoveSquadMember);

//Submit request for Removing Member From Squad
router.delete("/deleteSquad/:id", DeleteSquad);

module.exports = router;
