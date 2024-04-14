const coupon = require('../models/coupanModel');


const loadCoupon = async (req,res)=>{
    const coupons = await coupon.find({status:true});
    res.render('coupon',{coupons});
}


const addCoupon = async(req,res)=>{
    try {
        const data = req.body
        console.log(req.body.couponName , req.body.couponCode , req.body.discount , req.body.minPrice , req.body.maxPrice);
        const couponPic = req.files[0].filename

        const newCoupon =await coupon.create({
            couponName:req.body.couponName,
            couponCode:req.body.couponCode,
            discount:req.body.discount,
            from:req.body.minPrice,
            to:req.body.maxPrice,
            coupanImage:couponPic
        });

        console.log(newCoupon);
        if(newCoupon){
            res.redirect('/admin/coupons');
        }
    } catch (error) {
        console.error(error.message)
    }
}












module.exports = {
    loadCoupon,
    addCoupon
}