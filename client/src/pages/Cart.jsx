import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Tag, Calendar, Clock, CreditCard, ChevronRight, Sparkles, MapPin, QrCode, Smartphone, Loader2 } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const Cart = () => {
  const {
    cartItems,
    couponCode,
    appliedDiscount,
    couponError,
    changeQty,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discountPrice,
    totalPrice,
    clearCart
  } = useContext(CartContext);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Checkout states
  const [couponInput, setCouponInput] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('09:00 AM - 12:00 PM');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [checkoutMsg, setCheckoutMsg] = useState('');

  const [placingOrder, setPlacingOrder] = useState(false);

  // Razorpay Payment States
  const [showRzpMockModal, setShowRzpMockModal] = useState(false);
  const [rzpMockDetails, setRzpMockDetails] = useState(null);
  const [rzpMockUpi, setRzpMockUpi] = useState('success@razorpay');

  // Set default delivery date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDeliveryDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  // Autofill user's default address if logged in
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      const defAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setStreet(defAddr.street);
      setCity(defAddr.city);
      setState(defAddr.state);
      setZipCode(defAddr.zipCode);
    }
  }, [user]);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    await applyCoupon(couponInput);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayMockSuccess = async () => {
    setPlacingOrder(true);
    try {
      const verifyPayload = {
        orderId: rzpMockDetails.orderId,
        razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
        razorpay_order_id: rzpMockDetails.rzpOrderId,
        isMock: true
      };
      await api.post('/payment/razorpay/verify', verifyPayload);
      clearCart();
      setShowRzpMockModal(false);
      navigate(`/orders/${rzpMockDetails.orderId}`);
    } catch (err) {
      setCheckoutMsg(err.response?.data?.message || 'Error verifying simulation payment.');
      setShowRzpMockModal(false);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=cart');
      return;
    }
    if (cartItems.length === 0) return;
    if (!street || !city || !state || !zipCode) {
      setCheckoutMsg('Please fill in complete delivery address details.');
      return;
    }
    setCheckoutMsg('');
    setPlacingOrder(true);

    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          product: item._id
        })),
        shippingAddress: { street, city, state, zipCode },
        paymentMethod: 'Razorpay',
        deliverySlot,
        deliveryDate,
        itemsPrice,
        taxPrice,
        shippingPrice,
        discountPrice,
        totalPrice
      };

      // 1. Create order in database
      const { data: order } = await api.post('/orders', orderData);

      // 2. Generate Razorpay order from backend
      const { data: rzpOrderRes } = await api.post('/payment/razorpay/order', { orderId: order._id });

      if (rzpOrderRes.isMock) {
        // Keys not configured — show simulation modal
        setRzpMockDetails({
          orderId: order._id,
          rzpOrderId: rzpOrderRes.orderId,
          amount: totalPrice
        });
        setShowRzpMockModal(true);
        setPlacingOrder(false);
      } else {
        // 3. Load Razorpay checkout script
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          setCheckoutMsg('Failed to load Razorpay SDK. Please check your internet connection.');
          setPlacingOrder(false);
          return;
        }

        const options = {
          key: rzpOrderRes.keyId,
          amount: rzpOrderRes.amount,
          currency: rzpOrderRes.currency,
          name: 'HD Mart',
          description: `Order #${order._id.substring(18)}`,
          order_id: rzpOrderRes.orderId,
          config: {
            display: {
              blocks: {
                upi: { name: 'Pay via UPI', instruments: [{ method: 'upi' }] },
                other: { name: 'Other Methods', instruments: [{ method: 'card' }, { method: 'netbanking' }] }
              },
              sequence: ['block.upi', 'block.other'],
              preferences: { show_default_blocks: false }
            }
          },
          handler: async function (response) {
            setPlacingOrder(true);
            try {
              const verifyPayload = {
                orderId: order._id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                isMock: false
              };
              await api.post('/payment/razorpay/verify', verifyPayload);
              clearCart();
              navigate(`/orders/${order._id}`);
            } catch (err) {
              setCheckoutMsg(err.response?.data?.message || 'Payment verification failed.');
            } finally {
              setPlacingOrder(false);
            }
          },
          prefill: { name: user.name, email: user.email },
          theme: { color: '#1780EB' },
          modal: {
            ondismiss: function () {
              setCheckoutMsg('Payment cancelled.');
              setPlacingOrder(false);
            }
          }
        };

        const rzpInstance = new window.Razorpay(options);
        rzpInstance.open();
        setPlacingOrder(false);
      }
    } catch (err) {
      setCheckoutMsg(err.response?.data?.message || 'Error starting payment. Please try again.');
      setPlacingOrder(false);
    }
  };

  const handlePaymentSuccessSimulate = async (utr) => {
    setPlacingOrder(true);
    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          product: item._id
        })),
        shippingAddress: { street, city, state, zipCode },
        paymentMethod: 'UPI',
        deliverySlot,
        deliveryDate,
        itemsPrice,
        taxPrice,
        shippingPrice,
        discountPrice,
        totalPrice
      };

      // 1. Create order on backend
      const { data: order } = await api.post('/orders', orderData);

      // 2. Mark order as paid immediately using UTR as payment reference ID
      const paymentResult = {
        id: utr,
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: user.email
      };
      await api.put(`/orders/${order._id}/pay`, paymentResult);

      // 3. Clear shopping cart and redirect
      clearCart();
      setShowPaymentModal(false);
      navigate(`/orders/${order._id}`);
    } catch (err) {
      setCheckoutMsg(err.response?.data?.message || 'Error processing payment checkout.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="h-20 w-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <ShoppingCart className="h-10 w-10" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Your Shopping Cart is Empty</h2>
          <p className="text-slate-500 text-sm mt-1">Browse our store catalog and pick fresh products.</p>
        </div>
        <Link
          to="/shop"
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-3.5 rounded-full shadow-md"
        >
          Browse All Groceries
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
        <p className="text-slate-500 text-sm mt-1">Review items, apply codes, choose delivery times, and checkout</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            {cartItems.map(item => (
              <div key={item._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-50 gap-4">
                
                {/* Product Detail Info */}
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 bg-slate-50 rounded-xl p-2 flex items-center justify-center flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100' fill='%23f8fafc'%3E%3Crect width='100%25' height='100%25'/%3E%3Ccircle cx='50' cy='45' r='15' stroke='%23cbd5e1' stroke-width='2' fill='none'/%3E%3Cpath d='M45 45h10m-5-5v10' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round'/%3E%3Ctext x='50' y='75' fill='%2394a3b8' font-family='sans-serif' font-size='6' font-weight='bold' text-anchor='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                      }}
                      className="object-contain max-h-full" 
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{item.unit}</p>
                    <span className="text-slate-800 font-extrabold text-sm block sm:hidden mt-1">₹{item.price}</span>
                  </div>
                </div>

                {/* Qty Selector & Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-8">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => changeQty(item._id, item.qty - 1)}
                      className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-bold"
                    >
                      -
                    </button>
                    <span className="text-sm font-bold text-slate-800 px-2">{item.qty}</span>
                    <button
                      onClick={() => changeQty(item._id, item.qty + 1)}
                      className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div className="hidden sm:block text-right min-w-[70px]">
                    <span className="text-slate-900 font-extrabold text-sm">₹{item.price * item.qty}</span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          {/* Delivery Configuration: Date/Slot & Address Forms */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-base flex items-center pb-3 border-b border-slate-50">
              <Calendar className="h-5 w-5 mr-2 text-emerald-500" />
              Delivery Slot & Address Details
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Date & Slot selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1">Select Delivery Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1">Select Convenient Time Slot</label>
                  <select
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM (Morning)</option>
                    <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM (Noon)</option>
                    <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM (Evening)</option>
                    <option value="06:00 PM - 09:00 PM">06:00 PM - 09:00 PM (Night)</option>
                  </select>
                </div>
              </div>

              {/* Delivery Address Form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1">Street Address</label>
                  <input
                    type="text"
                    placeholder="Flat No, Wing, Apartment name"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-slate-600 text-[10px] font-semibold mb-1">City</label>
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-slate-600 text-[10px] font-semibold mb-1">State</label>
                    <input
                      type="text"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-slate-600 text-[10px] font-semibold mb-1">Zip</label>
                    <input
                      type="text"
                      placeholder="Zip"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method - Razorpay Only */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center pb-3 border-b border-slate-50">
              <CreditCard className="h-5 w-5 mr-2 text-emerald-500" />
              Payment Method
            </h3>
            <div className="max-w-md">
              <div className="flex flex-col items-start p-5 rounded-2xl border border-blue-500 bg-blue-50/30 ring-1 ring-blue-500 w-full">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#1780EB] font-black text-base italic tracking-tight">Razorpay</span>
                    <span className="text-[9px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">✓ ACTIVE</span>
                  </div>
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                </div>
                <span className="text-[11px] text-slate-600 mt-2 leading-snug">
                  Pay securely using UPI, Debit/Credit Card, or NetBanking
                </span>
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded">📱 UPI</span>
                  <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded">💳 Cards</span>
                  <span className="text-[10px] bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded">🏦 NetBanking</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">🔒 256-bit Secure</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2">GPay · PhonePe · Paytm · BHIM · All UPI Apps supported</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Summary Sidepanel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-900 text-base pb-3 border-b border-slate-50">
              Payment Summary
            </h3>

            {/* Coupons box */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Promo Coupon</span>
              {couponCode ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
                  <div className="flex items-center text-emerald-800 text-xs font-bold">
                    <Tag className="h-4 w-4 mr-1.5" />
                    <span>{couponCode} APPLIED</span>
                  </div>
                  <button onClick={removeCoupon} className="text-red-500 font-bold text-xs hover:text-red-600">
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (HDMART10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 w-full uppercase focus:outline-none focus:ring-2 focus:ring-[#02529c]"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold px-4 rounded-xl cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && <span className="text-[10px] text-red-500 font-bold block">{couponError}</span>}
            </div>

            {/* Pricing details table */}
            <div className="space-y-3 text-sm border-t border-slate-50 pt-4">
              <div className="flex items-center justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800">₹{itemsPrice}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>GST Tax (5%)</span>
                <span className="font-semibold text-slate-800">₹{taxPrice}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Shipping Delivery</span>
                <span className="font-semibold text-slate-800">
                  {shippingPrice === 0 ? <span className="text-emerald-600">FREE</span> : `₹${shippingPrice}`}
                </span>
              </div>
              {discountPrice > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountPrice}</span>
                </div>
              )}
              <hr className="border-slate-50 my-1" />
              <div className="flex items-center justify-between text-base font-extrabold text-slate-900">
                <span>Total Price</span>
                <span className="text-lg">₹{totalPrice}</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutSubmit}
              disabled={placingOrder}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-extrabold py-3.5 rounded-full shadow-lg shadow-emerald-100 flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              {placingOrder ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Verify & Pay Checkout</span>
                  <ChevronRight className="h-5 w-5" />
                </>
              )}
            </button>

            {checkoutMsg && <div className="text-center text-xs text-red-500 font-bold pt-2">{checkoutMsg}</div>}
          </div>
        </div>

      </div>

      {/* Razorpay Simulation Modal */}
      {showRzpMockModal && rzpMockDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-slate-100 shadow-2xl space-y-6 relative overflow-hidden animate-scale-in animate-duration-200">
            {/* Razorpay brand colored top bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-500" />
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="text-[#1780EB] font-black text-xl italic tracking-tight">Razorpay</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">Test Mode</span>
              </div>
              <button 
                onClick={() => setShowRzpMockModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50/50 border border-blue-100/80 p-4 rounded-2xl space-y-2">
              <div className="flex items-start space-x-2 text-blue-800 text-xs">
                <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Developer Notice: Simulation Active</span>
                  <span className="text-[11px] text-blue-700 leading-normal block mt-0.5">
                    Razorpay credentials are not set in `.env`. We are simulating the Razorpay Web Checkout interface.
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Order ID</span>
                  <span className="font-mono text-xs text-slate-700">{rzpMockDetails.rzpOrderId}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Amount Due</span>
                  <span className="font-extrabold text-slate-900 text-base">₹{rzpMockDetails.amount}</span>
                </div>
              </div>

              {/* UPI App simulation details */}
              <div className="space-y-2">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Simulated UPI Address</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={rzpMockUpi}
                    onChange={(e) => setRzpMockUpi(e.target.value)}
                    placeholder="success@razorpay"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Tip: Any input simulates a successful payment. Use <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono text-[9px]">fail@razorpay</code> to test transaction failure.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  if (rzpMockUpi.trim() === 'fail@razorpay') {
                    setCheckoutMsg('Transaction failed. Simulated payment rejected by customer.');
                    setShowRzpMockModal(false);
                    return;
                  }
                  handleRazorpayMockSuccess();
                }}
                disabled={placingOrder}
                className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
              >
                {placingOrder ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Pay Successfully</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowRzpMockModal(false)}
                disabled={placingOrder}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-3 px-4 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Cart;
