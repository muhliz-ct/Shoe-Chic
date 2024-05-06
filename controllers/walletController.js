const wallet = require('../models/walletModel');
const user = require('../models/userModel');
const cart = require('../models/cartModel');
const category = require('../models/categoryModel');
const instance = require('../config/razorPay');



// const loadWallet = async(req,res)=>{
//     try {
//         const sessionUserId = req.session.user._id;

//         const Data = await cart.findOne({userId:req.session.user._id}).populate('products.productId');

//         const catData = await category.find({categoryName:{$exists:true}});

//         const userWallet = await wallet.findOne({userId:sessionUserId}).sort();

//         res.render('wallet',{login:req.session.user , userWallet , categoryData:catData , cartData:Data});

//     } catch (error) {

//         console.error(error.message);

//     }
// }

let sortTransactionsByTime = async function(walletId) {
    const wallet1 = await wallet.findById(walletId);
    if (!wallet) {
        throw new Error('Wallet not found');
    }
    // Sort transactions based on time
    wallet1.transaction.sort((a, b) => b.time - a.time);
    return wallet1.transaction;
};

const loadWallet = async (req, res) => {
    try {

        let sortedTransactions;
        const sessionUserId = req.session.user._id;

        // Fetching cart data
        const cartData = await cart.findOne({ userId: sessionUserId }).populate('products.productId');

        const wallet1 = await wallet.findOne({userId:sessionUserId})

        // Fetching category data
        const categoryData = await category.find({ categoryName: { $exists: true } });

        // Fetching user wallet data and sorting transactions
        const userWallet = await wallet.findOne({ userId: sessionUserId });
        console.log(userWallet);
        if(userWallet){
            sortedTransactions = await sortTransactionsByTime(userWallet._id);
        }else{
            sortedTransactions = null;
        }
        console.log(sortedTransactions);

        res.render('wallet', {
            login: req.session.user,
            w:wallet1,
            userWallet: sortedTransactions || null,
            categoryData: categoryData,
            cartData: cartData
        });
    } catch (error) {
        console.error(error.message);
        // Handle error
    }
};


const addMoneyWallet = async(req,res)=>{
    try {
        const walletAmount = req.body.amount;
        const sessionUserId = req.session.user._id;
        await wallet.findOneAndUpdate({userId:sessionUserId},{$inc:{walletBalance:walletAmount},$push:{transaction:{amount:walletAmount,Action:'Credit'}}},{new:true,upsert:true});
        res.redirect('/wallet');
    } catch (error) {
        console.error(error.message)
    }
}


const Recharge = async ( req , res ) => {
    try {
        const sessionUserId = req.session.user._id;
        const addMoney = Number(req.body.amt)*100
        const user12 = await user.findOne({ _id:sessionUserId})
       
            const options = {
            amount: addMoney,
            currency: "INR",
            receipt: 'absharameen625@gmail.com'
        }
        instance.orders.create(options, (err, order) => {
            if (!err) {
                res.send({
                    success: true,
                    msg: 'Wallet updated ',
                    amount: addMoney,
                    key_id: process.env.RAZORPAY_IDKEY,
                    name: user12.fullName,
                    email: user12.email
                })
            }else {
                console.error("Error Add money:", err);
                res.status(500).send({ success: false, msg: "Failed to topup" });
            }
        })

    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadWallet,
    addMoneyWallet,
    Recharge
}