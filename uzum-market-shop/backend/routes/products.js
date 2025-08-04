const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  addProductReview,
  getProductReviews,
  deleteProductReview,
  getTopProducts,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts
} = require('../controllers/products');
const { protect, authorize } = require('../middleware/auth');
const { apiLimiter, fileUploadSecurity } = require('../middleware/security');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Public routes
router.get('/', apiLimiter, getProducts);
router.get('/search', apiLimiter, searchProducts);
router.get('/top', apiLimiter, getTopProducts);
router.get('/featured', apiLimiter, getFeaturedProducts);
router.get('/category/:category', apiLimiter, getProductsByCategory);
router.get('/:id', apiLimiter, getProduct);
router.get('/:id/reviews', apiLimiter, getProductReviews);

// Protected user routes
router.post('/:id/reviews', protect, addProductReview);
router.delete('/:id/reviews/:reviewId', protect, deleteProductReview);

// Admin only routes
router.post('/', protect, authorize('admin'), createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.post('/:id/upload-image', protect, authorize('admin'), upload.single('image'), fileUploadSecurity, uploadProductImage);

module.exports = router;