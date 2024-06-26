const express = require('express');
const userRoute = express();


userRoute.set('view engine','ejs');
userRoute.set('views','./views/user');


const auth = require('../middlewares/auth');

const userAuth = require('../middlewares/userAuth');

const googleLogin = require('../passport');


const userController = require('../controllers/usercontroller');

const cartController = require('../controllers/cartController');

const addressController = require('../controllers/addressController');

const orderController = require('../controllers/orderController');

const productController = require('../controllers/productController');

const whishlistController = require('../controllers/whishlistController');

const walletController = require('../controllers/walletController');

const couponController = require('../controllers/couponController');

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
// userRoute.get('/wishlist',userController.loadWishlist);
userRoute.get('/address',userController.loadAddresses)
userRoute.post('/logout',userController.userLogout);//Logout

userRoute.get('/profile',auth.checkBlockUser,userController.profileLoad);//profile


userRoute.get('/resendOtp',auth.checkBlockUser,userController.resendOtp);//resend otp


userRoute.get('/product',userController.loadProducts);
userRoute.get('/productdetails',userController.loadProductDetails);


userRoute.get('/cart',cartController.loadCart);
userRoute.post('/addtocart',cartController.addToCart);
userRoute.post('/deletecart',cartController.deleteItemFromCart);
userRoute.put('/cartUpdate',cartController.editCart);

userRoute.get('/forgotpassword',userController.forgotPassword);
userRoute.post('/forgotpasswordotp',userController.forgotPasswordOtp);
userRoute.post('/passwordVerify',userController.changeForgotPassword);


userRoute.get('/checkout',userController.loadCheckout);
userRoute.post('/verifyChekutAdss',addressController.saveAddress);
userRoute.put('/couponApply',couponController.applyCoupon);
userRoute.post('/couponUse',couponController.couponUse);



userRoute.post('/addaddresses',addressController.addAddress);
userRoute.post('/deleteAdd',addressController.deleteAddress);
userRoute.post('/verifyEditAddress',addressController.editCurrentAddress)
userRoute.put('/editAddress',addressController.editAddress);
userRoute.post('/chooseAddress',addressController.chooseAddress);



userRoute.post('/getOrder',orderController.placeOrder);
userRoute.get('/confirmation',orderController.loadConfirmation)
userRoute.post('/razor',orderController.placeOrderRazor);
userRoute.post('/razorFailed',orderController.razorFailure);
userRoute.post('/failedPaymentRetry',orderController.failedPaymentRetry)
userRoute.post('/changeStatusRetry',orderController.changeStatusRetry)


userRoute.get('/orders',orderController.loadOrder);


userRoute.get('/orderDetails',orderController.loadOrderDetails);

userRoute.get('/cancelProduct',orderController.cancelProduct);
userRoute.post('/returnProduct',orderController.returnProduct)


userRoute.get('/wishlist',whishlistController.loadWishlist);


userRoute.get('/addToWhishlist',whishlistController.addToWishList);

userRoute.get('/removeFromWishlist',whishlistController.removeFromWishlist);



userRoute.get('/wallet',walletController.loadWallet);
userRoute.post('/addMoneyWallet',walletController.addMoneyWallet);
userRoute.put('/walletAdd',walletController.Recharge);


userRoute.get('/coupon',couponController.loadCouponUser)


userRoute.get('/invoice/:id',orderController.loadInvoice);

//Login With Google
userRoute.get('/auth/google',userAuth.isLogin, googleLogin.googleAuth);


userRoute.get("/auth/google/callback",userAuth.isLogin, googleLogin.googleCallback, googleLogin.setupSession);


userRoute.put('/searchProduct',productController.searchProduct);
userRoute.put('/advancedSearch',productController.advancedSearch);



















module.exports = userRoute;