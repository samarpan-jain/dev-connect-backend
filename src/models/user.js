const mongoose = require('mongoose');
const validator = require('validator');
const { Schema } = mongoose;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    name: { type: String, required: true, unique: true, minlength: 3, maxlength: 30 },
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
    photoUrl: { type: String, default: 'https://www.shutterstock.com/image-vector/blank-avatar-photo-place-holder-600nw-1095249842.jpg'},
    password: { type: String, required: true },
    age: { type: Number, min: 18, max: 100 },
    gender: { 
        type: String, 
        enum: {
            values: ['Male', 'Female', 'Other'],
            message: '{VALUE} is invalid gender'
        },
    },
    skills: { type: [String], maxlength: 10, default: ["Communication", "Team Player"] },
    about: { type: String, minlength:100 , maxlength: 300, default: "Feel free to connect for networking. Let's connect and see if our vibes match to build something for the future." },
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