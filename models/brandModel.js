const mongoose = require('mongoose');

const brandSchema =new mongoose.Schema({
    brandName:String,
})


module.exports = mongoose.model('brand',brandSchema);