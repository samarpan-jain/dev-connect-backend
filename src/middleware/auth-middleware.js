const User = require('../models/user');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const userAuth = async (req, res, next) => {
    const token = req.cookies.token || '';
    if (!token) {
        return res.status(401).send('Access denied. No token provided.');
    }
    try {
        console.log(process.env.JWT_SECRET);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        res.status(400).send('Invalid token.');
    }
};

module.exports = userAuth;