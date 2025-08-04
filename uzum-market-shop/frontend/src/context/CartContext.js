import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { cartAPI } from '../utils/api';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  items: [],
  itemCount: 0,
  cartTotal: 0,
  isLoading: false,
  error: null,
};

// Action types
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_CART: 'SET_CART',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  CLEAR_CART: 'CLEAR_CART',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Cart reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case CART_ACTIONS.SET_CART:
      return {
        ...state,
        items: action.payload.items || [],
        itemCount: action.payload.itemCount || 0,
        cartTotal: action.payload.cartTotal || 0,
        isLoading: false,
        error: null,
      };

    case CART_ACTIONS.ADD_ITEM:
    case CART_ACTIONS.UPDATE_ITEM:
      return {
        ...state,
        items: action.payload.items || [],
        itemCount: action.payload.itemCount || 0,
        cartTotal: action.payload.cartTotal || 0,
        error: null,
      };

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: action.payload.items || [],
        itemCount: action.payload.itemCount || 0,
        cartTotal: action.payload.cartTotal || 0,
        error: null,
      };

    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        itemCount: 0,
        cartTotal: 0,
        error: null,
      };

    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case CART_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const CartContext = createContext();

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Load cart data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      // Clear cart when user logs out
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  }, [isAuthenticated, user]);

  // Load cart from API
  const loadCart = async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const response = await cartAPI.getCart();
      
      if (response.success) {
        dispatch({
          type: CART_ACTIONS.SET_CART,
          payload: response.data,
        });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: 'Failed to load cart',
      });
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return { success: false, message: 'Not authenticated' };
    }

    try {
      dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
      const response = await cartAPI.addToCart(productId, quantity);
      
      if (response.success) {
        dispatch({
          type: CART_ACTIONS.ADD_ITEM,
          payload: response.data,
        });
        toast.success(response.message || 'Item added to cart');
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to add item to cart');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add item to cart';
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Update cart item quantity
  const updateCartItem = async (productId, quantity) => {
    if (!isAuthenticated) {
      toast.error('Please login to update cart');
      return { success: false, message: 'Not authenticated' };
    }

    try {
      dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
      const response = await cartAPI.updateCartItem(productId, quantity);
      
      if (response.success) {
        dispatch({
          type: CART_ACTIONS.UPDATE_ITEM,
          payload: response.data,
        });
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to update cart item');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update cart item';
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login to remove items from cart');
      return { success: false, message: 'Not authenticated' };
    }

    try {
      dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
      const response = await cartAPI.removeFromCart(productId);
      
      if (response.success) {
        dispatch({
          type: CART_ACTIONS.REMOVE_ITEM,
          payload: response.data,
        });
        toast.success(response.message || 'Item removed from cart');
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to remove item from cart');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove item from cart';
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!isAuthenticated) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
      const response = await cartAPI.clearCart();
      
      if (response.success) {
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
        toast.success(response.message || 'Cart cleared');
        return { success: true };
      } else {
        throw new Error(response.message || 'Failed to clear cart');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to clear cart';
      dispatch({
        type: CART_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return state.items.some(item => item.product._id === productId);
  };

  // Get cart item by product ID
  const getCartItem = (productId) => {
    return state.items.find(item => item.product._id === productId);
  };

  // Get cart item quantity
  const getItemQuantity = (productId) => {
    const item = getCartItem(productId);
    return item ? item.quantity : 0;
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    loadCart,
    isInCart,
    getCartItem,
    getItemQuantity,
    clearError,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};