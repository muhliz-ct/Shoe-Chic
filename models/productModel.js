const mongoose =  require('mongoose');


const productSchema = new mongoose.Schema({

    productName:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    offerpercentage:{
        type:Number,
        default:0
    },
    discountAmount:{
        type:Number,
        default:0
    },
    offerprice:{
        type:Number,
        default:0
    },
    quantity:{
        type:Number,
        required:true
    },
    status:{
        type:Boolean,
        required:true

    },
    productImage:{
        type:Array,
        required:true

    },
    createdAt:{
        type:Date,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    catogory:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    }

})


module.exports = mongoose.model('product',productSchema);