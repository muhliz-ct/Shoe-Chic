const mongoose = require('mongoose');
const { stringify } = require('uuid');

const walletSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'userdata',
        required:true
    },
    walletBalance:{
        type:Number,
        default:0
    },
    transaction:[{
        amount:{type:Number},
        time:{type:Date,default:Date.now},
        Action:{type:String,enum:['Credit','Debit']}

    }]
})



module.exports = mongoose.model('wallet',walletSchema);