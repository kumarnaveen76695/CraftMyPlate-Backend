const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{ 
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant.menu' },
        quantity: { type: Number, required: true },
    }],
    totalCost: { type: Number, required: true },
    deliveryAddress: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'In Progress', 'Out for Delivery', 'Delivered'], 
        default: 'Pending' 
    },
    estimatedDeliveryTime: { type: Date, required: true }
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
