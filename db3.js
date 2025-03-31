const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect("mongodb+srv://hiteshnagpal:Hunnynagpal%402006@cluster0.jzero.mongodb.net/practice2?retryWrites=true&w=majority")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.log(err));

// Define Cart Item Schema
const CartItemSchema = new mongoose.Schema({
    product: {
        productId: {
            type: Number,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1
        }
    }
});

// Define Cart Schema
const CartSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
        unique: true // This automatically creates a unique index
    },
    items: [CartItemSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Method to calculate total cart value
CartSchema.methods.calculateTotal = function () {
    return this.items.reduce((total, item) =>
        total + (item.product.price * item.product.quantity), 0
    );
};

// Create Cart Model
const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
