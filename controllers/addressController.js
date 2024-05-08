const address = require('../models/addressModel');
const product = require('../models/productModel');
const errorHandler = require('../middlewares/errorHandler');
const axios = require('axios');

// save address to the db from checkout 
const saveAddress  = async(req,res)=>{
    try {
        const userId = req.query.id;

        const productId = req.query.id;

        // console.log(userId);

        const addressData = req.body.addressData;

        // console.log(addressData);

        const exists = await address.findOne({userId:userId,address:{$elemMatch:{address:req.body.addressData.address}}});


        // console.log(exists);

        if(!exists){
            const verifyAddress = await address.findOneAndUpdate(
                {userId:userId},
                {$addToSet:
                {address:
                {name:req.body.addressData.name,
                phone:req.body.addressData.phone,
                city:req.body.addressData.city,
                state:req.body.addressData.state,
                pincode:req.body.addressData.pincode,
                address:req.body.addressData.address,
                locality:req.body.addressData.locality,
                status:true
                }}},
                {new:true , upsert:true}
            )



            if(verifyAddress){

                res.send({success:true});

            }else{

                res.send('some error occurred!!!');

            }

        }else{
            console.log('address already exists');
        }

        
        
        
    } catch (error) {
        console.error(error.message)
        errorHandler(error, req, res)
    }
}


// save address from address of profile
const addAddress = async(req,res)=>{
    try {
        const userId = req.query.id;

        const addressData = req.body.addressData;
        
        console.log(addressData);

        const exists = await address.findOne({userId:userId,"address.address":req.body.addressData.addresss});

        // console.log(exists);
        // console.log(userId);
        // console.log(req.body.addressData.address);

        if(!exists){
            const verifyAddress = await address.findOneAndUpdate(
                {userId:userId},
                {$addToSet:
                {address:
                {name:req.body.addressData.name,
                phone:req.body.addressData.phone,
                city:req.body.addressData.city,
                state:req.body.addressData.state,
                pincode:req.body.addressData.pincode,
                address:req.body.addressData.addresss,
                locality:req.body.addressData.locality,
                status:false
                }}},
                {new:true , upsert:true}
            )



            if(verifyAddress){

                res.send({success:true});

            }else{

                console.log('some error occured');

            }

        }else{

            console.log('address already exists');

        }
    } catch (error) {

        console.error(error.message);

        errorHandler(error, req, res);

    }
}


// delete added address userside
const deleteAddress = async(req,res)=>{
    try {
        // console.log(req.query.id,req.query.addid);

        const deleted = await address.updateOne({userId:req.query.id},{$pull:{address:{_id:req.query.addid}}});

        if(deleted){

            res.send(true);

        }else{

            console.log('some error occured while deleting address');

        }
    } catch (error) {
        console.error(error.message);
        errorHandler(error, req, res);
    }
}

// edit existing address
const editCurrentAddress = async(req,res)=>{
    try {

        // console.log(req.body);

        const userId = req.session.user._id;
        
       const updatedData = await address.findOneAndUpdate({userId:userId , 'address._id':req.body.id},{$set:{'address.$':{
            name:req.body.name,
            phone:req.body.phone,
            locality:req.body.locality,
            pincode:req.body.pincode,
            address:req.body.address,
            city:req.body.city,
            state:req.body.state
        }}})

        if(updatedData){
            // console.log('address edited successfully');

            res.redirect('/address');

        }else{

            console.log('some error in editing address has occured!!!');

        }
    } catch (error) {

        console.error(error.message);

        errorHandler(error, req, res);

    }
}

// showing the current details while editing (fetch from frontend)
const editAddress = async(req,res)=>{
    try {

        const {edit} = req.body;

        const editData = await address.findOne({'address._id' : edit},{'address.$':1});

        console.log(editData);



        res.json({editData});

    } catch (error) {

        console.error(error.message);

        errorHandler(error, req , res);

    }
}


// choose address from the checkout page
const chooseAddress = async(req,res)=>{
    try {

        const userId = req.session.user._id;

        const addId = req.query.id;

        await address.updateMany(
            { userId: userId, 'address.status': true },
            { $set: { 'address.$.status': false } }
        );

        const changeAddress = await address.findOneAndUpdate({userId:userId,'address._id':addId},{$set:{'address.$.status':true}});
        
        if(changeAddress){

            res.send(true);

        }else{

            console.log('some error occured while changing address!!!');

        }
    } catch (error) {

        console.error(error.message);

        errorHandler(error, req, res);
    }
}



module.exports={
    saveAddress,
    addAddress,
    deleteAddress,
    editAddress,
    editCurrentAddress,
    chooseAddress
    
}