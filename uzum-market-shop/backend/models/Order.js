const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  orderItems: [orderItemSchema],
  shippingAddress: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'Uzbekistan'
    }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash on Delivery', 'Credit Card', 'Bank Transfer', 'UzCard', 'Humo'],
    default: 'Cash on Delivery'
  },
  paymentResult: {
    id: String,
    status: String,
    updateTime: String,
    emailAddress: String
  },
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  taxPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  discountAmount: {
    type: Number,
    default: 0.0
  },
  couponCode: {
    type: String
  },
  isPaid: {
    type: Boolean,
    required: true,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    required: true,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  status: {
    type: String,
    required: true,
    enum: [
      'Pending',
      'Confirmed',
      'Processing',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Returned',
      'Refunded'
    ],
    default: 'Pending'
  },
  trackingNumber: {
    type: String
  },
  estimatedDelivery: {
    type: Date
  },
  notes: {
    type: String
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  refundInfo: {
    reason: String,
    amount: Number,
    processedAt: Date,
    refundId: String
  }
}, {
  timestamps: true
});

// Add status to history when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      note: `Order status changed to ${this.status}`
    });
  }
  next();
});

// Calculate order total
orderSchema.methods.calculateTotal = function() {
  this.itemsPrice = this.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice - this.discountAmount;
  return this.totalPrice;
};

// Generate order number
orderSchema.methods.generateOrderNumber = function() {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  
  return `UZ${year}${month}${day}${random}`;
};

// Add order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber && this.isNew) {
    this.orderNumber = this.generateOrderNumber();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);