// const Restaurant = require('../models/Restaurant');

// // Create restaurant
// exports.createRestaurant = async (req, res) => {
//   const { name, location } = req.body;
//   try {
//     const restaurant = new Restaurant({ name, location });
//     await restaurant.save();
//     res.status(201).json(restaurant);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Update restaurant
// exports.updateRestaurant = async (req, res) => {
//   const { restaurantId } = req.params;
//   const { name, location } = req.body;
//   try {
//     const restaurant = await Restaurant.findByIdAndUpdate(restaurantId, { name, location }, { new: true });
//     res.json(restaurant);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Add menu item
// exports.addMenuItem = async (req, res) => {
//   const { restaurantId } = req.params;
//   const { name, description, price } = req.body;
//   try {
//     const restaurant = await Restaurant.findById(restaurantId);
//     restaurant.menu.push({ name, description, price });
//     await restaurant.save();
//     res.status(201).json(restaurant);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Update menu item
// exports.updateMenuItem = async (req, res) => {
//   const { restaurantId, itemId } = req.params;
//   const { name, description, price } = req.body;
//   try {
//     const restaurant = await Restaurant.findById(restaurantId);
//     const item = restaurant.menu.id(itemId);
//     if (item) {
//       item.name = name;
//       item.description = description;
//       item.price = price;
//       await restaurant.save();
//       res.json(restaurant);
//     } else {
//       res.status(404).json({ message: 'Menu item not found' });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
