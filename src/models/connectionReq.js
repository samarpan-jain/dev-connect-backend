const mongoose = require('mongoose');
const { Schema } = mongoose;

const connectionReqSchema = new Schema(
    {
        fromUserId: { type: Schema.Types.ObjectId, required: true },
        toUserId: { type: Schema.Types.ObjectId, required: true},
        status: {
            type: String, enum: {
                values: ['ignored', 'interested', 'accepted', 'rejected'],
                message: '{VALUE} is not a valid status'
            }
        },
    },
    {
        timestamps: true, 
        virtuals: {
            fromUserDetails: {
                options: {
                    ref: 'User',
                    localField: 'fromUserId',
                    foreignField: '_id',
                    justOne: true,
                },
            },
            toUserDetails: {
                options: {
                    ref: 'User',
                    localField: 'toUserId',
                    foreignField: '_id',
                    justOne: true,
                },
            },
        },
        id: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

connectionReqSchema.index({ fromUserId: 1, toUserId: 1 });

connectionReqSchema.pre('validate', async function (next) {
    const connectionReq = this;
    if (connectionReq.fromUserId.toString() === connectionReq.toUserId.toString()) {
        throw new Error('fromUser and toUser cannot be the same');
    }
    next();
});

module.exports = mongoose.model('ConnectionReq', connectionReqSchema);