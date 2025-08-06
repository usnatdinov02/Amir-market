const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      couponCode
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No order items'
      });
    }

    // Verify order items and update stock
    const processedItems = [];
    for (let item of orderItems) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      // Update product stock and sold count
      product.stock -= item.quantity;
      product.sold += item.quantity;
      await product.save();

      processedItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '/images/default-product.png',
        price: product.price,
        quantity: item.quantity
      });
    }

    // Calculate totals
    const calculatedItemsPrice = processedItems.reduce(
      (acc, item) => acc + item.price * item.quantity, 0
    );

    const calculatedTaxPrice = calculatedItemsPrice * 0.12; // 12% tax
    const calculatedShippingPrice = calculatedItemsPrice > 100 ? 0 : 10; // Free shipping over $100
    const calculatedTotalPrice = calculatedItemsPrice + calculatedTaxPrice + calculatedShippingPrice;

    const order = new Order({
      orderItems: processedItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice: calculatedItemsPrice,
      taxPrice: calculatedTaxPrice,
      shippingPrice: calculatedShippingPrice,
      totalPrice: calculatedTotalPrice,
      couponCode
    });

    // Generate order number
    order.orderNumber = order.generateOrderNumber();

    const createdOrder = await order.save();

    // Clear user's cart
    await User.findByIdAndUpdate(req.user._id, { cart: [] });

    res.status(201).json({
      success: true,
      data: createdOrder
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during order creation'
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id })
      .populate('orderItems.product', 'name images')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    const total = await Order.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'Confirmed';
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      updateTime: req.body.update_time,
      emailAddress: req.body.email_address
    };

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
exports.updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'Delivered';

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update order status
    order.status = status;
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    if (notes) {
      order.notes = notes;
    }

    // Set delivered status if status is 'Delivered'
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    // Set estimated delivery date for shipped orders
    if (status === 'Shipped' && !order.estimatedDelivery) {
      const estimatedDate = new Date();
      estimatedDate.setDate(estimatedDate.getDate() + 3); // 3 days from now
      order.estimatedDelivery = estimatedDate;
    }

    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.isPaid) {
      query.isPaid = req.query.isPaid === 'true';
    }
    
    if (req.query.isDelivered) {
      query.isDelivered = req.query.isDelivered === 'true';
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/stats/overview
// @access  Private/Admin
exports.getOrderStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Total orders and revenue
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Today's stats
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: startOfDay }
    });
    const todayRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // This week's stats
    const weekOrders = await Order.countDocuments({
      createdAt: { $gte: startOfWeek }
    });

    // This month's stats
    const monthOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const monthRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Order status breakdown
    const statusBreakdown = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          todayOrders,
          todayRevenue: todayRevenue[0]?.total || 0,
          weekOrders,
          monthOrders,
          monthRevenue: monthRevenue[0]?.total || 0
        },
        statusBreakdown,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};