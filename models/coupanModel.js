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
    expiryDate: {
        type: Date,
        default: function() {
            const currentDate = new Date();
            const expiryDate = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000));
            return expiryDate;
        }
    },
    status:{
        type:Boolean,
        default:true
    },
    userId:[
        
    ]
})



module.exports = mongoose.model('coupon',couponModel);