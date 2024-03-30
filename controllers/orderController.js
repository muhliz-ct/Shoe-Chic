const order = require('../models/orderModel');
const category = require('../models/categoryModel');
const cart = require('../models/cartModel');
const address = require('../models/addressModel');
const errorHandler = require('../middlewares/errorHandler');
const product = require('../models/productModel')


// load orders at user side
const loadOrder = async(req,res)=>{
    try {
        const orderData = await order.find({userId:req.session.user._id});

        // console.log(orderData);

        res.render('order',{orderData});

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





module.exports = {
    loadOrder,
    placeOrder,
    listOrders
}