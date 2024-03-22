const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {type:mongoose.Schema.Types.ObjectId, ref: 'userData' , required:true},



    address : [{

        name: {type:String , required:true},
        phone: {type:Number , required:true},
        city: {type:String , required:true},
        state: {type:String , required:true},
        pincode: {type:Number , required:true},
        address: {type:String , requiered:true},
        locality: {type:String , requiered:true},
        status: {type:Boolean , default:false , required:true}

    }]
});





module.exports = mongoose.model('address', addressSchema);