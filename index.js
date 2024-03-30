//Set env:
const dotenv = require('dotenv').config();




// Set mongoose:
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGOURL);

// const dbConnect = require('./config/config');
// dbConnect.dbConnection;



//set express
const express = require('express');
const app = express();


const nocache = require('nocache');
app.use(nocache());


//error Handler Middleware
const errorHandler = require('./middlewares/errorHandler');

//Set express session
const session =  require('express-session');
app.use(session({
    secret:"secret",
    resave:false,
    saveUninitialized:true

}));





//set path:
const path = require('path');
app.use(express.static(path.join(__dirname,'public')));

//set view engine
app.set('view engine','ejs');

//set bodyparser
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//set flash
const flash = require('express-flash');
app.use(flash());

const userRoute = require('./routers/userRoute');
app.use('/',userRoute);


const adminRoute = require('./routers/admiRoute');
app.use('/admin',adminRoute)


//set error handler
app.use(errorHandler);



// userRoute.get('*',(req,res)=>{
//     res.send('<h1>currently trying to get an invalid page !!! SORRY!!!</h1>')
// })
// userRoute.post('*',(req,res)=>{
//     res.send('<h1>currently trying to get an invalid page !!! SORRY!!!</h1>')
// })



const PORT = process.env.PORT||3313;

app.listen(PORT,()=>{
    console.log(`server running on port http://localhost:${PORT}`);
})




