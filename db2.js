const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/practice2").then(()=>{
    console.log("Connected to MongoDB");
}).catch(err => console.log(err));

const WishlistSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  product: {
    productId: {
      type: String,
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
    rating: {
      type: Number,
      default: 0
    }
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create a compound index to ensure unique wishlist items per user
WishlistSchema.index({ userEmail: 1, 'product.productId': 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', WishlistSchema);