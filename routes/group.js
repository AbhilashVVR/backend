// const express = require('express');
// const router = express.Router();
// const Group = require('../models/group-model');
// const GroupMap = require('../models/group-map-model');

// //Get All Group
// router.get('/getGroups', async (req,res)=>{
//    try{
//        const group = await Group.find();
//        res.json(group);
//     } catch (err){
//         res.json({message: err });
//     }
// }); 

// //Submit Group
// router.post('/createGroup', async (req,res)=>{
//     const group = new Group({
//                 groupName: req.body.group_name,
//                 createdBy: req.body.created_by
//             });
//     try{
//         const savedGroup = await group.save();
//         const groupMap = new GroupMap({
//                 userId: req.body.created_by,
//                 groupId: savedGroup._id,
//                 isOwner: 1
//             });
//         const savedGroupMap = await groupMap.save();
//         res.json(savedGroup);
//     } catch (err){
//         res.json({message: err});
//     }
// });

// //Add Group Member
// router.post('/addGroupMember', async (req,res)=>{
//     const groupMap = new GroupMap({
//                 userId: req.body.user_id,
//                 groupId: req.body.group_id,
//                 isOwner: 0
//             });
//     try{
//         const savedGroupMap = await groupMap.save();
//         res.json(savedGroupMap);
//     } catch (err){
//         res.json({message: err});
//     }
// });

// //Edit Group
//  router.post('/updateGroup',async (req,res)=>{
//     try {
//         const savedGroup = await Group.update({ _id: req.body.id},{
//              $set: {
//                groupName: req.body.group_name
//              }
//         });
//        res.json(savedGroup);
//     } catch (ex) {
//         res.json({message: ex});
//     }
//  });

// module.exports = router;    