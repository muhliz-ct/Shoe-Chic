const express = require('express');
const userRoute = express();


userRoute.set('view engine','ejs');
userRoute.set('views','./views/user');


const auth = require('../middlewares/auth');

const userAuth = require('../middlewares/userAuth')


const userController = require('../controllers/usercontroller');

const cartController = require('../controllers/cartController')

userRoute.get('/',auth.checkBlockUser,userController.loadHome);//home page route


userRoute.get('/login',userAuth.isLogin,userController.loadLogin);//login route
userRoute.post('/login',userController.verifyUser);


userRoute.get('/signup',userAuth.isLogin,userController.loadSignup);//signUp page route
userRoute.post('/signup',userController.insertUser);//Insert user

userRoute.get('/otpVerification',auth.checkBlockUser,userController.otpLoad);//otp load
userRoute.post('/resOtp',userController.verifyOtp);//verify otp

userRoute.get('/contact',auth.checkBlockUser,userController.loadContact);//contact page load
userRoute.get('/about',auth.checkBlockUser,userController.loadAboutus);//AboutUs page load

userRoute.get('/profile',userController.loadProfile);
userRoute.post('/changePassword',userController.changePassword);
userRoute.post('/editProfile',userController.editProfile);
userRoute.get('/wishlist',userController.loadWishlist);
userRoute.get('/address',userController.loadAddresses)
userRoute.post('/logout',userController.userLogout);//Logout

userRoute.get('/profile',auth.checkBlockUser,userController.profileLoad);//profile


userRoute.get('/resendOtp',auth.checkBlockUser,userController.resendOtp);//resend otp


userRoute.get('/product',userController.loadProducts);
userRoute.get('/productdetails',userController.loadProductDetails);


userRoute.get('/cart',cartController.loadCart);
userRoute.post('/addtocart',cartController.addToCart);
userRoute.post('/deletecart',cartController.deleteItemFromCart)


userRoute.get('/forgotpassword',userController.forgotPassword);
userRoute.post('/forgotpasswordotp',userController.forgotPasswordOtp);
userRoute.post('/passwordVerify',userController.changeForgotPassword);


userRoute.get('/checkout',userController.loadCheckout)












module.exports = userRoute;