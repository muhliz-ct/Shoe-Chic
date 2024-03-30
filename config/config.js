const mongoose = require('mongoose');
const dotenv = require('dotenv').config();




const dbConnection =  function(){
    const mongoose = require('mongoose');
    mongoose.connect(process.env.MONGOURL)
}





module.exports  = {
    dbConnection
}