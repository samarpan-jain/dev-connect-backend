const express = require('express');
const apiResponse = require('../utils/generateResponse');
const userAuth = require('../middleware/auth-middleware');
const ConnectionReq = require('../models/connectionReq');

const userRouter = express.Router();
userRouter.use(userAuth);

const userSafeData = { name: 1, age: 1, gender: 1, skills: 1, about: 1, _id: 0 };

userRouter.get('/requests/received', async (req, res) => {
    try {
        const userId = req.user.id;
        const connections = await ConnectionReq.find({
            toUserId: userId,
            status: 'interested'
        })
        .populate("fromUserDetails", userSafeData)
        .select({ __v: 0 });
        return apiResponse(res, 200, 'Connections fetched successfully', connections);
    } catch (error) {
        return apiResponse(res, 500, 'Error in fetching connections: ' + error.message);
    }
});

userRouter.get('/requests/connections', async (req, res) => {
    try {
        const userId = req.user._id;
        const connectionsData = await ConnectionReq.find({
            $or: [
                { fromUserId: userId, status: 'accepted' },
                { toUserId: userId, status: 'accepted' }
            ]
        }, {fromUserId:1, toUserId:1}).populate("fromUserDetails toUserDetails", userSafeData);

        const connectionDetails = connectionsData.map(record=>{
            return record.fromUserId.toString() === userId.toString() ? record.toUserDetails : record.fromUserDetails;
        })
        
        return apiResponse(res, 200, 'Connections fetched successfully', connectionDetails);
    } catch (error) {
        return apiResponse(res, 500, 'Error in fetching connections: ' + error.message);
    }
});

module.exports = userRouter;