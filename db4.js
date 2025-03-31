const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://hiteshnagpal:Hunnynagpal%402006@cluster0.jzero.mongodb.net/practice2?retryWrites=true&w=majority").then(()=>{
    console.log("Connected to MongoDB");
}).catch(err => console.log(err));
const OrderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  products: [{
    productId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    thumbnail: {
      type: String
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  paymentMode: {
    type: String,
    enum: ['Cash on Delivery', 'Online Payment'],
    default: 'Cash on Delivery'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered'],
    default: 'Pending'
  }
});

module.exports= mongoose.model('Order', OrderSchema);
