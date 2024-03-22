const user = require('../models/userModel');
const Otp = require('../models/otpModel');
const category = require('../models/categoryModel');
const product = require('../models/productModel');
const brand = require('../models/brandModel');
const bcrypt = require('bcrypt');




const adminLoginLoad = async (req,res)=>{
    try {
        res.render('login');
    } catch (error) {
        console.error(error.message);
    }
}


const verifyAdmin = async(req,res)=>{
    try {
        const admin = req.body.email;
        const pass = req.body.pass;
        console.log(admin,pass);
        const adminData = await user.findOne({email:admin})
        console.log(adminData);
        if (adminData) {
            const passwordMatch = await bcrypt.compare(pass,adminData.password);
            console.log(passwordMatch);
            if(passwordMatch&&adminData.is_admin==true){
                req.session.admin_id=adminData.id;
                res.redirect('/admin/dashboard');
            }else{
                console.error(error.message);
            }
        } else {
            res.render('login',{message : 'you are not admin !!!'});
        }
    } catch (error) {
        console.error(error.message);
    }
}


const adminLoadHome = async(req,res)=>{
    if(req.session.admin_id){
        try {
            res.render('dashbord');
        } catch (error) {
            console.error(error.message);
        }
    }
}

const adminUserListLoad = async(req,res)=>{
    try {
        if(req.session.admin_id){
            const userData = await user.find({is_admin:false});
            res.render('userlist',{users:userData})
        }
    } catch (error) {
        console.error(error.message);
    }
}



const blockUser = async(req,res)=>{
    try {
        let userId = req.query.id
        const userdata = await user.find({is_admin:false})
        const findUser = await user.findOneAndUpdate({_id:userId},{$set:{is_blocked:true}})
        res.render('userlist',{users:userdata});
    } catch (error) {
        console.error(error.message);
    }
}

const unblockUser = async(req,res)=>{
    try {
        const unblockUserId = req.query.id
        const userdata = await user.find({is_admin:false})
        const findUser = await user.findOneAndUpdate({_id:unblockUserId},{$set:{is_blocked:false}});
        if (findUser) {
            res.render('userlist',{users:userdata});
        } else {
            console.log('some error has occured');
        }
    } catch (error) {
        console.error(error.message);
    }
}


module.exports = {
    adminLoginLoad,
    verifyAdmin,
    adminLoadHome,
    adminUserListLoad,
    blockUser,
    unblockUser,
}