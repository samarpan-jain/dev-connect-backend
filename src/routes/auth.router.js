const express = require('express');
const authRouter = express.Router();
const User = require('../models/user');
const { validateSignUp } = require('../utils/validation');
const bcrypt = require('bcrypt');
const apiResponse = require('../utils/generateResponse');

authRouter.post('/signup', async (req, res) => {
    try {
        validateSignUp(req);
        const { name, email, password, gender } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            gender
        });
        await newUser.save();
        apiResponse(res, 201, "User created successfully");
    } catch (error) {
        apiResponse(res, 400, "Error creating user: " + error.message);
    }
})

authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return apiResponse(res, 400, 'Invalid email or password');
        }
        const isPasswordMatch = await user.isPasswordMatch(password);
        if (!isPasswordMatch) {
            return apiResponse(res, 400, 'Invalid email or password');
        }
        res.cookie('token', user.getJwtToken(), {expires: new Date(Date.now() + 24* 3600000), httpOnly: true});
        apiResponse(res, 200, "Login successful");
    } catch (error) {
        apiResponse(res, 400, "Error logging in: " + error.message);
    }
})

authRouter.post('/logout', (req, res) => {
    res.cookie('token', null, { expires: new Date(Date.now())});
    apiResponse(res, 200, "Logged out successfully");
});

module.exports = authRouter;