const mongoose = require('mongoose');

const whishlistModel = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'userData',
        required:true
    },
    products:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product',
            required:true
        }
    }]
});



module.exports = mongoose.model('whishlist', whishlistModel);