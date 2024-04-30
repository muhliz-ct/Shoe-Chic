const cart = require('../models/cartModel');
const coupon = require('../models/coupanModel');
const user = require('../models/userModel');
const category = require('../models/categoryModel');
const mongoose = require('mongoose');

//load coupon on admin side
const loadCoupon = async (req,res)=>{
    const coupons = await coupon.find({status:true});
    res.render('coupon',{coupons});
}

//add coupon on admin side
const addCoupon = async (req, res) => {
    try {
        const data = req.body;
        const userIds = await user.find({}, '_id');

        // Extracting only the _id values from userIds array
        const userIdArray = userIds.map(user => user._id);

        console.log(userIdArray);
        console.log(req.body.couponName, req.body.couponCode, req.body.discount, req.body.minPrice, req.body.maxPrice);
        
        const couponPic = req.files[0].filename;

        const newCoupon = await coupon.create({
            couponName: req.body.couponName,
            couponCode: req.body.couponCode,
            discount: req.body.discount,
            from: req.body.minPrice,
            to: req.body.maxPrice,
            coupanImage: couponPic,
            userId: userIdArray // Assigning the array of _id values
        });

        console.log(newCoupon);
        if (newCoupon) {
            res.redirect('/admin/coupons');
        }
    } catch (error) {
        console.error(error.message);
    }
};



//load coupons in user side

const loadCouponUser = async(req,res)=>{
    try {

        const Data = await cart.findOne({userId:req.session.user._id}).populate('products.productId');

        const catData = await category.find({categoryName:{$exists:true}});

        const sessionUserId = req.session.user._id;

        const objectId =new mongoose.Types.ObjectId(sessionUserId);

        // console.log(sessionUserId);

        const couponData = await coupon.find({userId:objectId , expiryDate:{$gt:Date.now()}});

        // console.log(couponData);

        res.render('coupon',{login:req.session.user , couponData , categoryData:catData , cartData:Data})

    } catch (error) {

        console.error(error.message);

    }
}



const applyCoupon = async(req,res)=>{
    try {
        const couponCode = req.body.in;
        console.log();
        if(couponCode.length < 24 || couponCode.length > 24){
            res.send({not:true});
        }
        const data = await coupon.findOne({_id:couponCode});
        console.log(data);
        if(data){
            res.send({success:true});
        }
    } catch (error) {
        console.error(error.message)
    }
}


const couponUse = async(req,res)=>{
    try {
        let newCartPrice;

        const sessionUserId = req.session.user._id;
        const objectId =new mongoose.Types.ObjectId(sessionUserId);
        const couponCode = req.body.coupon;
        // console.log(couponCode);
        const cartData = await cart.findOne({userId:sessionUserId});
        const couponData = await coupon.findOne({_id:couponCode});
        const disc = couponData.discount;
        const maxDiscount = disc * 10;
        const currentAmount = cartData.totalCartPrice;
        if((currentAmount * (disc / 100)) > maxDiscount){
            newCartPrice = currentAmount - maxDiscount;
        }else{
            newCartPrice = currentAmount - (currentAmount * (disc / 100))
        }
        await cart.findOneAndUpdate({userId:sessionUserId},{$set:{totalCartPrice:newCartPrice}});
        await coupon.findOneAndUpdate({_id:couponCode},{$pull:{userId:objectId}});

        res.redirect('/checkout')
    } catch (error) {
        console.error(error.message)
    }
}

//delete coupon at admin side
const deleteCoupon = async(req,res)=>{
    try {
        console.log('reached delete coupon');
        const couponId = req.body.coupId;
        const couponDelete = await coupon.findOneAndDelete({_id:couponId});
        console.log(couponDelete);
        if(couponDelete){
            res.send({success:true});
        }
    } catch (error) {
        console.error(error.message)
    }
}








module.exports = {
    loadCoupon,
    addCoupon,
    loadCouponUser,
    applyCoupon,
    couponUse,
    deleteCoupon
}