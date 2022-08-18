const Squad = require("../models/squad-model");

const createSquad = async (squadDetails) => {
  const squad = new Squad(squadDetails);
  return Promise.resolve(await squad.save());
};

const getSquadWithId = async (req, res, next) => {
  const squad = await Squad.findOne({
    _id: req,
  });
  return Promise.resolve(squad);
};

const getSquadBySquadName = async (name, createdBy) => {
  const query = {
    name: name,
    createdBy: createdBy
  };
  const squadDetails = await Squad.find(query);
  return Promise.resolve(squadDetails);
};

const getSquadByUserId = async (createdBy) => {
  const query = {
    createdBy: createdBy
  };
  const squadDetails = await Squad.find(query);
  return Promise.resolve(squadDetails);
};

const getAllSquads = async () => {
  const squadDetails = await Squad.find({});
  return Promise.resolve(squadDetails);
};

const updateSquad = async (id, members) => {
  
  var key = {
    member: members,
  };

  const updatedSquad = await Squad.updateOne(
    { _id: id },
    {
      $set: key,
    }
  );

  return Promise.resolve(updatedSquad);
};

module.exports = {
  createSquad,
  getSquadWithId,
  getSquadBySquadName,
  getSquadByUserId,
  getAllSquads,
  updateSquad
};
