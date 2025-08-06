const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cart');
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/security');

const router = express.Router();

// All cart routes require authentication
router.use(protect);

router.get('/', apiLimiter, getCart);
router.post('/add', apiLimiter, addToCart);
router.put('/:productId', apiLimiter, updateCartItem);
router.delete('/:productId', apiLimiter, removeFromCart);
router.delete('/', apiLimiter, clearCart);

module.exports = router;