const express = require('express');
const apiResponse = require('../utils/generateResponse');
const userAuth = require('../middleware/auth-middleware');
const ConnectionReq = require('../models/connectionReq');
const User = require('../models/user');

const connReqRouter = express.Router();
connReqRouter.use(userAuth);

connReqRouter.post('/send/:status/:toUserId', async (req, res) => {
    try {
        const allowedStatuses = ['ignored', 'interested'];
        if (!allowedStatuses.includes(req.params.status)) {
            return apiResponse(res, 400, 'Invalid status value');
        }

        const isToUserExist = await User.findById(req.params.toUserId);
        if (!isToUserExist) {
            return apiResponse(res, 404, 'Target user not found');
        }

        const connectionReqExists = await ConnectionReq.findOne({
            '$or': [
                {
                    fromUserId: req.user.id,
                    toUserId: req.params.toUserId
                },
                {
                    fromUserId: req.params.toUserId,
                    toUserId: req.user.id
                }
            ]
        });
    
        if (connectionReqExists) {
            throw new Error('Connection request already exists');
        }

        const connectionRequest = new ConnectionReq({
            fromUserId: req.user.id,
            toUserId: req.params.toUserId,
            status: req.params.status
        });
        
        await connectionRequest.save();
        return apiResponse(res, 200, 'Connection request sent successfully');
    }
    catch (error) {
        return apiResponse(res, 500, 'Error in sending connection request: ' + error.message);
    }
});

connReqRouter.post('/review/:status/:connReqId', async (req, res) => {
    try {
        const allowedStatuses = ['accepted', 'rejected'];
        if (!allowedStatuses.includes(req.params.status)) {
            return apiResponse(res, 400, 'Invalid status value');
        }
        const connectionRequest = await ConnectionReq.findOne({
            status: "interested",
            _id: req.params.connReqId,
            toUserId: req.user.id
        });
        if (!connectionRequest) {
            return apiResponse(res, 404, 'Connection request not found');
        }
        connectionRequest.status = req.params.status;
        await connectionRequest.save();
        return apiResponse(res, 200, 'Connection request reviewed successfully');
    }
    catch (error) {
        return apiResponse(res, 500, 'Error in reviewing connection request: ' + error.message);
    }
});

module.exports = connReqRouter;

