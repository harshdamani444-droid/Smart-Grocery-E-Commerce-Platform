import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user info is in localStorage and verify with API
  useEffect(() => {
    const checkLoggedIn = async () => {
      const storedUser = localStorage.getItem('userInfo');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const { data } = await api.get('/auth/profile');
          setUser({ ...parsed, ...data }); // Sync latest profile data (like address, wishlist)
        } catch (err) {
          console.error('Session expired or invalid token:', err.message);
          localStorage.removeItem('userInfo');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please check credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const googleLoginStub = async (email, name, googleId) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', { email, name, googleId });
      setUser(data);
      localStorage.setItem('userInfo', JSON.stringify(data));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Google Login failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put('/auth/profile', profileData);
      setUser((prev) => ({ ...prev, ...data }));
      const storedUser = JSON.parse(localStorage.getItem('userInfo'));
      localStorage.setItem('userInfo', JSON.stringify({ ...storedUser, token: data.token, name: data.name, email: data.email, role: data.role }));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update profile.'
      };
    }
  };

  const toggleWishlist = async (productId) => {
    if (!user) return { success: false, message: 'Please login first' };
    try {
      const updatedWishlist = user.wishlist?.some(p => p._id === productId)
        ? user.wishlist.filter(p => p._id !== productId)
        : [...(user.wishlist || []), { _id: productId }];

      setUser(prev => ({ ...prev, wishlist: updatedWishlist }));

      // Call API to persist (using profile update, or we can handle it in backend profile API)
      await api.put('/auth/profile', {
        wishlist: updatedWishlist.map(p => p._id)
      });

      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Failed to update wishlist' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLoginStub,
        logout,
        updateProfile,
        toggleWishlist
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
