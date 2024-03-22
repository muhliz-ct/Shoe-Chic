const user = require('../models/userModel');
const Otp = require('../models/otpModel');
const category = require('../models/categoryModel');
const product = require('../models/productModel');
const brand = require('../models/brandModel');
const address = require('../models/addressModel');
const cart = require('../models/cartModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');




const passwordHashing = async (pass)=>{
    try {
        return bcrypt.hash(pass,10);
    } catch (error) {
        console.error(error.message);
    }
}

const loadHome = async function (req,res){
    
        try {
            if(req.session.user){
                
                const catData = await category.find({is_listed:true});
                const Data = await cart.findOne({userId:req.session.user._id}).populate('products.productId');
                res.render('homePage' , { login : req.session.user, cartData:Data , categoryData:catData });

            }else{
                const catData = await category.find({is_listed:true});
                res.render('homePage' , { login : req.session.user , categoryData:catData });
            }
        } catch (error) {
            console.error(error.message);
        }
    

};


const loadLogin = async (req,res) => {

   try {
        res.render('login');
        // console.log('page rendered successfully');
   } catch (error) {
    console.error(error.message);
   }

}


const verifyUser = async (req,res)=>{
    try {
        const verifyUser = req.body.email;
        const passData = req.body.password;
        const data = await user.findOne({email:verifyUser});
        if(data){
            const verifyPass = await bcrypt.compare(passData,data.password);
            if(verifyPass&&data.is_blocked==false){
                req.session.user=data;
                console.log('verified successfully');
                res.redirect('/');
            }
            else{
                res.redirect('/');
            }
        }
    } catch (error) {
        console.error(error.message);
    }
}



const loadSignup = async (req,res)=>{
    try {
        res.render('signUp');
        // console.log('signup rendered successfully');
    } catch (error) {
        console.error(error.message)
    }
}

const insertUser = async (req,res)=>{
    try {
        const isAUser = await user.findOne({email:req.body.email});
        console.log(isAUser);
        if(isAUser){
            res.redirect('/signUp')
        }

        

        const newUser = new user({
            fullName:req.body.fullname,
            email:req.body.email,
            phone:req.body.phone,
            password:req.body.password,
            is_admin:false
        })

        // const userData = newUser.save();
        const password = req.body.password;
        const confirmPassword = req.body.confirmPassword;

        if(password == confirmPassword){
           req.session.saveData = newUser;
           console.log(req.session.saveData);
        }
        else{

        }

        if(req.session.saveData){
            const generatedOtp =await generateOtp();
            req.session.otp = generatedOtp;
            console.log(generatedOtp);
            await sendOtp(req.body.fullname,req.body.email,generatedOtp,res);
            console.log(`this is insert user ${req.session.saveData.email}`);
            
        }

        
    } catch (error) {
        console.error(error.message);
    }
}

const generateOtp = ()=>{
    let otp = '';
    for(let i=0; i<4; i++){
        otp += Math.floor(Math.random() * 10);
    }
    return otp
}


const generateToken = ()=>{
    let token = '';
    for(let i=0; i<2; i++){
        token += Math.floor(Math.random() * 10);
    }
    return token
}

const sendOtp = async ( name , email , otp , res )=>{

    try {

        const transporter = nodemailer.createTransport({
            service : 'gmail',
            auth:{
                user:process.env.EMAIL, //email
                pass:process.env.PASS   //password
            }
        });

        const mail = {
            from:'nimbletankz@gmail.com',
            to:email,
            subject:'<h2>OTP verification</h2>',
            html:`<h3>Greetings ${name} , welcome to Shoe Chic</h3>
            <br><p>Enter ${otp} on the Signup Page to Register</p>`
        };

        const info = await transporter.sendMail(mail);
        console.log('mail sended successfully',info.response);

        const userOtp = new Otp({
            userEmail:email,
            OTP:otp,
            createdAt:Date.now(),
            expireAt:Date.now() + (1*60*1000)
        });

        await userOtp.save();


        setTimeout(async() => {
            await Otp.findOneAndDelete({userEmail:email});
            console.log('deleted');
        }, 60000);

        console.log('reaches till redirect !!!!');
        res.redirect(`/otpVerification?email=${email}`);
        

        
    } catch (error) {
        console.error(error.message);
    }

}

const otpLoad = async (req,res)=>{
    try {
        if(req.session.otp){

            console.log('reached otpLoad');
            const queryEmail = req.query.email;
            const queryToken = req.query.token || null;
            console.log(`this is otp load ${queryEmail}`);

            console.log('reached before otpdoc');
            const otpDoc = await Otp.findOne({userEmail:queryEmail});
            console.log(otpDoc);

            let remainingTime = 0;

            if(otpDoc){
                const now = Date.now();
                const expireAt = otpDoc.expireAt.getTime();
                console.log(now);
                console.log(expireAt);
                console.log(now-expireAt);
                remainingTime = Math.max(0, Math.floor((expireAt - now) / 1000));

                console.log(`this is the last console ${remainingTime}`);


            }

            res.render('otp',{queryEmail,queryToken,remainingTime:remainingTime});

        }
        else{

            res.render('login');

        }
    } catch (error) {
        console.error(error.message);
    }
}

