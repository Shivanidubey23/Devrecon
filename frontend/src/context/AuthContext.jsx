import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// API base URL
const API_URL = 'http://localhost:5000/api';

// Auth context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set auth header
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Load user on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        setAuthHeader(storedToken);
        try {
          const response = await axios.get(`${API_URL}/auth/me`);
          setUser(response.data.data.user);
          setIsAuthenticated(true);
          setToken(storedToken);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          setAuthHeader(null);
          setUser(null);
          setIsAuthenticated(false);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      setAuthHeader(token);
      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      setLoading(false);
      
      return { success: true };
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.join(', ') || 
                          'Registration failed';
      
      setError(errorMessage);
      setLoading(false);
      
      return { success: false, error: errorMessage };
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      setAuthHeader(token);
      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      setLoading(false);
      
      return { success: true };
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.join(', ') || 
                          'Login failed';
      
      setError(errorMessage);
      setLoading(false);
      
      return { success: false, error: errorMessage };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setAuthHeader(null);
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};