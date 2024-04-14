const Razorpay = require('razorpay');
const razorpay = require('razorpay');
require('dotenv').config();


const instances = new Razorpay({
    key_id: process.env.RAZORPAY_IDKEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
})


module.exports = instances