const verifyOtp = async (req,res)=>{
    try {
        const sendedEmail = req.body.email;
        
        console.log(`this is verify otp ${sendedEmail}`);
        const otpToBeVerified = req.body.inp1 + req.body.inp2 + req.body.inp3 + req.body.inp4 ;
        // console.log(otpLoad);
        if (req.body.email&&req.body.token) {
            const catData = category.find({is_listed:true})
            const comparedOtp = await Otp.findOne({OTP:otpToBeVerified,Token:req.body.token}) ;
            res.render('newPass',{categoryData:catData,email:sendedEmail});
        }
        else{
            const comparedOtp = await Otp.findOne({OTP:otpToBeVerified}) ;
        if(comparedOtp){
            const hashedPass = await passwordHashing(req.session.saveData.password)
            const newUser = new user({
                fullName:req.session.saveData.fullName,
                email:req.session.saveData.email,
                phone:req.session.saveData.phone,
                password:hashedPass,
                is_admin:false
            })
            
            const userData = newUser.save();
            
            await user.findOneAndUpdate({email:sendedEmail},{$set:{is_verified:true}});
            console.log('verified');
            res.redirect('/')

        }
        else{
            console.log('some error occured');
        }
        }
    } catch (error) {
        console.error(error.message);
    }
}


const loadContact = async (req,res)=>{
    try {
        if(req.session.user){
                
            const catData = await category.find({is_listed:true});
            const Data = await cart.findOne({userId:req.session.user._id}).populate('products.productId');
            res.render('contactUs' , { login : req.session.user, cartData:Data , categoryData:catData });

        }else{
            const catData = await category.find({is_listed:true});
            res.render('contactUs' , { login : req.session.user , categoryData:catData });
        }
    } catch (error) {
        console.error(error.message);
    }
}


const loadAboutus = async (req,res)=>{
    try {
        if(req.session.user){
                
            const catData = await category.find({is_listed:true});
            const Data = await cart.findOne({userId:req.session.user._id}).populate('products.productId');
            res.render('about' , { login : req.session.user, cartData:Data , categoryData:catData });

        }else{
            const catData = await category.find({is_listed:true});
            res.render('about' , { login : req.session.user , categoryData:catData });
        }
    } catch (error) {
        console.error(error.message);
    }
}


const resendOtp = async(req,res)=>{
    try {


            const generatedOtp = generateOtp();
            console.log(generatedOtp);
            console.log(req.session.saveData.email);
            console.log(req.session.saveData.fullName);
            await sendOtp(req.session.saveData.fullName,req.session.saveData.email,generatedOtp,res);
            console.log(req.session.saveData.email);

    } catch (error) {
        console.error(error.message);
    }
}

const userLogout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/');
    } catch (error) {
        console.error(error.message);
    }
}


const profileLoad = async(req,res)=>{
    try {
        res.render('homePage' , {login : req.session.user})
    } catch (error) {
        console.error(error.message);
    }
}


const loadProducts = async(req,res)=>{
    try {
        if(req.session.user){
                
            const catData = await category.find({is_listed:true});
            const productData = await product.find({status:true});
            const brandData = await brand.find({brandName:{$exists:true}});
            const Data = await cart.findOne({userId:req.session.user._id}).populate('products.productId');
            res.render('products',{login : req.session.user,categoryData:catData,product:productData,brandData:brandData});

        }else{
            const catData = await category.find({is_listed:true});
            res.render('proucts' , { login : req.session.user , categoryData:catData });
        }
    } catch (error) {
        console.error();
    }
}



const loadProductDetails = async(req,res)=>{
    try {
        if(req.session.user){
                
            
            const Data = await cart.findOne({userId:req.session.user._id}).populate('products.productId');
            const productId = req.query.id;
            const catData = await category.find({categoryName:{$exists:true}});
            const productData = await product.findById({_id:productId});
            res.render('productdetails',{login : req.session.user,productDetails:productData,categoryData:catData});

        }else{
            const catData = await category.find({is_listed:true});
            res.render('productdetails' , { login : req.session.user , categoryData:catData });
        }
        // const productId = req.query.id;
        // const catData = await category.find({categoryName:{$exists:true}});
        // const productData = await product.findById({_id:productId});
        // res.render('productdetails',{login : req.session.user,productDetails:productData,categoryData:catData});
    } catch (error) {
        console.error(error.message);
    }
}



const forgotPassword = async(req,res)=>{
    try {
        const catData = await category.find({is_listed:true});
        res.render('forgotpassword',{categoryData:catData })
    } catch (error) {
        console.error(error.message)
    }
}


