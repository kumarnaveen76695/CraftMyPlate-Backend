const express = require('express');
const { createRestaurant, updateRestaurant, addMenuItem, updateMenuItem } = require('../controllers/restaurantController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createRestaurant);
router.put('/:restaurantId', protect, updateRestaurant);
router.post('/:restaurantId/menu', protect, addMenuItem);
router.put('/:restaurantId/menu/:itemId', protect, updateMenuItem);

module.exports = router;
