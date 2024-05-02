const mongoose = require("mongoose");

const Order = mongoose.Schema({

    userId: {
      
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userData',
        required: true,
    
    },

    orderAmount: {
      
        type: Number,
        required: true,
    
    },

    orderDiscount:{
        type:Number,
        default:0
    },

    couponDiscount:{
        type:Number,
        defaul:0
    },

    payment: {
      
        type: String,
        required: true,
    
    },

    dateOfOrder: {
      
        type: Date,
        required: true,
        default: Date.now,
    
    },

    orderStatus: {
        
        type: String,
        enum: ['pending', 'shipped', 'delivered', 'canceled' , 'Return Requested'],
        default: 'pending'
    },

    deliveryAddress: {
      
        name: { type: String, required: true },
        phone: { type: Number, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: Number, required: true },
        address: { type: String, required: true },
        locality: { type: String, required: true },
    
    },

    products: [{
        
        productId: {
          
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required: true
        
        },

        quantity: {
        
            type: Number,
            default: 1,
            required: true
        
        },
      
        price: {
                
            type: Number,
            required: true,
            
        },
          
        orderProductStatus: {
                
            type: String,
            required: true,
            enum: ['pending', 'shipped', 'delivered', 'canceled' , 'Payment Failed'],
            default: 'pending',

        },
        reasonOfReturn:{
            type:String
        }
    }],

});

module.exports = mongoose.model("order", Order);