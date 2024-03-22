const category = require('../models/categoryModel');



const loadCatogeries = async(req,res)=>{
    try {
        const catData = await category.find({categoryName:{$exists:true}})
        res.render('catogories',{categoryData:catData});
        
    } catch (error) {
        console.error(error.message);
    }
}


const addCategory = async(req,res)=>{
    try {
        const catName = req.body.category.trim().toUpperCase();
        console.log(catName);
        const findCat = await category.findOne({categoryName:catName})
        if(findCat){
            const catData = await category.find({categoryName:{$exists:true}})
            res.render('catogories',{catMessage:'Catogory already exists',categoryData:catData});
        }
        else{
            const newCat = new category({
                categoryName:catName
            })

            await newCat.save();
            const catData = await category.find({categoryName:{$exists:true}})
            res.render('catogories',{catSuccessMsg:'catogory added successfully',categoryData:catData})
        }
    } catch (error) {
        console.error(error.message);
    }
}



const listCategory = async(req,res)=>{
    try {
        const catogoryName = req.query.name;
        const listCategory = await category.findOneAndUpdate({categoryName:catogoryName},{$set:{is_listed:true}});
        const catData = await category.find({categoryName:{$exists:true}})
        if(listCategory){
            res.render('catogories',{categoryData:catData});
        }
    } catch (error) {
        console.error(error.message);
    }
}


const unlistCategory = async(req,res)=>{
    try {
        const catogoryName = req.query.name;
        const unlistCategory = await category.findOneAndUpdate({categoryName:catogoryName},{$set:{is_listed:false}});
        const catData = await category.find({categoryName:{$exists:true}})
        if(unlistCategory){
            res.render('catogories',{categoryData:catData});
        }
    } catch (error) {
        console.error(error.message);
    }
}


const editCategory = async(req,res)=>{
    try {
        // console.log(req.query.currentName);
        // console.log(req.body.category);
        const currentCatogoryName = req.query.currentName;
        const editedCatogoryName = req.body.category.trim().toUpperCase();
        const duplicateCategory = await category.findOne({categoryName:editedCatogoryName});
        const catData = await category.find({categoryName:{$exists:true}});
        if(duplicateCategory){
            console.log('this is dup cat');
            res.render('catogories',{duplicateCategoryMsg:'This category already exists',categoryData:catData});
        }
        else{
            console.log('this is not dup cat');
            await category.findOneAndUpdate({categoryName:currentCatogoryName},{$set:{categoryName:editedCatogoryName}});
            const catData = await category.find({categoryName:{$exists:true}});
            res.render('catogories',{categoryData:catData});

        }
        
    } catch (error) {
        console.error(error.message);
    }
}

















module.exports = {
    loadCatogeries,
    addCategory,
    listCategory,
    unlistCategory,
    editCategory,
}