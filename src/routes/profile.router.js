const express = require('express');
const userAuth = require('../middleware/auth-middleware');
const { validateAllowedFields } = require('../utils/validation');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const apiResponse = require('../utils/generateResponse');

const profileRouter = express.Router();
profileRouter.use(userAuth);

/**
 * @openapi
 * /profile/view:
 *   get:
 *     tags:
 *       - Profile
 *     summary: View profile of current user
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 */
profileRouter.get('/view', async (req, res) => {
    try {
        const {password, ...safeData} = req.user.toObject();
        apiResponse(res, 200, "Profile fetched successfully.", safeData);
    } catch (error) {
        apiResponse(res, 400, "Error fetching profile: " + error.message)
    }
});

/**
 * @openapi
 * /profile/update:
 *   patch:
 *     tags:
 *       - Profile
 *     summary: Update user profile
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
profileRouter.patch('/update', async (req, res) => {
    try {
        const allowedUpdates = ['name', 'age', 'gender', 'skills', 'about'];
        const isValidOperation = validateAllowedFields(req, allowedUpdates);
        if (!isValidOperation) {
            return apiResponse(res, 400, "Invalid updates!");
        }
        const updates = Object.keys(req.body);
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        const {password, email, ...safeData} = req.user.toObject();
        apiResponse(res, 200, "Profile updated successfully.", safeData);
    }
    catch (error) {
        apiResponse(res, 400, "Error updating profile: " + error.message)
    }
});

/**
 * @openapi
 * /profile/change-password:
 *   patch:
 *     tags:
 *       - Profile
 *     summary: Change user password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 */
profileRouter.patch('/change-password', async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return apiResponse(res, 400, "Please provide old and new passwords.");
        }
        else if(oldPassword === newPassword){
            return apiResponse(res, 400, "New password must be different from old password.");
        }
        const user = new User(req.user);
        const isMatch = await user.isPasswordMatch(oldPassword);
        if (!isMatch) {
            return apiResponse(res, 400, 'Old password is incorrect.');
        }
        req.user.password = await bcrypt.hash(newPassword, 10);
        await req.user.save();
        apiResponse(res, 200, "Password changed successfully.")
    }
    catch (error) {
        apiResponse(res, 400, "Error changing password: " + error.message);
    }
});

module.exports = profileRouter;