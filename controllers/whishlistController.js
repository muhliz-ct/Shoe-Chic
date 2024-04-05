const wishlist = require('../models/whistlistModel');
const category = require('../models/categoryModel');
const product = require('../models/productModel');

const loadWishlist = async (req, res) => {
    try {
        const sessionUserId = req.session.user._id;
        
        // Fetch category data
        const catData = await category.find({ categoryName: { $exists: true } });

        // Fetch wishlist data and populate products
        const wishlistData = await wishlist.findOne({ userId: sessionUserId }).populate('products.productId');

        // Extract products from wishlist data
        const productsInWishlist = wishlistData ? wishlistData.products.map(item => item.productId) : [];

        console.log(`this is product details from whishlist ${productsInWishlist}`);

        // Render wishlist page with wishlist data and category data
        res.render('wishlist', {login:req.session.user , wishlistData: productsInWishlist, categoryData: catData });
    } catch (error) {
        console.error(error.message);
        // Handle error rendering wishlist page
        res.status(500).send('Server Error');
    }
};




const addToWishList = async (req, res) => {
    try {
        const sessionUserId = req.session.user._id;
        const proId = req.query.id;

        const productData = await product.findOne({ _id: proId });

        console.log(`this is first ${productData}`);

        // Check if the product exists in the wishlist
        const wishlistData = await wishlist.findOne({ userId: sessionUserId, 'products.productId': proId });

        if (!wishlistData) {
            console.log('logged if');
            // If wishlistData is null, the product is not in the wishlist, so we need to add it
            await wishlist.findOneAndUpdate(
                { userId: sessionUserId },
                { $addToSet: { products: { productId: proId } } },
                { new: true, upsert: true }
            );
        }

        console.log('reached out of if');
        
        // res.json(productData);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};


const removeFromWishlist = async(req,res)=>{
    try {
        console.log('reached wishlist controller!!!');
        const sessionUserId = req.session.user._id;
        const productWishlistId = req.query.id;

        const removedFromWishlist = await wishlist.findOneAndUpdate({userId:sessionUserId},
            {$pull:{products:{productId:productWishlistId}}});


        // console.log(removeFromWishlist);

        if(removeFromWishlist){
            res.send(true);

        }else{
            console.log('some error occured while removing from cart~~~');
        }
        
        
    } catch (error) {
        console.error(error.message)
    }
}



















module.exports = {
    loadWishlist,
    addToWishList,
    removeFromWishlist
}