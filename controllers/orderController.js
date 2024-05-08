const order = require('../models/orderModel');
const category = require('../models/categoryModel');
const cart = require('../models/cartModel');
const address = require('../models/addressModel');
const errorHandler = require('../middlewares/errorHandler');
const wallet = require('../models/walletModel');
const user = require('../models/userModel')
const mongoose = require('mongoose');
const product = require('../models/productModel');
const { populate } = require('../models/userModel');
const instance = require('../config/razorPay');


// load orders at user side
const loadOrder = async (req, res) => {
    try {
        const sessionUserId = req.session.user._id;

        const catData = await category.find({categoryName:{$exists:true}});

        const Data = await cart.findOne({userId:req.session.user._id}).populate('products.productId');

        const orderData = await order.find({ userId: sessionUserId }).sort({ dateOfOrder: -1 });

        console.log(orderData);


        for (const orderItem of orderData) {

            const allProductsCanceled = orderItem.products.every(product => product.orderProductStatus === 'cancelled');
            const allProductsShipped = orderItem.products.every(product => product.orderProductStatus === 'shipped');
            const allProductsDelivered = orderItem.products.every(product => product.orderProductStatus === 'delivered');
            const allProductsReturned = orderItem.products.every(product => product.orderProductStatus === 'returned');
            const allProductsFailed = orderItem.products.every(product => product.orderProductStatus === 'Payment Failed');
            if (allProductsCanceled) {
   
                await order.findOneAndUpdate(
                    { _id: orderItem._id },
                    { $set: { orderStatus: 'cancelled' } }
                );
            }else if(allProductsShipped){
                await order.findOneAndUpdate(
                    { _id: orderItem._id },
                    { $set: { orderStatus: 'shipped' } }
                );
            }else if(allProductsDelivered){
                await order.findOneAndUpdate(
                    { _id: orderItem._id },
                    { $set: { orderStatus: 'delivered' } }
                );
            } else if(allProductsReturned){
                await order.findOneAndUpdate(
                    { _id: orderItem._id },
                    { $set: { orderStatus: 'returned' } }
                )
            }else if(allProductsFailed){
                await order.findOneAndUpdate(
                    { _id: orderItem._id },
                    { $set: { orderStatus: 'Payment Failed' } }
                )
            }
            else{
                await order.findOneAndUpdate(
                    { _id: orderItem._id },
                    { $set: { orderStatus: 'pending' } }
                );
            }
        }

        res.render('order', {login : req.session.user ,  orderData , categoryData:catData , cartData:Data});

    } catch (error) {
        console.error(error.message);
        errorHandler(error, req, res);
    }
}



// placing an order at user side
const placeOrder = async (req, res) => {
    try {
        const sessionUserId = req.session.user._id;
        const paymentMethod = req.body.paymentmethod;
        const catData = await category.find({is_listed:true})
        const userId = req.session.user._id;

        const cartData = await cart.findOne({ userId: userId });
        const userAddress = await address.findOne({ userId: userId, 'address.status': true });
        const wallet = await wallet.findOne({userId:userId});

        if(paymentMethod == 'wallet'){
            const walletData = await wallet.findOne({userId:sessionUserId});
            if(walletData.walletBalance == 0){
                res.redirect('/checkout');
            }else if(wallet.walletBalance < cartData.totalCartPrice){
                res.redirect('/checkout');
            }else{
                await wallet.findOneAndUpdate({userId:sessionUserId},{$inc:{walletBalance:-cartData.totalCartPrice},$push:{transaction:{amount:cartData.totalCartPrice,Action:'Debit'}}},{new:true,upsert:true})
            }
        }

        if (!userAddress) {
            return res.status(400).send('No active address found for the user');
        }

        const newOrder = new order({
            userId: userId,

            orderDiscount: cartData.totalCartDiscount,

            couponDiscount:cartData.couponDiscount,

            orderAmount:cartData.totalCartPrice,
            payment: paymentMethod,
            deliveryAddress: userAddress.address[0],
            products: cartData.products.map(product => ({
                productId: product.productId,
                quantity: product.quantity,
                price: product.price,
                orderProductStatus: 'pending' 
            }))
        });

        await newOrder.save();

       if(newOrder){

         newOrder.products.forEach(async(e) => {
            const pro = await product.findOne({_id:e.productId});

            // console.log(pro);
            const newStock = pro.quantity - e.quantity;

            await product.findOneAndUpdate({_id:e.productId},{$set:{quantity:newStock}});
            
        });
       }


        await cart.findOneAndDelete({ userId: userId });


        res.redirect('/confirmation');

    } catch (error) {

        console.error(error.message);

        errorHandler(error, req, res);
    }
};

