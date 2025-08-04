const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAdminProducts,
  updateProductStatus,
  bulkUpdateProducts
} = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/security');

const router = express.Router();

// All admin routes require admin authorization
router.use(protect);
router.use(authorize('admin'));

// Dashboard and stats
router.get('/dashboard', apiLimiter, getDashboardStats);

// User management
router.get('/users', apiLimiter, getAllUsers);
router.get('/users/:id', apiLimiter, getUserById);
router.put('/users/:id', apiLimiter, updateUser);
router.delete('/users/:id', apiLimiter, deleteUser);

// Product management
router.get('/products', apiLimiter, getAdminProducts);
router.put('/products/:id/status', apiLimiter, updateProductStatus);
router.put('/products/bulk-update', apiLimiter, bulkUpdateProducts);

module.exports = router;