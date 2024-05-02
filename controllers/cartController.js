const product = require('../models/productModel');
const cart = require('../models/cartModel');
const category = require('../models/categoryModel');
const errorHandler = require('../middlewares/errorHandler');


//load Cart 
const loadCart = async(req, res) => {

    try {
        const catData = await category.find({is_listed:true});

        if(req.session.user){

            const cartData = await cart.findOne({userId:req.session.user._id}).populate('products.productId');

            if(catData && cartData && cartData.products && cartData.products.length > 0){



                const total = cartData.products.reduce((acc, product) => {
                    const price = Number(product.price);
                    return isNaN(price) ? acc : acc + price;
                }, 0);


                const discountTotal = cartData.products.reduce((acc, product) => {
                    const price = Number(product.discountedAmount);
                    return isNaN(price) ? acc : acc + price;
                }, 0);

                const totalCartAmount = await cart.findOneAndUpdate({userId:req.session.user._id},{$set:{totalCartPrice:total , totalCartDiscount:discountTotal}},{new:true ,upsert:true});

                res.render('cart',{login:req.session.user , categoryData:catData , cartData , totalPrice:totalCartAmount.totalCartPrice  , totalDiscount:totalCartAmount.totalCartDiscount});
            } else {

                res.render('cart',{login:req.session.user , categoryData:catData , totalPrice:0});

            }
        } else {

            res.render('cart',{categoryData:catData});

        }

    } catch (error) {

        console.error(error.message);
        errorHandler(error, req, res)

    }
}

// add items to cart
const addToCart = async (req, res) => {
    try {

        let totalAmount = 0;

        let totalDiscountAmount = 0;

        const productId = req.query.id;

        const currUserId = req.session.user._id;

        const quantity = +req.body.quantity;

        const cartProduct = await product.findOne({ _id: productId });

        const existCartProduct = await cart.findOne({ userId: currUserId, 'products.productId': productId });

        if (!existCartProduct) {

            if(cartProduct.offerprice > 0){
                 totalAmount = quantity * cartProduct.offerprice;
                 totalDiscountAmount = quantity * cartProduct.discountAmount;
            }else{
                 totalAmount = quantity * cartProduct.price;    
                 totalDiscountAmount = quantity * cartProduct.discountAmount;
            }


            await cart.findOneAndUpdate(
                { userId: currUserId },
                {
                    $addToSet: {
                        products: {
                            productId: productId,
                            price: totalAmount,
                            quantity: quantity,
                            discountedAmount:totalDiscountAmount,
                        }
                    },
                },
                { new: true, upsert: true }
            );

            res.send({ success: true });

        } else {

            res.send({ exist: true });

        }
    } catch (error) {
        console.error(error.message);

        errorHandler(error, req, res);
        
    }
};

// delete items from cart
const deleteItemFromCart = async(req,res)=>{
    try {
        const itemToBeDeletedId = req.query.id;

        const currUserId = req.session.user._id;

        // console.log(itemToBeDeletedId);

        const removeCart = await cart.updateOne({userId:currUserId},{$pull:{products:{productId:itemToBeDeletedId}}});

        if(removeCart){

            // console.log('item removed successfully :)');

            res.send(true);

        }else{

            console.log('some error has occured :(');
            
        }

    } catch (error) {

        console.error(error.message);

        errorHandler(error, req, res);

    }
}

// edit items in cart
const editCart = async(req,res)=>{
    try {

        let newValue;
        let newDis;

        const productIdd = req.body.proId;

        const cartIdd = req.body.cartId;

        const quantityy = req.body.quantity;

        const productData = await product.findById({_id : productIdd})

        // console.log(productData);

        if(productData.offerprice > 0){
            newValue = productData.offerprice * quantityy;
            newDis = productData.discountAmount * quantityy;
        }else{
             newValue = productData.price * quantityy;
             newDis = productData.discountAmount * quantityy;
        }
        
  
        const updatedCart = await cart.findOneAndUpdate({ _id: cartIdd, "products.productId": productIdd }, { $set: { "products.$.price": newValue, "products.$.quantity": quantityy, "products.$.discountedAmount":newDis }, }, { new: true });

        const totalCartPricee = updatedCart.products.reduce((acc, product) => acc + product.price, 0);
        
        const totalCartDisc = updatedCart.products.reduce((acc, product) => acc + product.discountedAmount, 0);
  
        await cart.findOneAndUpdate({ _id: cartIdd }, { $set: { totalCartPrice: totalCartPricee , totalCartDiscount:totalCartDisc } });

        res.send({ success: totalCartPricee });
        
    } catch (err) {

        console.log(err.message + "cart edit");

        errorHandler(error, req, res);
        
    }
}
module.exports={
    loadCart,
    addToCart,
    deleteItemFromCart,
    editCart
}