//load confirmation
const loadConfirmation = async(req,res)=>{
    try {
        res.render('confirmation')
    } catch (error) {
        console.error(error.message)
    }
}

//plancing order using razorpay
const placeOrderRazor = async(req,res)=>{
    try {
        const currentSessionId = req.body.userId;

        const CurrentUser = await user.findOne({_id:currentSessionId});

        const amount = req.body.amount * 100
            const options = {
                amount: amount,
                currency: "INR",
                receipt: 'absharameen625@gmail.com'
            }
            instance.orders.create(options, (err, order) => {
                if (!err) {
                    res.send({
                        succes: true,
                        msg: 'ORDER created',
                        order_id: order.id,
                        amount: amount,
                        key_id: process.env.RAZORPAY_IDKEY,
                        name: CurrentUser.name,
                        email: CurrentUser.email
                    })
                } else {
                    console.error("Error creating order:", err);
                    res.status(500).send({ success: false, msg: "Failed to create order" });
                }
            })
        
        
    } catch (error) {
        console.error(error.message)
    }
}

//failed razorpay retry form orders on user side
const failedPaymentRetry = async(req,res)=>{
    try {
        const currentSessionId = req.session.user._id;

        const CurrentUser = await user.findOne({_id:currentSessionId});

        const amount = req.body.amount * 100
            const options = {
                amount: amount,
                currency: "INR",
                receipt: 'absharameen625@gmail.com'
            }
            instance.orders.create(options, (err, order) => {
                if (!err) {
                    res.send({
                        succes: true,
                        msg: 'ORDER created',
                        order_id: order.id,
                        amount: amount,
                        key_id: process.env.RAZORPAY_IDKEY,
                        name: CurrentUser.name,
                        email: CurrentUser.email
                    })
                } else {
                    console.error("Error creating order:", err);
                    res.status(500).send({ success: false, msg: "Failed to create order" });
                }
            })
    } catch (error) {
        console.error(error.message)
    }
}

//changing status when payment is success from order details
const changeStatusRetry = async(req,res)=>{
    try {

        console.log('reached changeStatusRetry');

        const orderId = req.body.ordId;

        const changeStatus = await order.findOneAndUpdate({_id:orderId},{$set:{'products.$[].orderProductStatus': 'pending'}});

        if(changeStatus){
            res.send({success:true})
        }

        
    } catch (error) {
        console.error(error.message)
    }
}

//razor pay failure
const razorFailure = async(req,res)=>{
    try {
        console.log('hi this is failed online payment route');

        const sessionUserId = req.session.user._id;
        const paymentMethod = req.body.paymentmethod;
        console.log(paymentMethod,);
        const catData = await category.find({is_listed:true})
        const userId = req.session.user._id;

        const cartData = await cart.findOne({ userId: userId });
        const userAddress = await address.findOne({ userId: userId, 'address.status': true });

        if (!userAddress) {
            return res.status(400).send('No active address found for the user');
        }


        const newOrder = new order({
            userId: userId,

            orderAmount: cartData.totalCartPrice,
            payment: paymentMethod,
            deliveryAddress: userAddress.address[0],
            products: cartData.products.map(product => ({
                productId: product.productId,
                quantity: product.quantity,
                price: product.price,
                orderProductStatus: 'Payment Failed' 
            }))
        });

        await newOrder.save();


        if(newOrder){

            newOrder.products.forEach(async(e) => {
               const pro = await product.findOne({_id:e.productId});
   
               // console.log(pro);
               const newStock = pro.quantity - e.quantity;
   
               await product.findOneAndUpdate({_id:e.productId},{$set:{quantity:newStock}});
               
           });
          }

          await cart.findOneAndDelete({ userId: userId });

          res.redirect('/');

    } catch (error) {
        console.error(error.message)
    }
}

