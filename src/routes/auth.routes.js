const express = require('express');
const authRouter = express.Router();
const User = require('../models/user');
const { validateSignUp } = require('../utils/validation');
const bcrypt = require('bcrypt');

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
        res.status(201).send('User created successfully');
    } catch (error) {
        res.status(400).send("Error creating user: " + error.message);
    }
})

authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Invalid email or password');
        }
        const isPasswordMatch = await user.isPasswordMatch(password);
        if (!isPasswordMatch) {
            return res.status(400).send('Invalid email or password');
        }
        res.cookie('token', user.getJwtToken(), {expires: new Date(Date.now() + 24* 3600000), httpOnly: true});
        res.status(200).send('Login successfully');
    } catch (error) {
        res.status(400).send("Error logging in: " + error.message);
    }
})

authRouter.post('/logout', (req, res) => {
    res.cookie('token', null, { expires: new Date(Date.now())});
    res.status(200).send('Logged out successfully');
});

module.exports = authRouter;