const forgotPasswordSendOtp = async ( name , email , otp , token , res )=>{

    try {

        const transporter = nodemailer.createTransport({
            service : 'gmail',
            auth:{
                user:process.env.EMAIL, //email
                pass:process.env.PASS   //password
            }
        });

        const mail = {
            from:'nimbletankz@gmail.com',
            to:email,
            subject:'<h2>OTP verification</h2>',
            html:`<h3>Greetings ${name} , welcome to Shoe Chic</h3>
            <br><p>Enter ${otp} on the Signup Page to Register</p>`
        };

        const info = await transporter.sendMail(mail);
        console.log('mail sended successfully',info.response);

        const userOtp = new Otp({
            userEmail:email,
            OTP:otp,
            token:token,
            createdAt:Date.now(),
            expireAt:Date.now() + (1*60*1000)
        });

        await userOtp.save();


        setTimeout(async() => {
            await Otp.findOneAndDelete({userEmail:email});
            console.log('deleted');
        }, 60000);

        // console.log('reaches till redirect');
        res.redirect(`/otpVerification?email=${email}&token=${token}`);
        

        
    } catch (error) {
        console.error(error.message);
    }

}



const forgotPasswordOtp = async(req,res)=>{
    try {
        const catData = await category.find({is_listed:true});
        const emailCheck = req.body.emailx;
        console.log(`this is forgot password otp ${emailCheck}`);
        const findUser =await user.findOne({email:emailCheck})
        if(findUser){
            const generatedOtp = generateOtp();
            const generatedToken = generateToken();
            console.log(`this is token generated ${generatedToken}`);
            await forgotPasswordSendOtp(findUser.fullName,findUser.email,generatedOtp,generatedToken,res)
        }
        else{
            res.render('forgotpassword',{emailMsg:'email does not exist!!!!',categoryData:catData})
        }
    } catch (error) {
        console.log(error.message)
    }
}


const changeForgotPassword = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        const hashedPass = await passwordHashing(password);
        console.log(hashedPass);
        const updatePassword = await user.findOneAndUpdate({email:email},{$set:{password:hashedPass}});
        if(updatePassword){
            res.redirect('/');
        }

    } catch (error) {
        console.error(error.message);
    }
}


const loadProfile = async(req,res)=>{
    try {
        const userData = await user.findById({_id:req.session.user._id})
        const catData = await category.find({categoryName:{$exists:true}})
        const msg = req.flash('msg')
        const editSuccessMessage = req.flash('editSuccessMessage')
        res.render('profile',{login:req.session.user,categoryData:catData,userData,msgg:msg,editSucMsg:editSuccessMessage})
    } catch (error) {
        console.error(error.message)
    }
}


const changePassword = async(req,res)=>{
    try {
        const oldPass = req.body.oldPass

        console.log(oldPass);
        const newPass = await passwordHashing(req.body.newPass)
        const currPass = req.session.user.password;
        console.log(currPass);
        const verifyPass = await bcrypt.compare(oldPass,currPass);
        if(verifyPass){
            await user.findByIdAndUpdate({_id:req.query.userId},{$set:{password:newPass}});
            req.flash('msg','got')
            res.redirect('/profile')
        }else{
            console.log('password does not match');
            res.redirect('/profile')
        }
    } catch (error) {
        console.error(error.message)
    }
}


const editProfile = async(req,res)=>{
    try {
        await user.findByIdAndUpdate({_id:req.query.userId},{$set:{fullName:req.body.name,phone:req.body.phone}});
        req.flash('editSuccessMessage','done');
        res.redirect('/profile')
    } catch (error) {
        console.error(error.message)
    }
}


const loadWishlist = async(req,res)=>{
    try {
        const catData = await category.find({categoryName:{$exists:true}})
        res.render('wishlist',{categoryData:catData,login:req.session.user});
    } catch (error) {
        console.error(error.message)
    }
}


const loadAddresses = async(req,res)=>{
    try {
        const addressData = await address.find({address:{$exists:true}})
        const userData = await user.findById({_id:req.session.user._id})
        res.render('addresses',{address:addressData, userData:userData});
    } catch (error) {
        console.error(error.message)
    }
}


const loadCheckout = async(req,res)=>{
    try {
        const catData = await category.find({categoryName:{$exists:true}});
        res.render('checkout',{login:req.session.user , categoryData:catData});
    } catch (error) {
        console.error(error.message)
    }
}



module.exports = {
    loadHome,
    loadLogin,
    loadSignup,
    insertUser,
    verifyUser,
    otpLoad,
    verifyOtp,
    loadContact,
    loadAboutus,
    resendOtp,
    userLogout,
    profileLoad,
    loadProducts,
    loadProductDetails,
    forgotPassword,
    forgotPasswordOtp,
    changeForgotPassword,
    loadProfile,
    changePassword,
    editProfile,
    loadWishlist,
    loadAddresses, 
    loadCheckout
}