//list orders in admin side
const listOrders = async(req,res)=>{
    try {
        const orderDetails = await order.find({userId:{$exists:true}}).sort({dateOfOrder:-1}).populate('products.productId');

        for (const orderItem of orderDetails) {

            const allProductsCanceled = orderItem.products.every(product => product.orderProductStatus === 'cancelled');
            const allProductsShipped = orderItem.products.every(product => product.orderProductStatus === 'shipped');
            const allProductsDelivered = orderItem.products.every(product => product.orderProductStatus === 'delivered');
            const allProductsReturned = orderItem.products.every(product => product.orderProductStatus === 'returned');
            const returnRequested = orderItem.products.some(product => product.orderProductStatus === 'returned requested');
            const allProductsFailed = orderItem.products.every(product => product.orderProductStatus === 'Payment Failed');
            if (allProductsCanceled) {
   
                await order.findOneAndUpdate(
                    { _id: orderItem._id },
                    { $set: { orderStatus: 'cancelled' } }
                );
            }else if(allProductsShipped){
                await order.findOneAndUpdate(
                    { _id: orderItem._id },
                    { $set: { orderStatus: 'shipped' } }
                );
            }else if(allProductsDelivered){
                await order.findOneAndUpdate(
                    { _id: orderItem._id },
                    { $set: { orderStatus: 'delivered' } }
                );
            }else if(allProductsReturned){
                await order.findOneAndUpdate(
                    { _id: orderItem._id },
                    { $set: { orderStatus: 'returned' } }
                );
            } else if(allProductsFailed){
                await order.findOneAndUpdate(
                    { _id: orderItem._id },
                    { $set: { orderStatus: 'Payment Failed' } }
                )
            }  else if(returnRequested){
                await order.findOneAndUpdate(
                    { _id: orderItem._id },
                    { $set: { orderStatus: 'return requested' } }
                )
            }
            else{
                await order.findOneAndUpdate(
                    { _id: orderItem._id },
                    { $set: { orderStatus: 'pending' } }
                );
            }
           
        }
        console.log(orderDetails);
        res.render('orders',{orderData:orderDetails})
    } catch (error) {
        console.error(error.message);

        errorHandler(error, req, res);
    }
}


//load order details on user side
const loadOrderDetails = async(req,res)=>{
    try {
        const currentObjectId = req.query.id;

        const Data = await cart.findOne({userId:req.session.user._id}).populate('products.productId');

        const categoryData = await category.find({categoryName:{$exists:true}});

        const orderDetails = await order.findOne({_id:currentObjectId}).populate('userId products.productId');

         res.render('orderDetails',{login:req.session.user , orderDetails:orderDetails , categoryData , cartData:Data});
        
    } catch (error) {
        console.error(error.message);
        
    }
}


/*const cancelProduct = async (req, res) => {
    try {
        const proId = req.query.id;
        const orderId = req.query.ordId;
        

        const productData = await product.findOne({_id:proId});

        let currentQuantity = productData.quantity;

        // Update product status to 'cancelled'
        const cancelProductUpdate = await order.findOneAndUpdate(
            { _id: orderId, 'products.productId': proId },
            { $set: { 'products.$.orderProductStatus': 'cancelled'} }
        );

        if (cancelProductUpdate) {
            // Fetch the updated order data
            const orderData = await order.findOne({ _id: orderId });
            
            // Calculate the total price of cancelled products and update the order amount
            let sum = 0;
            let count = 0;
            let quantity = 0;
            orderData.products.forEach(async product => {
                if (product.productId.toString() === proId && product.orderProductStatus === 'cancelled') {
                    count++;
                    sum += product.price;
                    quantity += product.quantity;
                    await order.findOneAndUpdate(
                        { _id: orderId, 'products.productId': proId },
                        { $set: { 'products.$.price': 0} }
                    );
                }
            });

            console.log(count);

            // Update the order amount
            const newTotalOrderAmount = orderData.orderAmount - sum;
            if(count == orderData.products.lenght){
                await order.findOneAndUpdate(
                    { _id: orderId },
                    { $set: { orderAmount: newTotalOrderAmount, orderStatus: 'cancelled' } }
                );
            }else{
                await order.findOneAndUpdate(
                    { _id: orderId },
                    { $set: { orderAmount: newTotalOrderAmount } }
                );
            }

            currentQuantity += quantity;

            await product.findOneAndUpdate({_id:proId},{$set:{quantity:currentQuantity}});

            console.log('Product cancelled successfully');
            res.send(true);
        } else {
            console.log('Some error occurred while cancelling the product');
            res.send(false);
        }
    } catch (error) {
        console.error('Error cancelling product:', error);
        res.send(false);
    }
};*/

