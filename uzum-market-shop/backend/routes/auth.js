const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  adminLogin,
  adminRegister,
  forgotPassword,
  resetPassword
} = require('../controllers/auth');
const { protect, adminOnly, authorize } = require('../middleware/auth');
const { authLimiter, validateInput } = require('../middleware/security');

const router = express.Router();

// Validation schemas
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const passwordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

// Public routes
router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:resettoken', authLimiter, resetPassword);

// Admin routes
router.post('/admin/login', authLimiter, loginValidation, adminLogin);
router.post('/admin/register', authLimiter, protect, authorize('admin'), registerValidation, adminRegister);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, passwordValidation, changePassword);

module.exports = router;