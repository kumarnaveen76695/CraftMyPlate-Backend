const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://naveen:kumar@cluster0.f7wmb0k.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
            // No deprecated options needed
        });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
