const Order = require('../models/Order');

// Place an order
exports.placeOrder = async (req, res) => {
  const { restaurantId, items, deliveryAddress, totalCost } = req.body;
  try {
    const order = new Order({
      user: req.user.id,
      restaurant: restaurantId,
      items,
      deliveryAddress,
      totalCost,
    });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order details
exports.getOrderDetails = async (req, res) => {
  const { orderId } = req.params;
  try {
    const order = await Order.findById(orderId).populate('restaurant');
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('restaurant');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
