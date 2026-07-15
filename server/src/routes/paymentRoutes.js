import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getPaymentConfig, savePaymentConfig } from '../config/paymentConfig.js';

const router = express.Router();

// Helper to check if credentials are set
const isRazorpayConfigured = () => {
  const { keyId, keySecret } = getPaymentConfig();
  return (
    keyId &&
    keyId !== 'rzp_test_YOUR_KEY_ID' &&
    keySecret &&
    keySecret !== 'YOUR_KEY_SECRET'
  );
};

// @desc    Get current payment gateway credentials state (Admin-only)
// @route   GET /api/payment/config
// @access  Private/Admin
router.get('/config', protect, admin, async (req, res) => {
  try {
    const { keyId, keySecret } = getPaymentConfig();
    res.json({
      success: true,
      keyId: keyId || '',
      hasSecret: !!keySecret,
      isConfigured: isRazorpayConfigured()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update payment gateway credentials (Admin-only)
// @route   POST /api/payment/config
// @access  Private/Admin
router.post('/config', protect, admin, async (req, res) => {
  try {
    const { keyId, keySecret } = req.body;
    if (!keyId || !keySecret) {
      return res.status(400).json({ message: 'Key ID and Key Secret are required.' });
    }

    const success = savePaymentConfig(keyId.trim(), keySecret.trim());
    if (success) {
      res.json({ success: true, message: 'Razorpay configuration saved successfully.' });
    } else {
      res.status(500).json({ message: 'Failed to save configuration file.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a Razorpay order
// @route   POST /api/payment/razorpay/order
// @access  Private
router.post('/razorpay/order', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!isRazorpayConfigured()) {
      // Mock mode
      const mockOrderId = `order_mock_${Math.random().toString(36).substring(2, 11)}`;
      return res.json({
        success: true,
        orderId: mockOrderId,
        amount: order.totalPrice * 100, // paise
        currency: 'INR',
        isMock: true,
        keyId: 'rzp_test_dummyKeyId'
      });
    }

    const { keyId, keySecret } = getPaymentConfig();
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const options = {
      amount: Math.round(order.totalPrice * 100), // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: orderId.toString()
    };

    const rzpOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: keyId,
      isMock: false
    });
  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    res.status(500).json({ message: error.message || 'Error creating Razorpay order' });
  }
});

// @desc    Verify Razorpay payment signature
// @route   POST /api/payment/razorpay/verify
// @access  Private
router.post('/razorpay/verify', protect, async (req, res) => {
  try {
    const {
      orderId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      isMock
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (isMock || !isRazorpayConfigured()) {
      // Mock validation success
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'Processing';
      order.paymentMethod = 'Razorpay (Simulated)';
      order.paymentResult = {
        id: razorpay_payment_id || `pay_mock_${Math.random().toString(36).substring(2, 11)}`,
        status: 'COMPLETED',
        update_time: new Date().toISOString(),
        email_address: req.user.email
      };

      const updatedOrder = await order.save();
      return res.json({ success: true, order: updatedOrder });
    }

    const { keySecret } = getPaymentConfig();
    // Verify cryptographic signature
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature. Verification failed.' });
    }

    // Payment is valid
    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'Processing';
    order.paymentMethod = 'Razorpay';
    order.paymentResult = {
      id: razorpay_payment_id,
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: req.user.email
    };

    const updatedOrder = await order.save();
    res.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Razorpay Signature Verification Error:', error);
    res.status(500).json({ message: error.message || 'Payment verification failed.' });
  }
});

export default router;
