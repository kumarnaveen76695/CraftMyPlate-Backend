const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const db = require('./config/db');
const Order = require('./models/Order');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// User Model

/*const userSchema = new mongoose.Schema({
    name: String,
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    phone: String,
    addresses: [String]
});
const User = mongoose.model('User', userSchema);*/

// Restaurant Model
/*const MenuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    availability: { type: Boolean, default: true },
});

const RestaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    menu: [MenuItemSchema],
});
const Restaurant = mongoose.model('Restaurant', RestaurantSchema);*/

// Order Model
/*const OrderSchema = new mongoose.Schema({
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
const Order = mongoose.model('Order', OrderSchema); */

// User Registration API

app.post('/register', async (req, res) => {
    const { name, username, email, password, phone } = req.body;
    if (!username) return res.status(400).json({ error: "Username is required" });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, username, email, password: hashedPassword, phone });
        await newUser.save();
        console.log('Registered User:', newUser); 
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err); 
        res.status(500).json({ error: 'Error registering user' });
    }
});

// User Login API

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login Attempt:', req.body); 
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid email or password' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error(err); 
        res.status(500).json({ error: 'Login failed' });
    }
});

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);

    const token = authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// User Profile APIs
app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'Profile not found' });
        res.json(user);
    } catch (err) {
        console.error(err); // Log error if occurs
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

app.put('/profile', authenticateToken, async (req, res) => {
    const { name, phone, addresses } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { name, phone, addresses },
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ error: 'Profile update failed' });
        res.json(updatedUser);
    } catch (err) {
        console.error(err); // Log error if occurs
        res.status(500).json({ error: 'Error updating profile' });
    }
});

// Restaurant Management APIs
app.post('/restaurants', authenticateToken, async (req, res) => {
    const { name, location } = req.body;
    console.log('New Restaurant:', req.body); // Log new restaurant data
    try {
        const newRestaurant = new Restaurant({ name, location });
        await newRestaurant.save();
        res.status(201).json(newRestaurant);
    } catch (error) {
        console.error(error); // Log error if occurs
        res.status(500).json({ error: 'Error creating restaurant' });
    }
});

app.put('/restaurants/:restaurantId', authenticateToken, async (req, res) => {
    const { restaurantId } = req.params;
    const updates = req.body;
    try {
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(restaurantId, updates, { new: true });
        if (!updatedRestaurant) return res.status(404).json({ error: 'Restaurant not found' });
        res.json(updatedRestaurant);
    } catch (error) {
        console.error(error); // Log error if occurs
        res.status(500).json({ error: 'Error updating restaurant' });
    }
});

app.post('/restaurants/:restaurantId/menu', authenticateToken, async (req, res) => {
    const { restaurantId } = req.params;
    const { name, description, price, availability } = req.body;
    console.log('New Menu Item:', req.body); // Log new menu item data
    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
        const newMenuItem = { name, description, price, availability };
        restaurant.menu.push(newMenuItem);
        await restaurant.save();
        res.status(201).json(newMenuItem);
    } catch (error) {
        console.error(error); // Log error if occurs
        res.status(500).json({ error: 'Error adding menu item' });
    }
});

// Order Management APIs
app.post('/orders', authenticateToken, async (req, res) => {
    const { items, deliveryAddress } = req.body;
    console.log('New Order:', req.body); // Log new order data
    try {
        const orderTotal = await calculateOrderTotal(items);
        const estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000);
        const newOrder = new Order({
            user: req.user.userId,
            items,
            totalCost: orderTotal,
            deliveryAddress,
            estimatedDeliveryTime,
        });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        console.error(error); // Log error if occurs
        res.status(500).json({ error: 'Error placing order' });
    }
});

app.get('/orders/:orderId', authenticateToken, async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findById(orderId).populate('items.itemId');
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (error) {
        console.error(error); // Log error if occurs
        res.status(500).json({ error: 'Error fetching order' });
    }
});

app.get('/orders', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.userId }).populate('items.itemId');
        res.json(orders);
    } catch (error) {
        console.error(error); 
        res.status(500).json({ error: 'Error fetching orders' });
    }
});

// Helper function to calculate total order cost

async function calculateOrderTotal(items) {
    let total = 0;
    for (const item of items) {
        const menuItem = await Restaurant.findOne({ 'menu._id': item.itemId }, { 'menu.$': 1 });
        if (menuItem) {
            const price = menuItem.menu[0].price;
            total += price * item.quantity;
        }
    }
    return total;
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
