const brand = require('../models/brandModel');
const errorHandler = require('../middlewares/errorHandler');

// add new brand in user side
const addnewBrand = async(req,res)=>{
    try {

        const Brand = req.body.brand;

        const findBrand = await brand.findOne({brandName:Brand});

        if(findBrand){

            res.redirect('/admin/category');

        }
        else{

            const newBrand = new brand({
                brandName:Brand
            })

            await newBrand.save();

            res.redirect('/admin/category');

        }
    } catch (error) {

        console.error(error.message);
        
        errorHandler(error, req, res);

    }
}






module.exports = {
    addnewBrand
}