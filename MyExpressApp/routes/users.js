const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/myDB2")

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    age: Number
})

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;