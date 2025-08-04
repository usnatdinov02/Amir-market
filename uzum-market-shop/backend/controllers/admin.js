const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // User statistics
    const totalUsers = await User.countDocuments({ role: 'user' });
    const newUsersToday = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfToday }
    });
    const newUsersThisMonth = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfMonth }
    });

    // Product statistics
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 10 } });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });

    // Order statistics
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: startOfToday }
    });
    const monthlyOrders = await Order.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Revenue statistics
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const todayRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const monthlyRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Top selling products
    const topProducts = await Product.find({ sold: { $gt: 0 } })
      .sort({ sold: -1 })
      .limit(5)
      .select('name sold images price');

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(10)
      .select('orderNumber user totalPrice status createdAt');

    // Monthly sales chart data
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getFullYear(), 0, 1) }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Order status breakdown
    const orderStatusBreakdown = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          users: {
            total: totalUsers,
            newToday: newUsersToday,
            newThisMonth: newUsersThisMonth
          },
          products: {
            total: totalProducts,
            active: activeProducts,
            lowStock: lowStockProducts,
            outOfStock: outOfStockProducts
          },
          orders: {
            total: totalOrders,
            pending: pendingOrders,
            today: todayOrders,
            monthly: monthlyOrders
          },
          revenue: {
            total: totalRevenue[0]?.total || 0,
            today: todayRevenue[0]?.total || 0,
            monthly: monthlyRevenue[0]?.total || 0
          }
        },
        charts: {
          monthlySales,
          orderStatusBreakdown
        },
        topProducts,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { role: 'user' };
    
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('cart.product', 'name price images');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's order history
    const orders = await Order.find({ user: user._id })
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        user,
        orders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, isVerified } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow updating other admins
    if (user.role === 'admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot update other admin users'
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, role, isVerified },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting other admins
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Don't allow deleting yourself
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all products for admin
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getAdminProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive === 'true';
    }
    
    if (req.query.lowStock === 'true') {
      query.stock = { $lte: 10 };
    }

    const products = await Product.find(query)
      .sort(req.query.search ? { score: { $meta: 'textScore' } } : '-createdAt')
      .skip(startIndex)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update product status
// @route   PUT /api/admin/products/:id/status
// @access  Private/Admin
exports.updateProductStatus = async (req, res) => {
  try {
    const { isActive, isFeatured } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive, isFeatured },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Bulk update products
// @route   PUT /api/admin/products/bulk-update
// @access  Private/Admin
exports.bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updates } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs are required'
      });
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Updates object is required'
      });
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updates }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} products updated successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};