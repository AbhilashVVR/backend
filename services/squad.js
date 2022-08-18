const {
  addNewSquad,
  getSquads,
  getSquadsByNameAndUserId,
  getSquadWithId,
  editSquadById,
  deleteSquad,
} = require("../dynamodb/database/squad")


const { getUserById } = require("../dynamodb/database/user");

const CreateSquad = async (req, res) => {
  if (!req.body.name) {
    return res.json({ message: "Squad Name is Required" });
  }
  if (!req.body.userId) {
    return res.json({ message: "User Not Found" });
  }

  const user = await getUserById(req.body.userId);
  if (!user) {
    return res.json({ message: "User Not Found" });
  }

  const squads = await getSquadsByNameAndUserId(req.body.name, req.body.userId);
  const getSquad = squads.Items;
  if (getSquad.length) {
    return res.json({ message: "Squad with this name is already present" });
  }
  try {
    const savedRequest = await addNewSquad({
      name: req.body.name,
      createdBy: req.body.userId,
      squadMember: [req.body.userId],
    });
    res.json(savedRequest);
  } catch (err) {
    res.json({ message: err });
  }
};

const GetSquadWithId = async (req, res) => {
  try {
    let data = await getSquadWithId(req.params.id);
    res.json(data);
  } catch (err) {
    res.json({ message: err });
  }
};

const GetSquadByUserId = async (req, res) => {
  try {
    const responseData = await getSquadByUserId(req.params.userId)
    res.json(responseData);
  } catch (err) {
    res.json({ message: err });
  }
};

const GetAllSquads = async (req, res) => {
  try {
    let data = await getSquads();
    res.json(data);
  } catch (err) {
    res.json({ message: err });
  }
};

const AddSquadMember = async (req, res) => {

  const getSquad = await getSquadWithId(req.body.id);
  if (!getSquad) {
    return res.json({ message: "Squad Not Found" });
  }

  const user = await getUserById(req.body.memberId);
  if (!user) {
    return res.json({ message: "User Not Found" });
  }

  if (getSquad.createdBy !== req.body.userId) {
    return res.json({
      message: "Sorry, You are not authorized to add Squad member",
    });
  }

  try {
    let members = getSquad.squadMember;
    const findmember = getSquad.squadMember.find(
      (member) => member === req.body.memberId
    );
    if (findmember) {
      return res.json({ message: "This member is already in Squad" });
    }
    members.push(req.body.memberId);
    await editSquadById(getSquad, members);
    const updatedSquad = await getSquadWithId(req.body.id);
    res.json(updatedSquad);
  } catch (err) {
    res.json({ message: err });
  }
};

const RemoveSquadMember = async (req, res) => {

  const getSquad = await getSquadWithId(req.body.id);
  if (!getSquad) {
    return res.json({ message: "Squad Not Found" });
  }

  const user = await getUserById(req.body.memberId);
  if (!user) {
    return res.json({ message: "User Not Found" });
  }

  try {
    let members = getSquad.squadMember;
    const findmember = getSquad.squadMember.find(
      (member) => member === req.body.memberId
    );
    if (!findmember) {
      return res.json({ message: "This member is not in Squad" });
    }

    if (
      getSquad.createdBy !== req.body.userId ||
      req.body.memberId === req.body.userId
    ) {
      return res.json({
        message: "Sorry, You are not authorized to add Squad member",
      });
    }

    const index = members.indexOf(req.body.memberId);
    if (index > -1) {
      members.splice(index, 1);
    }
    await editSquadById(getSquad, members);
    const updatedSquad = await getSquadWithId(req.body.id);
    res.json(updatedSquad);
    //res.json({ members });
  } catch (err) {
    res.json({ message: err });
  }
};

const DeleteSquad = async (req, res) => {
  try {
    const deleteCat = await deleteSquad(req.params.id)
    res.json(deleteCat);
  } catch (err) {
    res.json({ message: err });
  }
}

const getSquadByUserId = async (userId) =>{
  let responseData = [];
    let data = await getSquads();

    data.Items.forEach((squad) => {
      const memberFound = squad.squadMember.find(
        (element) => element === userId
      );
      if (memberFound) {
        responseData.push(squad);
      }
    });

    return responseData;
}


module.exports = {
  CreateSquad,
  GetSquadWithId,
  GetSquadByUserId,
  GetAllSquads,
  AddSquadMember,
  RemoveSquadMember,
  DeleteSquad,
  getSquadByUserId
};
