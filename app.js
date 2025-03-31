const express = require('express');
const app = express();
const cors = require('cors');
const User = require('./db');
const Wishlist = require('./db2');
const Cart = require('./db3');
const Order = require('./db4');
const mongoose = require('mongoose');
app.use(cors());
app.use(express.json());
app.post('/register',async (req,res) => {
    try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const newUser = new User({name, email, password});
    const data = await newUser.save();
    res.status(201).json(data);
    }
    catch (error) {
        res.status(400).json({error: error.message});
    }
})
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const data = await User.findOne({ email: email, password: password });

        if (data) {
            return res.status(201).json({ success: true, message: "Login successful", data: data });
        } else {
            return res.status(404).json({ success: false, message: "Invalid email or password" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
});

app.get('/', async (req, res) => {
    res.send('Welcome')
    })

    app.get('/profile/:email', async (req, res) => {
        const { email } = req.params;
        const data = await User.findOne({ email: email});
        if(data){
            res.status(200).json(data);
        }else{
            res.status(404).json({ message: "User not found" });
        }
        })

        app.post('/profile/editprofile', async (req, res) => {
            try {
                const { email, name, currentPassword, newPassword } = req.body;
                
                // Find the user by email
                const user = await User.findOne({ email });
                
                // Check if user exists
                if (!user) {
                    return res.status(404).json({ message: 'User not found' });
                }
                
                // Update name if provided
                if (name) {
                    user.name = name;
                }
                
                // Password change logic
                if (currentPassword && newPassword) {
                    // Simple password comparison (EXTREMELY INSECURE)
                    if (currentPassword !== user.password) {
                        return res.status(400).json({ message: 'Current password is incorrect' });
                    }
                    
                    // Validate new password length
                    if (newPassword.length < 8) {
                        return res.status(400).json({ message: 'New password must be at least 8 characters long' });
                    }
                    
                    // Directly set the new password (VERY UNSAFE)
                    user.password = newPassword;
                }
                
                // Save the updated user
                await user.save();
                
                // Return success response
                res.status(200).json({ 
                    message: 'Profile updated successfully',
                    user: {
                        name: user.name,
                        email: user.email
                    }
                });
            } catch (error) {
                console.error('Profile update error:', error);
                res.status(500).json({ message: 'Internal server error', error: error.message });
            }
        });
        app.get('/api/wishlist', async (req, res) => {
            try {
              const { email } = req.query;
              
              if (!email) {
                return res.status(400).json({ message: 'Email is required' });
              }
          
              const wishlist = await Wishlist.find({ userEmail: email });
              res.json(wishlist);
            } catch (error) {
              res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
            }
          });
          
          // Add product to wishlist
          app.post('/api/wishlist', async (req, res) => {
            try {
              const { userEmail, product } = req.body;
          
              if (!userEmail || !product) {
                return res.status(400).json({ message: 'User email and product details are required' });
              }
          
              // Check if product already exists in wishlist
              const existingWishlistItem = await Wishlist.findOne({ 
                userEmail, 
                'product.productId': product.productId 
              });
          
              if (existingWishlistItem) {
                return res.status(400).json({ message: 'Product already in wishlist' });
              }
          
              // Create new wishlist item
              const wishlistItem = new Wishlist({
                userEmail,
                product
              });
          
              await wishlistItem.save();
              res.status(201).json(wishlistItem);
            } catch (error) {
              res.status(500).json({ message: 'Error adding to wishlist', error: error.message });
            }
          });
          
          // Remove product from wishlist
          app.delete('/api/wishlist/:productId', async (req, res) => {
            try {
              const { productId } = req.params;
              const { email } = req.body;
          
              if (!email) {
                return res.status(400).json({ message: 'Email is required' });
              }
          
              const result = await Wishlist.findOneAndDelete({ 
                userEmail: email, 
                'product.productId': productId 
              });
          
              if (!result) {
                return res.status(404).json({ message: 'Product not found in wishlist' });
              }
          
              res.json({ message: 'Product removed from wishlist' });
            } catch (error) {
              res.status(500).json({ message: 'Error removing from wishlist', error: error.message });
            }
          });

          app.post('/api/cart', async (req, res) => {
            try {
              const { userEmail, product } = req.body;
          
              // Find existing cart or create new one
              let cart = await Cart.findOne({ userEmail });
          
              if (!cart) {
                cart = new Cart({ userEmail, items: [] });
              }
          
              // Check if product already exists in cart
              const existingProductIndex = cart.items.findIndex(
                item => item.product.productId === product.productId
              );
          
              if (existingProductIndex > -1) {
                // Increment quantity if product exists
                cart.items[existingProductIndex].product.quantity += 1;
              } else {
                // Add new product to cart
                cart.items.push({ product: { ...product, quantity: 1 } });
              }
          
              await cart.save();
              res.status(200).json(cart);
            } catch (error) {
              res.status(500).json({ message: 'Error adding to cart', error });
            }
          });
          
          // Get cart items for a user
          app.get('/api/cart', async (req, res) => {
            try {
              const { email } = req.query;
              const cart = await Cart.findOne({ userEmail: email });
          
              if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
              }
          
              res.status(200).json(cart.items);
            } catch (error) {
              res.status(500).json({ message: 'Error fetching cart', error });
            }
          });
          
          // Remove item from cart
          app.delete('/api/cart/:productId', async (req, res) => {
            try {
              const { email } = req.body;
              const { productId } = req.params;
          
              const cart = await Cart.findOne({ userEmail: email });
          
              if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
              }
          
              cart.items = cart.items.filter(
                item => item.product.productId !== parseInt(productId)
              );
          
              await cart.save();
              res.status(200).json(cart);
            } catch (error) {
              res.status(500).json({ message: 'Error removing from cart', error });
            }
          });
          
          // Update cart item quantity
          app.patch('/api/cart/:productId', async (req, res) => {
            try {
              const { email, quantity } = req.body;
              const { productId } = req.params;
          
              const cart = await Cart.findOne({ userEmail: email });
          
              if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
              }
          
              const itemIndex = cart.items.findIndex(
                item => item.product.productId === parseInt(productId)
              );
          
              if (itemIndex > -1) {
                cart.items[itemIndex].product.quantity = quantity;
                await cart.save();
                res.status(200).json(cart);
              } else {
                res.status(404).json({ message: 'Product not found in cart' });
              }
            } catch (error) {
              res.status(500).json({ message: 'Error updating cart', error });
            }
          });
          
         // Order placement route
         app.post('/api/orders', async (req, res) => {
          try {
              const { email, products, totalAmount, address, paymentMode } = req.body;
      
              // Validate input
              if (!email || !products || !totalAmount || !address || !paymentMode) {
                  return res.status(400).json({ 
                      success: false,
                      message: 'Missing required fields' 
                  });
              }
      
              const normalizedEmail = email.trim().toLowerCase();
      
              // Create order
              const newOrder = new Order({
                  email: normalizedEmail,
                  products,
                  totalAmount,
                  address,
                  paymentMode,
                  orderDate: new Date(),
                  status: 'Processing'
              });
      
              const savedOrder = await newOrder.save();
      
              res.status(201).json({
                  success: true,
                  order: savedOrder
              });
      
          } catch (error) {
              console.error('Order processing error:', error);
              res.status(500).json({ 
                  success: false,
                  message: 'Error creating order',
                  error: error.message 
              });
          }
      });
      
          // Fetch user's orders
          app.get('/api/orders/:email', async (req, res) => {
            try {
              const  {email}  = req.params;
              
              // Find all orders for the user, sorted by most recent first
              const orders = await Order.find({ email }).sort({ orderDate: -1 });
          
              res.status(200).json(orders);
            } catch (error) {
              res.status(500).json({ message: 'Error fetching orders', error });
            }
          });
          
       // Clear entire cart endpoint
     
// In your Express routes file
app.delete('/api/cart/clear/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }

    

    // Delete the cart for the specific user
    const deleteResult = await Cart.deleteMany({ userEmail: email });
if(deleteResult){
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      
    });
  }
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error clearing cart',
      error: error.message 
    });
  }
});
    app.get('/users',async (req, res) => {
      const data = await User.find()
      res.json(data)
      })   
      app.get('/allorder',async (req, res) => {
        const data = await Order.find()
        res.json(data)
        })
        app.patch('/allorder/:id', async (req, res) => {
          try {
            const { id } = req.params;
            const { status } = req.body;
            const updatedOrder = await Order.findByIdAndUpdate(id, { status }, { new: true });
            res.json(updatedOrder);
          } catch (error) {
            res.status(500).json({ error: error.message });
          }
        });   
        app.listen(3000, () => {
    console.log('Server running on port 3000');
});
