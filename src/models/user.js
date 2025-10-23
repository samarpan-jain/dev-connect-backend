const mongoose = require('mongoose');
const validator = require('validator');
const { Schema } = mongoose;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const userSchema = new Schema({
    name: { type: String, required: true, unique: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true, 
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Invalid email format');
            }
        }
    },
    password: { type: String, required: true },
    age: { type: Number, min: 18, max: 100 },
    gender: { type: String, enum: {
            values: ['Male', 'Female', 'Other'],
            message: '{VALUE} is invalid gender'
        } 
},
    skills: { type: [String], maxlength: 10},
    about: { type: String, maxlength: 500 },
},{ timestamps: true });

userSchema.methods.getJwtToken = function() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    });
}

userSchema.methods.isPasswordMatch = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

module.exports = mongoose.model('User', userSchema);