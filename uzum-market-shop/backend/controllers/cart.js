const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'cart.product',
      select: 'name price images stock isActive'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Filter out inactive products and calculate totals
    const activeCartItems = user.cart.filter(item => 
      item.product && item.product.isActive
    );

    const cartTotal = activeCartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);

    const itemCount = activeCartItems.reduce((count, item) => {
      return count + item.quantity;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        items: activeCartItems,
        itemCount,
        cartTotal
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available'
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    const user = await User.findById(req.user.id);

    // Check if product already exists in cart
    const existingCartItem = user.cart.find(
      item => item.product.toString() === productId
    );

    if (existingCartItem) {
      // Update quantity
      const newQuantity = existingCartItem.quantity + quantity;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} items available in stock`
        });
      }

      existingCartItem.quantity = newQuantity;
    } else {
      // Add new item to cart
      user.cart.push({
        product: productId,
        quantity: quantity
      });
    }

    await user.save();

    // Return updated cart
    const updatedUser = await User.findById(req.user.id).populate({
      path: 'cart.product',
      select: 'name price images stock isActive'
    });

    const activeCartItems = updatedUser.cart.filter(item => 
      item.product && item.product.isActive
    );

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: {
        items: activeCartItems,
        itemCount: activeCartItems.reduce((count, item) => count + item.quantity, 0),
        cartTotal: activeCartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not available'
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    const user = await User.findById(req.user.id);

    const cartItem = user.cart.find(
      item => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cartItem.quantity = quantity;
    await user.save();

    // Return updated cart
    const updatedUser = await User.findById(req.user.id).populate({
      path: 'cart.product',
      select: 'name price images stock isActive'
    });

    const activeCartItems = updatedUser.cart.filter(item => 
      item.product && item.product.isActive
    );

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      data: {
        items: activeCartItems,
        itemCount: activeCartItems.reduce((count, item) => count + item.quantity, 0),
        cartTotal: activeCartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);

    const cartItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (cartItemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    user.cart.splice(cartItemIndex, 1);
    await user.save();

    // Return updated cart
    const updatedUser = await User.findById(req.user.id).populate({
      path: 'cart.product',
      select: 'name price images stock isActive'
    });

    const activeCartItems = updatedUser.cart.filter(item => 
      item.product && item.product.isActive
    );

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: {
        items: activeCartItems,
        itemCount: activeCartItems.reduce((count, item) => count + item.quantity, 0),
        cartTotal: activeCartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { cart: [] });

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: {
        items: [],
        itemCount: 0,
        cartTotal: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};