const mongoose = require('mongoose');

const otpSchema =new mongoose.Schema({
    userEmail:String,
    OTP:String,
    Token:String,
    createdAt:Date,
    expireAt:Date
})


module.exports = mongoose.model('Otp',otpSchema);