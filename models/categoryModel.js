const mongoose = require('mongoose');

const catogorySchema =new mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },
    is_listed:{
        type:Boolean,
        default:true
    },
    categoryOffer:{
        type:Number,
        default:0
    }
})


module.exports = mongoose.model('categorie',catogorySchema);