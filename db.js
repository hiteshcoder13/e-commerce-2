const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://hiteshnagpal:Hunnynagpal%402006@cluster0.jzero.mongodb.net/practice2?retryWrites=true&w=majority").then(()=>{
    console.log("Connected to MongoDB");
}).catch(err => console.log(err));

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
})

const User = mongoose.model("User", userSchema);

module.exports = User;
