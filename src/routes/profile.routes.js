const express = require('express');
const profileRouter = express.Router();
const userAuth = require('../middleware/auth-middleware');
const { validateAllowedFields } = require('../utils/validation');
//const User = require('../models/user');

profileRouter.use(userAuth);

profileRouter.get('/view', async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        res.status(400).send("Error fetching profile: " + error.message);
    }
});

profileRouter.patch('/update', async (req, res) => {
    try {
        const allowedUpdates = ['name', 'age', 'gender', 'skills', 'about'];        
        const isValidOperation = validateAllowedFields(req, allowedUpdates);
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' });
        }
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        res.status(200).json(req.user);
    }
    catch (error) {
        res.status(400).send("Error updating profile: " + error.message);
    }
});

module.exports = profileRouter;