//cancel product user side
const cancelProduct = async (req, res) => {
    try {

        console.log('reached cancel');
        const proId = req.query.id;
        const orderId = req.query.ordId;

        const productData = await product.findOne({ _id: proId });

        let currentQuantity = productData.quantity;

        
        const cancelProductUpdate = await order.findOneAndUpdate(
            { _id: orderId, 'products.productId': proId },
            { $set: { 'products.$.orderProductStatus': 'cancel' } }
        );

        if (cancelProductUpdate) {
            
            const orderData = await order.findOne({ _id: orderId });

           
            let sum = 0;
            let quantity = 0;
            orderData.products.forEach(async (product) => {
                if (product.productId.toString() === proId && product.orderProductStatus === 'cancel') {
                    sum += product.price * product.quantity;
                    quantity += product.quantity;
                    const cancelProductUpdate = await order.findOneAndUpdate(
                        { _id: orderId, 'products.productId': proId },
                        { $set: { 'products.$.orderProductStatus': 'cancelled' } }
                    );
                }
            });

            
            // const newTotalOrderAmount = orderData.orderAmount - sum;
            // await order.findOneAndUpdate(
            //     { _id: orderId },
            //     { $set: { orderAmount: newTotalOrderAmount } }
            // );

            currentQuantity += quantity;

            await product.findOneAndUpdate({ _id: proId }, { $set: { quantity: currentQuantity } });

            console.log('Product cancelled successfully');
            res.send(true);
        } else {
            console.log('Some error occurred while cancelling the product');
            res.send(false);
        }
    } catch (error) {
        console.error('Error cancelling product:', error);
        res.send(false);
    }
};

//return product user side
const returnProduct = async(req,res)=>{
    try {

        const proId = req.query.id;
        const orderId = req.query.ordId;

        const sessionUserId = req.session.user._id;

        const reasonForReturn = req.body.reason;

        console.log(reasonForReturn);

        console.log(proId , orderId);
        

        const productData = await product.findOne({_id:proId});

        let currentQuantity = productData.quantity;


        const returnProductUpdate = await order.findOneAndUpdate(
            { _id: orderId, 'products.productId': proId },
            { $set: { 'products.$.orderProductStatus': 'returned requested' , 'products.$.reasonOfReturn':reasonForReturn} }
        );


        if (returnProductUpdate) {
            // Fetch the updated order data
            const orderData = await order.findOne({ _id: orderId });
            
            // Calculate the total price of cancelled products and update the order amount
            let sum = 0;
            let count = 0;
            let quantity = 0;
            orderData.products.forEach(async product => {
                if (product.productId.toString() === proId && product.orderProductStatus == 'returned') {
                    count++;
                    sum += product.price;
                    quantity += product.quantity;
                    await order.findOneAndUpdate(
                        { _id: orderId, 'products.productId': proId },
                        { $set: { 'products.$.price': 0} }
                    );
                }
            });

            const newTotalOrderAmount = orderData.orderAmount - sum;
            if(count == orderData.products.length){
                await order.findOneAndUpdate(
                    { _id: orderId },
                    { $set: { orderAmount: newTotalOrderAmount, orderStatus: 'return requested'} }
                );
            }else{
                await order.findOneAndUpdate(
                    { _id: orderId },
                    { $set: { orderAmount: newTotalOrderAmount , orderStatus:'return requested' } }
                );
            }

            currentQuantity += quantity;

            await product.findOneAndUpdate({_id:proId},{$set:{quantity:currentQuantity}});

            console.log('return requested');
            res.send(true);
        }

       
        
    } catch (error) {
        console.error(error.message)
    }
}


