import React, { createContext, useContext, useReducer, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '../utils/api';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        error: null,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = Cookies.get('token');
      
      if (token) {
        try {
          const response = await authAPI.getMe();
          if (response.success) {
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: {
                user: response.user,
                token: token,
              },
            });
          } else {
            throw new Error('Invalid token');
          }
        } catch (error) {
          // Token is invalid, remove it
          Cookies.remove('token');
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password, isAdmin = false) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const endpoint = isAdmin ? authAPI.adminLogin : authAPI.login;
      const response = await endpoint(email, password);

      if (response.success) {
        // Set token in cookie
        Cookies.set('token', response.token, { 
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.user,
            token: response.token,
          },
        });

        return { success: true };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.register(userData);

      if (response.success) {
        // Set token in cookie
        Cookies.set('token', response.token, { 
          expires: 7,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.user,
            token: response.token,
          },
        });

        return { success: true };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Remove token from cookie
      Cookies.remove('token');
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.updateProfile(userData);

      if (response.success) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: response.user,
        });
        return { success: true };
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authAPI.changePassword(currentPassword, newPassword);

      if (response.success) {
        return { success: true };
      } else {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Password change failed';
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      return { success: false, message: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user is admin
  const isAdmin = () => {
    return state.user?.role === 'admin';
  };

  // Get authorization header
  const getAuthHeader = () => {
    return state.token ? `Bearer ${state.token}` : null;
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
    isAdmin,
    getAuthHeader,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};