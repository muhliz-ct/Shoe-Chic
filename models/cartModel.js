const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({

    products: [{
        
        productId: {
            
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product'

        },

        quantity: {
            
            type: Number,
            default: 1

        },

        price: {
            
            type: Number,
            required: true

        }, 

        discountedAmount: {
            type:Number,
            default:0
        }

    }],

    totalCartPrice: {
            
        type: Number,
        required: false

    },

    totalCartDiscount : {
        type:Number,
        default : 0
    },

    couponDiscount : {
        type:Number,
        default:0
    },
    
    userId: {
        
        type: String,
        required: true
    
    },

});

module.exports = mongoose.model('cart', cartSchema);