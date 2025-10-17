const validator = require('validator');

const validateSignUp = (req) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        throw new Error('Please enter data for all required fields.');
    }
    else if (!validator.isEmail(email)) {
        throw new Error('Invalid email format');
    }
    else if (!validator.isStrongPassword(password)) {
        throw new Error('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
    }
}

const validateAllowedFields = (req, allowedUpdates) => {
    const updatedModel = Object.keys(req.body);
    return updatedModel.every((update) => allowedUpdates.includes(update));
}

module.exports = { validateSignUp, validateAllowedFields };