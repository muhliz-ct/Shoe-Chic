const express = require('express');
const adminRoute = express();


adminRoute.set('view engine','ejs');
adminRoute.set('views','./views/admin');



const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const brandController = require('../controllers/brandController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController');
const couponController = require('../controllers/couponController');
const reportController = require('../controllers/reportController');
const dashboardController = require('../controllers/dashboard')
const multer = require('../middlewares/multer');
const adminAuth = require('../middlewares/adminAuth');




adminRoute.get('/',adminAuth.isLogout,adminController.adminLoginLoad);
adminRoute.post('/',adminController.verifyAdmin);
adminRoute.get('/dashboard',adminAuth.isLogin,dashboardController.loadDahboard);
adminRoute.put('/monthChart',adminAuth.isLogin,dashboardController.monthChart);
adminRoute.put('/chartYear',adminAuth.isLogin,dashboardController.chartYear);
adminRoute.get('/users',adminAuth.isLogin,adminController.adminUserListLoad);



adminRoute.get('/category',adminAuth.isLogin,categoryController.loadCatogeries)
adminRoute.post('/addCategory',adminAuth.isLogin,categoryController.addCategory)
adminRoute.get('/list',adminAuth.isLogin,categoryController.listCategory);
adminRoute.get('/unlist',adminAuth.isLogin,categoryController.unlistCategory);
adminRoute.post('/editCategory',adminAuth.isLogin,categoryController.editCategory);


adminRoute.post('/addBrand',adminAuth.isLogin,brandController.addnewBrand);



adminRoute.get('/block',adminAuth.isLogin,adminController.blockUser);
adminRoute.get('/unblock',adminAuth.isLogin,adminController.unblockUser);


adminRoute.get('/products',adminAuth.isLogin,productController.loadProducts);
adminRoute.get('/addProducts',adminAuth.isLogin,productController.loadAddProducts);
adminRoute.post('/addProducts',multer.upload.array('images',3),productController.addProducts);
adminRoute.get('/productlist',adminAuth.isLogin,productController.listProduct);
adminRoute.get('/productunlist',adminAuth.isLogin,productController.unlistProduct);
adminRoute.get('/deleteproduct',adminAuth.isLogin,productController.deleteProduct);
adminRoute.get('/productedit',productController.loadEditProduct);
adminRoute.post('/producteditt', multer.upload.fields([{ name: 'image0', maxCount: 1 }, { name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }]), productController.editProduct);


adminRoute.get('/orders',orderController.listOrders);
adminRoute.get('/orderDtails',orderController.adminOrderDetails);


adminRoute.put('/orderStatusHandling',orderController.adminOrderHandler);

adminRoute.get('/coupons',couponController.loadCoupon);
adminRoute.post('/addCoupon',multer.upload.array('couponImage',1),couponController.addCoupon);
adminRoute.post('/deleteCoupon',couponController.deleteCoupon);

adminRoute.get('/salesReport/:id',reportController.loadReport);
adminRoute.put('/customReport',reportController.customReport)











module.exports = adminRoute