const express = require('express');
const { placeOrder, getOrderDetails, getAllOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/:orderId', protect, getOrderDetails);
router.get('/', protect, getAllOrders);

module.exports = router;
