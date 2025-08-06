const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderToPaid,
  updateOrderToDelivered,
  getAllOrders,
  getOrderStats
} = require('../controllers/orders');
const { protect, authorize } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/security');

const router = express.Router();

// Validation schemas
const orderValidation = [
  body('orderItems').isArray({ min: 1 }).withMessage('Order items are required'),
  body('shippingAddress.name').trim().notEmpty().withMessage('Shipping name is required'),
  body('shippingAddress.phone').trim().notEmpty().withMessage('Phone number is required'),
  body('shippingAddress.email').isEmail().withMessage('Valid email is required'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.postalCode').trim().notEmpty().withMessage('Postal code is required'),
  body('paymentMethod').isIn(['Cash on Delivery', 'Credit Card', 'Bank Transfer', 'UzCard', 'Humo']).withMessage('Valid payment method is required')
];

// Protected user routes
router.post('/', protect, apiLimiter, orderValidation, createOrder);
router.get('/my-orders', protect, apiLimiter, getMyOrders);
router.get('/:id', protect, apiLimiter, getOrderById);
router.put('/:id/pay', protect, apiLimiter, updateOrderToPaid);

// Admin only routes
router.get('/', protect, authorize('admin'), getAllOrders);
router.get('/stats/overview', protect, authorize('admin'), getOrderStats);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.put('/:id/deliver', protect, authorize('admin'), updateOrderToDelivered);

module.exports = router;