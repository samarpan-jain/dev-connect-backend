const express = require('express');
const authRouter = express.Router();
const User = require('../models/user');
const { validateSignUp } = require('../utils/validation');
const bcrypt = require('bcrypt');
const apiResponse = require('../utils/generateResponse');

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               gender:
 *                 type: string
 *             required:
 *               - name
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Error creating user
 */
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

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 */
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
        res.cookie('token', user.getJwtToken(), { expires: new Date(Date.now() + 24 * 3600000), httpOnly: true });
        const { password: pwd, ...userData } = user.toObject();
        apiResponse(res, 200, "Login successful", userData);
    } catch (error) {
        apiResponse(res, 400, "Error logging in: " + error.message);
    }
})

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout the current user
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
authRouter.post('/logout', (req, res) => {
    res.cookie('token', null, { expires: new Date(Date.now()) });
    apiResponse(res, 200, "Logged out successfully");
});

module.exports = authRouter;