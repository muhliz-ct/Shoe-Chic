
const product = require('../models/productModel');
const order = require('../models/orderModel');
const user = require('../models/userModel');
const category = require("../models/categoryModel");


//load dashboard at admin side
const loadDahboard = async (req, res , next) => {
    
    try {
  
      const order1 = await order.find();   //  Order
  
      const totalOrdAmount = order1.reduce((acc, val) => acc + val.orderAmount, 0);    //  TotalAmount
  
      const totalProduct = await product.find()   //  Product
  
      //  Best Selling Products :-
  
      const bestSellPro = await order.aggregate([
          
        {
          $unwind: "$products",
        },
  
        {
          $group: {
  
            _id: "$products.productId",
            ttlCount: { $sum: "$products.quantity" },
                      
          },
        },
  
        {
          $lookup: {
  
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productData",
          },
        },
  
        {
          $sort: { ttlCount: -1 },
        },
  
        {
          $limit: 5,
        },
  
      ]);
        
      //  Top Selling Category :-
  
      const bestSellCate = await order.aggregate([
      
        { $unwind: "$products" },
  
        {
          $group: {
  
            _id: "$products.productId",
            totalQuantity: { $sum: "$products.quantity" },
          },
  
        },
  
        { $sort: { totalQuantity: -1 } },
        { $limit: 3 },
  
        {
  
          $lookup: {
  
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "productDetails",
  
          },
  
        },
  
        { $unwind: "$productDetails" },
  
        {
          $lookup: {
  
            from: "categories",
            localField: "productDetails.catogory",
            foreignField: "categoryName",
            as: "categoryDetails",
  
          },
  
        },
  
        {
          $group: {
  
            _id: "$categoryDetails._id",
            categoryName: { $first: "$categoryDetails.categoryName" },
            totlCate: { $sum: "$totalQuantity" },
          },
  
        },
  
        { $sort: { totalCategoryQuantity: -1 } },
  
        { $limit: 3 },
  
      ]);

      console.log(bestSellCate);
  
      //  Top Selling Brand :-
  
      const bestSellBrand = await order.aggregate([
      
        {
          $unwind: "$products",
        },
  
        {
  
          $group: {
  
            _id: "$products.productId",
            totalQuantity: { $sum: "$products.quantity" },
            
          },
  
        },
  
        {
  
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
  
        },
  
        {
          $unwind: "$product",
        },
  
        {
  
          $group: {
  
            _id: "$product.brand",
            totalQuantity: { $sum: "$totalQuantity" },
  
          },
  
        },
  
        {
          $sort: { totalQuantity: -1 },
        },
  
        {
          $limit: 3,
        },
  
      ]);
  
      res.render('dashbord', { order1, totalOrdAmount, totalProduct, bestSellPro, bestSellCate, bestSellBrand });
          
    } catch (error) {
  
    //   next(error,req,res);
  
          
    }
  
  };

//year wise report on admin side
  const chartYear = async (req, res , next) => {

    try {
  
      const currentYear = new Date().getFullYear();
  
      const yearChart = await order.aggregate([
          
        {
          
          $match: {
  
            dateOfOrder: {
  
              $gte: new Date(`${currentYear - 5}-01-01`),
              $lte: new Date(`${currentYear}-12-31`),
  
            },
  
          },
  
        },
  
        {
          $group: {
  
            _id: { $year: "$dateOfOrder" },
            totalAmount: { $sum: "$orderAmount" },
  
          },
  
        },
  
        {
          $sort: { _id: 1 },
        },
  
      ]);
  
      res.send({ yearChart });
  
    } catch (error) {
  
      next(error,req,res);
  
  
    }
  
  };
  
//month wise graph report in admin
  const monthChart = async (req, res , next) => {
  
    try {
      
      const monthName = [
  
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
  
      const currentYear = new Date().getFullYear();
  
      const monData = await order.aggregate([
      
        {
          $match: {
  
            dateOfOrder: {
  
              $gte: new Date(`${currentYear}-01-01`),
              $lte: new Date(`${currentYear}-12-31`),
              
            },
  
          },
        },
  
        {
          $group: {
            _id: { $month: "$dateOfOrder" },
            totalAmount: { $sum: "$orderAmount" },
          },
        },
  
        {
          $sort: { _id: 1 },
        },
  
      ]);
  
      const salesData = Array.from({ length: 12 }, (_, i) => {
  
        const monthData = monData.find((item) => item._id === i + 1);
  
        return monthData ? monthData.totalAmount : 0;
  
      });

      console.log(monData);
  
      res.json({ months: monthName, salesData });
  
    } catch (error) {
  
      next(error,req,res);
  
    }
  
  };

  module.exports = {
    loadDahboard,
    monthChart,
    chartYear
  }