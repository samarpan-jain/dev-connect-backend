const express = require('express');
const apiResponse = require('../utils/generateResponse');
const userAuth = require('../middleware/auth-middleware');
const ConnectionReq = require('../models/connectionReq');
const User = require('../models/user');

const userRouter = express.Router();
userRouter.use(userAuth);

const userSafeData = { name: 1, age: 1, gender: 1, photoUrl: 1, skills: 1, about: 1, _id: 1 };

/**
 * @openapi
 * /users/requests/received:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get received connection requests
 *     responses:
 *       200:
 *         description: Connections fetched successfully
 */
userRouter.get('/requests/received', async (req, res) => {
    try {
        const userId = req.user.id;
        const connections = await ConnectionReq.find({
            toUserId: userId,
            status: 'interested'
        },{__v:0})
        .populate("fromUserDetails", userSafeData);
        return apiResponse(res, 200, 'Connections fetched successfully', connections);
    } catch (error) {
        return apiResponse(res, 500, 'Error in fetching connections: ' + error.message);
    }
});

/**
 * @openapi
 * /users/requests/connections:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get accepted connections
 *     responses:
 *       200:
 *         description: Connections fetched successfully
 */
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

/**
 * @openapi
 * /users/feed:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user feed
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Feed fetched successfully
 */
userRouter.get('/feed', async (req, res) => {
    try{
        const seenUserIds = await ConnectionReq.find({
            $or: [
                { fromUserId: req.user.id },
                { toUserId: req.user.id }
            ]
        });

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const hiddenUserIds = new Set();

        seenUserIds.forEach(record=>{
            hiddenUserIds.add(record.fromUserId.toString());
            hiddenUserIds.add(record.toUserId.toString());
        });
        hiddenUserIds.add(req.user.id);

        const userFeed = await User.find(
            { 
                _id: { 
                    $nin: Array.from(hiddenUserIds)
                } 
            }, 
            userSafeData).limit(limit).skip(skip);

        return apiResponse(res, 200, 'Feed fetched successfully', userFeed);
    }
    catch(error){
        return apiResponse(res, 500, 'Error in fetching feed: ' + error.message);
    }
});

userRouter.get('/connectionWithReqsCount', async(req,res)=>{
    try{
        const connectionCount = await ConnectionReq.find({
            status:"accepted",
            $or: [
                { fromUserId: req.user.id },
                { toUserId: req.user.id }
            ]
        }).countDocuments()

        const connectionReqsCount = await ConnectionReq.find({
            status:"interested",
            $or: [
                { fromUserId: req.user.id },
                { toUserId: req.user.id }
            ]
        }).countDocuments()

        return apiResponse(res, 200, 'Count Data fetched successfully', {connectionCount, connectionReqsCount})

    }
    catch(err){
       return apiResponse(res, 500, 'Error in fetching count data: ' + err.message); 
    }
});

module.exports = userRouter;