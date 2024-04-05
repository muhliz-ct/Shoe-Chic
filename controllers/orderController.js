const order = require('../models/orderModel');
const category = require('../models/categoryModel');
const cart = require('../models/cartModel');
const address = require('../models/addressModel');
const errorHandler = require('../middlewares/errorHandler');
const mongoose = require('mongoose');
const product = require('../models/productModel');
const { populate } = require('../models/userModel');


// load orders at user side
const loadOrder = async (req, res) => {
    try {
        const sessionUserId = req.session.user._id;

        // Find orders for the current user
        const orderData = await order.find({ userId: sessionUserId });
        console.log(orderData);

        // Iterate through each order
        for (const orderItem of orderData) {
            // Check if all products in the order are canceled
            const allProductsCanceled = orderItem.products.every(product => product.orderProductStatus === 'cancelled');
            if (allProductsCanceled) {
                // Update the order status to 'cancelled'
                await order.findOneAndUpdate(
                    { _id: orderItem._id },
                    { $set: { orderStatus: 'cancelled' } }
                );
            }
        }

        res.render('order', { orderData });

    } catch (error) {
        console.error(error.message);
        errorHandler(error, req, res);
    }
}





// placing an order at user side
const placeOrder = async (req, res) => {
    try {


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
            payment: 'COD',
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


        res.render('confirmation',{login:req.session.user , categoryData:catData});

    } catch (error) {

        console.error(error.message);

        errorHandler(error, req, res);
    }
};

// listing order details in admin side
const listOrders = async(req,res)=>{
    try {
        const orderDetails = await order.find({userId:{$exists:true}});
        res.render('orders',{orderData:orderDetails})
    } catch (error) {
        console.error(error.message);

        errorHandler(error, req, res);
    }
}



const loadOrderDetails = async(req,res)=>{
    try {
        const currentObjectId = req.query.id;
        const orderData = await order.findOne({_id:currentObjectId});

        // console.log(orderData);
        // console.log(req.query.id)
        res.render('orderDetails',{orderData})
        
    } catch (error) {
        console.error(error.message);
        
    }
}


const cancelProduct = async (req, res) => {
    try {
        const proId = req.query.id;
        const orderId = req.query.ordId;

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
            let count = 0
            orderData.products.forEach(async product => {
                if (product.productId.toString() === proId && product.orderProductStatus === 'cancelled') {
                    count++;
                    sum += product.price;
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



const adminOrderDetails = async(req,res)=>{
    try {
        const ordId = req.query.id;
        console.log(ordId);
        const orderDetails = await order.findOne({_id:ordId}).populate('userId products.productId')
        console.log(orderDetails);
        res.render('orderDetails',{orderDetails:orderDetails})
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
    adminOrderDetails
}