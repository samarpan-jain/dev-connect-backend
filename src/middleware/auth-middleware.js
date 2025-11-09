const User = require('../models/user');
const jwt = require('jsonwebtoken');
const apiResponse = require('../utils/generateResponse');

const userAuth = async (req, res, next) => {
    const token = req.cookies.token || '';
    if (!token) {
        return apiResponse(res,401,'Access denied. No token provided.');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        next();
    } catch (err) {
        apiResponse(res,403,'Invalid token.');
    }
};

module.exports = userAuth;