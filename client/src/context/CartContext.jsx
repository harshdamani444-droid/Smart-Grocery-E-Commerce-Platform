import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null); // { code, discountType, discountValue }
  const [couponError, setCouponError] = useState('');

  // Load cart from localStorage or user profile
  useEffect(() => {
    if (user && user.cart) {
      // Map user cart if populated on backend
      const mapped = user.cart.map(item => ({
        _id: item.product._id || item.product,
        name: item.product.name,
        price: item.product.price,
        image: item.product.image,
        qty: item.quantity,
        stock: item.product.stock,
        unit: item.product.unit
      })).filter(item => item.name); // Filter out unpopulated items if any
      
      if (mapped.length > 0) {
        setCartItems(mapped);
        return;
      }
    }

    const localCart = localStorage.getItem('cartItems');
    if (localCart) {
      setCartItems(JSON.parse(localCart));
    }
  }, [user]);

  // Persist cart to localStorage & backend (if logged in)
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));

    const syncCartWithBackend = async () => {
      if (user) {
        try {
          await api.put('/auth/profile', {
            cart: cartItems.map(item => ({
              product: item._id,
              quantity: item.qty
            }))
          });
        } catch (err) {
          console.error('Failed to sync cart to backend:', err.message);
        }
      }
    };

    const timer = setTimeout(() => {
      syncCartWithBackend();
    }, 1000); // debounce API calls

    return () => clearTimeout(timer);
  }, [cartItems, user]);

  const addToCart = (product, qty = 1) => {
    setCartItems(prevItems => {
      const existItem = prevItems.find(item => item._id === product._id);
      if (existItem) {
        const newQty = Math.min(existItem.stock, existItem.qty + qty);
        return prevItems.map(item =>
          item._id === product._id ? { ...item, qty: newQty } : item
        );
      } else {
        return [...prevItems, {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          qty: Math.min(product.stock, qty),
          stock: product.stock,
          unit: product.unit || '1 unit'
        }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item._id !== productId));
  };

  const changeQty = (productId, qty) => {
    setCartItems(prev =>
      prev.map(item =>
        item._id === productId
          ? { ...item, qty: Math.min(item.stock, Math.max(1, qty)) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponCode('');
    setAppliedDiscount(null);
    localStorage.removeItem('cartItems');
  };

  const applyCoupon = async (code) => {
    if (!code) return { success: false, message: 'Please enter a coupon code' };
    setCouponError('');
    try {
      const cartTotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
      const { data } = await api.post('/coupons/validate', { code, cartTotal });
      setAppliedDiscount(data);
      setCouponCode(data.code);
      return { success: true, discount: data };
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Invalid coupon';
      setCouponError(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setAppliedDiscount(null);
    setCouponError('');
  };

  // Calculations
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxPrice = Math.round(itemsPrice * 0.05); // 5% GST
  const shippingPrice = itemsPrice > 500 || itemsPrice === 0 ? 0 : 40; // Free delivery above 500
  
  let discountPrice = 0;
  if (appliedDiscount) {
    if (appliedDiscount.discountType === 'percentage') {
      discountPrice = Math.round(itemsPrice * (appliedDiscount.discountValue / 100));
    } else {
      discountPrice = appliedDiscount.discountValue;
    }
  }

  const totalPrice = Math.max(0, itemsPrice + taxPrice + shippingPrice - discountPrice);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        couponCode,
        appliedDiscount,
        couponError,
        addToCart,
        removeFromCart,
        changeQty,
        clearCart,
        applyCoupon,
        removeCoupon,
        itemsPrice,
        taxPrice,
        shippingPrice,
        discountPrice,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
