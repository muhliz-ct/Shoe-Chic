const mongoose = require('mongoose');

const couponModel = new mongoose.Schema({
    couponName:{
        type:String,
        required:true
    },
    couponCode:{
        type:String,
        required:true
    },
    discount:{
        type:Number,
        required:true
    },
    from:{
        type:Number,
        required:true
    },
    to:{
        type:Number,
        required:true
    },
    coupanImage:{
        type:String,
        required:true
    },
    createdDate:{
        type:Date,
        default:Date.now
    },
    expiryDate:{
        type:Date,
        default:Date.now
    },
    status:{
        type:Boolean,
        default:true
    }
})



module.exports = mongoose.model('coupon',couponModel);