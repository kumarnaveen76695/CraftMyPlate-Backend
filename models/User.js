const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    username: String,  
    email: String,
    password: { type: String },
    phone: Number,
    addresses: [String]
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
