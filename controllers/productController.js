const product = require('../models/productModel');
const category = require('../models/categoryModel');
const brand = require('../models/brandModel');
const path = require('path')
const fs = require('fs');
const errorHandler = require('../middlewares/errorHandler');

// showing all products
const loadProducts = async(req,res)=>{
    try {
        const productData = await product.find({productName:{$exists:true}});

        res.render('products',{products:productData})

    } catch (error) {

        console.error(error.message);

        errorHandler(error, req, res);

    }
}

// loading the page for adding new products at admin side
const loadAddProducts = async(req,res)=>{
    try {

        const listCategory = await category.find({categoryName:{$exists:true}});

        const existingBrands = await brand.find({brandName:{$exists:true}});

        res.render('addProducts',{listcategory:listCategory,brands:existingBrands});

    } catch (error) {

        console.error(error.message);

        errorHandler(error, req, res);
    }
}

// saving a new product from admin side
const addProducts = async(req,res)=>{
    try {

        let images = [];

        const image = req.files;

        image.forEach((file) => {
            images.push(file.filename)
        });


        const newProduct = product.create({
            productName:req.body.product,
            price:req.body.price,
            quantity:req.body.stock,
            productImage:images,
            createdAt:Date.now(),
            description:req.body.description,
            status:req.body.radio,
            brand:req.body.brand,
            catogory:req.body.category

        })



        res.redirect('/admin/products');

    } catch (error) {

        console.error(error.message);

        errorHandler(error, req, res);

    }
}

// listing products in admin side
const listProduct = async(req,res)=>{
    try {

        const productId = req.query.id;

        await product.findOneAndUpdate({_id:productId},{$set:{status:true}});

        res.redirect('/admin/products');

    } catch (error) {

        console.error(error.message);

        errorHandler(error, req, res);
    }
}

// unlisting products in admin side
const unlistProduct = async(req,res)=>{
    try {

        const productId = req.query.id;

        await product.findOneAndUpdate({_id:productId},{$set:{status:false}});

        res.redirect('/admin/products');

    } catch (error) {

        console.error(error.message);

        errorHandler(error, req, res);
    }
}


// delete product from admin side 
const deleteProduct = async(req,res)=>{
    try {

        const itemToBeDeleted = req.query.id;

        console.log(itemToBeDeleted);

        await product.findByIdAndDelete({_id:itemToBeDeleted});

        res.redirect('/admin/products');

    } catch (error) {

        console.error(error.message);

        errorHandler(error, req, res);
    }
}



// load edit product in admin side
const loadEditProduct = async(req,res)=>{
    try {
        const itemToBeEdited = req.query.id;

        const catData = await category.find({categoryName:{$exists:true}});

        const brandData = await brand.find({brandName:{$exists:true}});

        // console.log(itemToBeEdited);

        // const brandDetails = await brand.find({brandName:{$exists:true}});

        // const catogoryDetails = await category.find({categoryName:{$exists:true}});

        const productsDetails = await product.findOne({_id:itemToBeEdited});

        // console.log(productsDetails);

        res.render('editProduct',{ productData:productsDetails , listcategory:catData , brands:brandData});

    } catch (error) {

        console.log(error.message);

        errorHandler(error, req, res);
    }
}

// saving the edited product to db in admin side
const editProduct = async(req,res)=>{
    try {

        // console.log(req.files);

        const productId = req.query.id;

        // console.log(productId);

        const editProductt = await product.findOne({_id:productId});

        // console.log(editProductt);
        
        let imag = [];

        // console.log("jjj");

        for (let i = 0; i < 3; i++) {

            const key = `k${i}`;
            
            if (req.body[key]) {

                imag.push(editProductt.productImage[i]);

            } else {

                imag.push(req.files[`image${i}`][0].filename);

                fs.unlinkSync(path.join(__dirname, '../public/productImage', editProductt.productImage[i]));
                
            }

        }

        editProductt.productImage = imag;

        await product.findByIdAndUpdate({_id:productId},{$set:{productName:req.body.name,price:req.body.price,offerpercentage:req.body.offerpercentage,quantity:req.body.stock,description:req.body.description,catogory:req.body.category,brand:req.body.brand}});

        res.redirect('/admin/products');

        editProductt.save();


    } catch (error) {

        console.error(error.message);

        errorHandler(error, req, res);
    }
}


const searchProduct = async(req,res)=>{
    try {
        console.log(req.body);
        const findProduct = req.body.data
        const searchedItem = await product.find({ productName: { $regex: new RegExp(`.*${findProduct}.*`, 'i') } });
        console.log(searchedItem);
        res.send(searchedItem);

    } catch (error) {
        errorHandler(error, req, res)
    }
}








module.exports = {
    loadProducts,
    loadAddProducts,
    addProducts,
    listProduct,
    unlistProduct,
    deleteProduct,
    loadEditProduct,
    editProduct,
    searchProduct
}