//load order details on admin side
const adminOrderDetails = async(req,res)=>{
    try {
        const ordId = req.query.id;

        // console.log(ordId);

        const orderDetails = await order.findOne({_id:ordId}).populate('userId products.productId');

        // console.log(orderDetails);

        res.render('orderDetails',{orderDetails:orderDetails});

    } catch (error) {

        console.error(error.message);
        
    }
}

//admin side order handling
const adminOrderHandler = async(req,res)=>{
    try {

        let changeOrderStatus;
        // console.log(req.body);

        const ordId = req.body.ordId;

        const productId = req.body.proId;

        const value = req.body.val;

        const reason = req.body.reason;

        const qty = req.body.q;

        console.log(ordId , productId , value , reason);

        if(value == 'Approve Return' && reason != 'product_defect'){

             changeOrderStatus = await order.findOneAndUpdate({_id:ordId , 'products.productId':productId},{$set:{'products.$.orderProductStatus':'return approved'}},{new:true});

             const orderData = await order.findOne({_id:ordId});
             console.log(orderData);

             if(changeOrderStatus){

                 orderData.products.forEach(async(elem)=>{
                     if(orderData.payment == 'razorpay' && elem.orderProductStatus == 'return approved'){
                        console.log('reached here');
                         await wallet.findOneAndUpdate({userId:orderData.userId},{$inc:{walletBalance:elem.price},$push:{transaction:{amount:elem.price,Action:'Credit'}}},{new:true,upsert:true});
                         await order.findOneAndUpdate({_id:ordId , 'products.productId':productId},{$set:{'products.$.orderProductStatus':'returned'}},{new:true});
                         await product.findOneAndUpdate({_id:productId},{$inc:{quantity:qty}});
                        }else{
                            await order.findOneAndUpdate({_id:ordId , 'products.productId':productId},{$set:{'products.$.orderProductStatus':'returned'}},{new:true});
                            await product.findOneAndUpdate({_id:productId},{$inc:{quantity:qty}});
                        }
                    })
                }





        }else if(value == 'Approve Return' && reason == 'product_defect'){
            changeOrderStatus = await order.findOneAndUpdate({_id:ordId , 'products.productId':productId},{$set:{'products.$.orderProductStatus':'return approved'}},{new:true});

             const orderData = await order.findOne({_id:ordId});
             console.log(orderData);

             if(changeOrderStatus){

                 orderData.products.forEach(async(elem)=>{
                     if(orderData.payment == 'razorpay' && elem.orderProductStatus == 'return approved'){
                        console.log('reached here');
                         await wallet.findOneAndUpdate({userId:orderData.userId},{$inc:{walletBalance:elem.price},$push:{transaction:{amount:elem.price,Action:'Credit'}}},{new:true,upsert:true});
                         await order.findOneAndUpdate({_id:ordId , 'products.productId':productId},{$set:{'products.$.orderProductStatus':'returned'}},{new:true});
                        }else{
                            await order.findOneAndUpdate({_id:ordId , 'products.productId':productId},{$set:{'products.$.orderProductStatus':'pending'}},{new:true});
                        }
                    })
                }
        }
        else{
             changeOrderStatus = await order.findOneAndUpdate({_id:ordId , 'products.productId':productId},{$set:{'products.$.orderProductStatus': value}},{new:true});
        }


        // await order.findOneAndUpdate({_id:ordId},{$set:{orderStatus:value}});

        // console.log(changeOrderStatus);

        if(changeOrderStatus){
            res.send(true);
        }else{
            console.log('some error occured while changing the order status');
        }
        
    } catch (error) {
        console.error(error.message)
    }
}


const loadInvoice = async(req,res)=>{
    try {

        const ordId = req.params.id;
        console.log(ordId);
        const orderData = await order.findOne({_id:ordId}).populate('userId products.productId');
        res.render('invoice',{orderData})
    } catch (error) {
        console.error(error.message)
    }
}


module.exports = {
    loadOrder,
    placeOrder,
    listOrders,
    loadOrderDetails,
    cancelProduct,
    adminOrderDetails,
    adminOrderHandler,
    returnProduct,
    placeOrderRazor,
    razorFailure,
    failedPaymentRetry,
    changeStatusRetry,
    loadInvoice,
    loadConfirmation
}