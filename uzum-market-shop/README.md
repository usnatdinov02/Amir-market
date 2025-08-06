# 🛒 Uzum Market - Complete Online Shopping Platform

A fully functional online shopping platform inspired by Uzum Market with an Alibaba-style yellow theme. Built with modern technologies and comprehensive security features.

![Uzum Market](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-green)

## ✨ Features

### 🔐 Secure Authentication System
- **User Registration & Login** with email/password
- **Admin Authentication** with separate login portal
- **JWT Token-based Security** with secure cookies
- **Password Encryption** using bcrypt
- **Role-based Access Control** (User/Admin)
- **Password Reset** functionality

### 👨‍💼 Admin Panel (Completely Secure)
- **Hidden from regular users** - accessible only at `/admin`
- **Comprehensive Dashboard** with sales analytics
- **Product Management**:
  - Add, edit, delete products
  - Upload multiple product images
  - Set pricing, stock, categories, discounts
  - Featured product controls
- **Order Management**:
  - View and track all orders
  - Update order status and tracking
  - Order analytics and reporting
- **User Management**:
  - View registered users
  - Manage user accounts
- **Security Features**:
  - CSRF protection
  - XSS prevention
  - Rate limiting
  - Input validation

### 👥 User Experience
- **Product Browsing**:
  - Category-based navigation
  - Advanced search functionality
  - Product filtering and sorting
  - Featured products and recommendations
- **Shopping Cart**:
  - Add/remove items
  - Quantity management
  - Real-time price updates
  - Persistent cart storage
- **Checkout Process**:
  - Secure order placement
  - Multiple payment methods
  - Delivery address management
  - Order confirmation
- **User Account**:
  - Order history and tracking
  - Profile management
  - Review and rating system

### 🎨 Modern Design
- **Alibaba-Inspired Yellow Theme**
- **Fully Responsive Design** (Mobile & Desktop)
- **Clean, Professional Layout**
- **Smooth Animations** with Framer Motion
- **Modern UI Components**
- **Excellent UX Patterns**

### 🛡️ Security & Performance
- **HTTPS Ready** with security headers
- **Rate Limiting** to prevent abuse
- **Input Sanitization** and validation
- **XSS & CSRF Protection**
- **MongoDB Injection Prevention**
- **Compression** for faster loading
- **Image Optimization**
- **Caching Strategies**

## 🚀 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Helmet** - Security headers
- **Express Rate Limit** - Rate limiting

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **React Query** - Data fetching
- **React Hook Form** - Form handling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Axios** - HTTP client

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (version 18 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**
- **npm** or **yarn**

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd uzum-market-shop
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install-all
```

### 3. Environment Setup
```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env with your configuration
```

**Required Environment Variables:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/uzum-market
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@uzummarket.com
ADMIN_PASSWORD=SecureAdmin123!
```

### 4. Start MongoDB
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

### 5. Run the Application
```bash
# Development mode (both backend and frontend)
npm run dev

# Or run separately:
npm run backend   # Backend only (port 5000)
npm run frontend  # Frontend only (port 3000)
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Admin Panel**: http://localhost:3000/admin

## 👨‍💼 Default Admin Access

**Email**: admin@uzummarket.com  
**Password**: SecureAdmin123!

⚠️ **Important**: Change these credentials in production!

## 📂 Project Structure

```
uzum-market-shop/
├── backend/
│   ├── controllers/          # Request handlers
│   ├── middleware/          # Security & auth middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── uploads/            # File uploads
│   ├── server.js           # Express server
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── admin/      # Admin components
│   │   │   ├── user/       # User components
│   │   │   └── common/     # Shared components
│   │   ├── context/        # React context
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── styles/         # CSS files
│   │   ├── utils/          # Utilities
│   │   └── App.js
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Run both backend and frontend
npm run backend          # Run backend only
npm run frontend         # Run frontend only

# Production
npm run build           # Build frontend for production
npm start              # Start production server

# Installation
npm run install-all    # Install all dependencies
```

## 🛡️ Security Features Implemented

1. **Authentication & Authorization**
   - JWT tokens with secure cookies
   - Role-based access control
   - Admin panel protection

2. **Input Validation & Sanitization**
   - Express Validator for input validation
   - MongoDB injection prevention
   - XSS protection

3. **Security Headers**
   - Helmet.js for security headers
   - CORS configuration
   - Content Security Policy

4. **Rate Limiting**
   - API rate limiting
   - Authentication attempt limiting
   - File upload restrictions

5. **Password Security**
   - Bcrypt hashing with salt rounds
   - Strong password requirements
   - Secure password reset

## 🚀 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Set production environment
export NODE_ENV=production

# Start production server
npm start
```

### Environment Variables (Production)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/uzum-market
JWT_SECRET=your-super-secure-production-jwt-secret
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD=SecureProductionPassword123!
```

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

## 🎨 Customization

### Changing Colors
Edit CSS variables in `frontend/src/index.css`:
```css
:root {
  --primary-yellow: #FFD700;
  --primary-orange: #FFA500;
  --primary-dark: #FF8C00;
  /* Add your custom colors */
}
```

### Adding New Product Categories
Update the categories array in:
- `backend/models/Product.js`
- `frontend/src/components/common/Header.js`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 API Documentation

### Authentication Endpoints
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/admin/login  # Admin login
GET  /api/auth/me          # Get current user
POST /api/auth/logout      # Logout
```

### Product Endpoints
```
GET    /api/products           # Get all products
GET    /api/products/:id       # Get single product
POST   /api/products           # Create product (Admin)
PUT    /api/products/:id       # Update product (Admin)
DELETE /api/products/:id       # Delete product (Admin)
```

### Order Endpoints
```
POST /api/orders              # Create order
GET  /api/orders/my-orders    # Get user orders
GET  /api/orders/:id          # Get single order
```

### Cart Endpoints
```
GET    /api/cart              # Get cart
POST   /api/cart/add          # Add to cart
PUT    /api/cart/:productId   # Update cart item
DELETE /api/cart/:productId   # Remove from cart
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Make sure MongoDB is running
   sudo systemctl start mongod
   # Or check your MongoDB Atlas connection string
   ```

2. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   npx kill-port 5000
   # Or change PORT in .env
   ```

3. **Frontend Not Loading**
   ```bash
   # Clear npm cache
   npm cache clean --force
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📞 Support

For support, email support@uzummarket.com or create an issue in the repository.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the Uzum Market Team**

🌟 **Don't forget to star this repository if you found it helpful!**