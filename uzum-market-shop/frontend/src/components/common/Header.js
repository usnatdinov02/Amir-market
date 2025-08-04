import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  ChevronDown,
  LogOut,
  Settings,
  Package,
  Heart,
  MapPin,
  Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Header.css';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTopBar, setShowTopBar] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { itemCount, cartTotal } = useCart();
  
  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Categories for navigation
  const categories = [
    { name: 'Electronics', path: '/category/Electronics' },
    { name: 'Clothing', path: '/category/Clothing' },
    { name: 'Home & Garden', path: '/category/Home & Garden' },
    { name: 'Sports & Outdoors', path: '/category/Sports & Outdoors' },
    { name: 'Beauty & Health', path: '/category/Beauty & Health' },
    { name: 'Books & Media', path: '/category/Books & Media' },
    { name: 'Toys & Games', path: '/category/Toys & Games' },
    { name: 'Automotive', path: '/category/Automotive' },
  ];

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  // Hide top bar on scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setShowTopBar(false);
      } else {
        setShowTopBar(true);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="header">
      {/* Top Bar */}
      <div className={`header-top ${showTopBar ? 'visible' : 'hidden'}`}>
        <div className="container">
          <div className="header-top-content">
            <div className="header-top-left">
              <div className="contact-info">
                <span className="contact-item">
                  <Phone size={14} />
                  +998 90 123 45 67
                </span>
                <span className="contact-item">
                  <MapPin size={14} />
                  Tashkent, Uzbekistan
                </span>
              </div>
            </div>
            
            <div className="header-top-right">
              <div className="top-links">
                <Link to="/about" className="top-link">About Us</Link>
                <Link to="/contact" className="top-link">Contact</Link>
                {isAuthenticated && isAdmin() && (
                  <Link to="/admin/dashboard" className="top-link admin-link">
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="header-main">
        <div className="container">
          <div className="header-main-content">
            {/* Logo */}
            <Link to="/" className="logo">
              <div className="logo-icon">🛒</div>
              <div className="logo-text">
                <span className="logo-name">Uzum</span>
                <span className="logo-market">Market</span>
              </div>
            </Link>

            {/* Search Bar */}
            <form className="search-form" onSubmit={handleSearch}>
              <div className="search-input-group">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-button">
                  <Search size={20} />
                </button>
              </div>
            </form>

            {/* Header Actions */}
            <div className="header-actions">
              {/* Cart */}
              <Link to="/cart" className="header-action cart-action">
                <div className="action-icon">
                  <ShoppingCart size={24} />
                  {itemCount > 0 && (
                    <span className="cart-badge">{itemCount}</span>
                  )}
                </div>
                <div className="action-text">
                  <span className="action-label">Cart</span>
                  <span className="action-value">${cartTotal.toFixed(2)}</span>
                </div>
              </Link>

              {/* User Menu */}
              <div className="user-menu" ref={userMenuRef}>
                <button
                  className="header-action user-action"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="action-icon">
                    <User size={24} />
                  </div>
                  <div className="action-text">
                    <span className="action-label">
                      {isAuthenticated ? user?.name : 'Account'}
                    </span>
                    <span className="action-value">
                      {isAuthenticated ? 'My Account' : 'Sign In'}
                    </span>
                  </div>
                  <ChevronDown size={16} className="dropdown-arrow" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="user-dropdown">
                    {isAuthenticated ? (
                      <>
                        <div className="user-info">
                          <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="user-details">
                            <div className="user-name">{user?.name}</div>
                            <div className="user-email">{user?.email}</div>
                          </div>
                        </div>
                        <div className="dropdown-divider"></div>
                        <Link to="/dashboard" className="dropdown-item">
                          <Settings size={16} />
                          Dashboard
                        </Link>
                        <Link to="/orders" className="dropdown-item">
                          <Package size={16} />
                          My Orders
                        </Link>
                        <Link to="/profile" className="dropdown-item">
                          <User size={16} />
                          Profile
                        </Link>
                        <div className="dropdown-divider"></div>
                        <button onClick={handleLogout} className="dropdown-item logout-item">
                          <LogOut size={16} />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="dropdown-item">
                          <User size={16} />
                          Sign In
                        </Link>
                        <Link to="/register" className="dropdown-item">
                          <Settings size={16} />
                          Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="mobile-menu-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="header-nav">
        <div className="container">
          <div className="nav-content">
            <div className="nav-categories">
              <div className="categories-menu">
                <button className="categories-button">
                  <Menu size={18} />
                  All Categories
                  <ChevronDown size={16} />
                </button>
                <div className="categories-dropdown">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.path}
                      className="category-item"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="nav-links">
              <Link 
                to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}
              >
                Products
              </Link>
              <Link 
                to="/category/Electronics" 
                className="nav-link"
              >
                Electronics
              </Link>
              <Link 
                to="/category/Clothing" 
                className="nav-link"
              >
                Fashion
              </Link>
              <Link 
                to="/about" 
                className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`}
              >
                Contact
              </Link>
            </div>

            <div className="nav-actions">
              <span className="delivery-info">
                🚚 Free delivery on orders over $100
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu" ref={mobileMenuRef}>
          <div className="mobile-menu-content">
            {/* Mobile Search */}
            <form className="mobile-search" onSubmit={handleSearch}>
              <div className="search-input-group">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-button">
                  <Search size={20} />
                </button>
              </div>
            </form>

            {/* Mobile Navigation */}
            <div className="mobile-nav">
              <Link to="/" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/products" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                Products
              </Link>
              
              <div className="mobile-categories">
                <div className="mobile-categories-title">Categories</div>
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.path}
                    className="mobile-category-item"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>

              <Link to="/about" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                About
              </Link>
              <Link to="/contact" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                Contact
              </Link>

              {isAuthenticated && (
                <>
                  <div className="mobile-divider"></div>
                  <Link to="/dashboard" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/orders" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                    My Orders
                  </Link>
                  <Link to="/profile" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>
                    Profile
                  </Link>
                  {isAdmin() && (
                    <Link to="/admin/dashboard" className="mobile-nav-item admin-link" onClick={() => setIsMobileMenuOpen(false)}>
                      Admin Panel
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;