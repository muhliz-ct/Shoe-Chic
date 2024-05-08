const category = require('../models/categoryModel');

const errorHandler = require('../middlewares/errorHandler');


// load catogeries
const loadCatogeries = async(req,res)=>{
    try {

        const catData = await category.find({categoryName:{$exists:true}});

        res.render('catogories',{categoryData:catData});
        
    } catch (error) {

        console.error(error.message);

        errorHandler(error, req, res);

    }
}

// add new categories
const addCategory = async(req,res)=>{
    try {
        const catName = req.body.category.trim().toUpperCase();

        const catDisc = req.body.categoryDiscount;

        console.log(catName, catDisc);

        // console.log(catName);

        const findCat = await category.findOne({categoryName:catName});

        if(findCat){

            const catData = await category.find({categoryName:{$exists:true}});

            res.render('catogories',{catMessage:'Catogory already exists',categoryData:catData});

        }
        else{

            const newCat = new category({
                categoryName:catName,
                categoryOffer:catDisc
            })

            await newCat.save();

            const catData = await category.find({categoryName:{$exists:true}});

            res.render('catogories',{catSuccessMsg:'catogory added successfully',categoryData:catData});

        }
    } catch (error) {

        console.error(error.message);

        errorHandler(error, req, res);

    }
}


// list existing categories
const listCategory = async(req,res)=>{
    try {
        const catogoryName = req.query.name;

        const listCategory = await category.findOneAndUpdate({categoryName:catogoryName},{$set:{is_listed:true}});

        const catData = await category.find({categoryName:{$exists:true}});

        if(listCategory){

            res.render('catogories',{categoryData:catData});

        }
    } catch (error) {

        console.error(error.message);

        errorHandler(error, req, res);

    }
}

// unlist existing categories
const unlistCategory = async(req,res)=>{
    try {
        const catogoryName = req.query.name;

        const unlistCategory = await category.findOneAndUpdate({categoryName:catogoryName},{$set:{is_listed:false}});

        const catData = await category.find({categoryName:{$exists:true}});

        if(unlistCategory){

            res.render('catogories',{categoryData:catData});

        }
    } catch (error) {

        console.error(error.message);

        errorHandler(error, req, res);

    }
}

// edit category
const editCategory = async(req,res)=>{
    try {
        // console.log(req.query.currentName);
        // console.log(req.body.category);
        const currentCatogoryName = req.query.currenName;

        const editedCategoryDiscount = req.body.catDisc;
        
        console.log(editedCategoryDiscount);

        const editedCatogoryName = req.body.category.trim().toUpperCase();

        console.log(editedCatogoryName);

        const duplicateCategory = await category.findOne({categoryName:editedCatogoryName});

        console.log(duplicateCategory);

        const catData = await category.find({categoryName:{$exists:true}});

        if(duplicateCategory){
            console.log('reached duplicate category');
            res.render('catogories',{duplicateCategoryMsg:'This category already exists',categoryData:catData});

        }
        else{

            await category.findOneAndUpdate({categoryName:currentCatogoryName},{$set:{categoryName:editedCatogoryName, categoryOffer:editedCategoryDiscount}});

            const catData = await category.find({categoryName:{$exists:true}});

            res.render('catogories',{categoryData:catData});

        }
        
    } catch (error) {

        console.error(error.message);

        errorHandler(error, req, res);
    }
}


module.exports = {
    loadCatogeries,
    addCategory,
    listCategory,
    unlistCategory,
    editCategory,
}