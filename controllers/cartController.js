const product = require('../models/productModel');
const cart = require('../models/cartModel');
const category = require('../models/categoryModel');



const loadCart = async(req, res) => {
    try {
        const catData = await category.find({is_listed:true});
        if(req.session.user){
            const cartData = await cart.findOne({userId:req.session.user._id}).populate('products.productId');
            if(catData && cartData && cartData.products && cartData.products.length > 0){
                const total = cartData.products.reduce((acc, product) => {
                    // Ensure product.price is a number before adding it to the total
                    const price = Number(product.price);
                    return isNaN(price) ? acc : acc + price;
                }, 0);
                const totalCartAmount = await cart.findOneAndUpdate({userId:req.session.user._id},{$set:{totalCartPrice:total}},{new:true ,upsert:true});
                res.render('cart',{login:req.session.user , categoryData:catData , cartData , totalPrice:totalCartAmount.totalCartPrice});
            } else {
                res.render('cart',{login:req.session.user , categoryData:catData , totalPrice:0})
            }
        } else {
            res.render('cart',{categoryData:catData});
        }
    } catch (error) {
        console.error(error.message)
    }
}

const addToCart = async (req, res) => {
    try {
        const productId = req.query.id;
        const currUserId = req.session.user._id;
        const quantity = +req.body.quantity;

        const cartProduct = await product.findOne({ _id: productId });
        const existCartProduct = await cart.findOne({ userId: currUserId, 'products.productId': productId });

        if (!existCartProduct) {
            const totalAmount = quantity * cartProduct.price;

            await cart.findOneAndUpdate(
                { userId: currUserId },
                {
                    $addToSet: {
                        products: {
                            productId: productId,
                            price: totalAmount,
                            quantity: quantity
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
        res.status(500).send({ error: 'Internal Server Error' });
    }
};

const deleteItemFromCart = async(req,res)=>{
    try {
        const itemToBeDeletedId = req.query.id;
        const currUserId = req.session.user._id;
        console.log(itemToBeDeletedId);

        const removeCart = await cart.updateOne({userId:currUserId},{$pull:{products:{productId:itemToBeDeletedId}}});

        if(removeCart){
            console.log('item removed successfully :)');
            res.send(true);
        }else{
            console.log('some error has occured :(');
        }

    } catch (error) {
        console.error(error.message)
    }
}


module.exports={
    loadCart,
    addToCart,
    deleteItemFromCart
}