import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Create new order & deduct stock
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      deliverySlot,
      deliveryDate,
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Verify stock availability and deduct
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }
      if (product.stock < item.qty) {
        return res.status(400).json({ message: `Insufficient stock for ${item.name}. Available: ${product.stock}` });
      }

      // Deduct main stock
      product.stock -= item.qty;
      
      // Deduct from nearest store (DMart Powai) as mock deduction logic
      if (product.storeAvailability && product.storeAvailability.length > 0) {
        product.storeAvailability[0].stock = Math.max(0, product.storeAvailability[0].stock - item.qty);
      }

      await product.save();

      // Trigger WebSockets broadcast for live stock reduction
      if (req.app.get('io')) {
        req.app.get('io').emit('stock_update', {
          productId: product._id,
          newStock: product.stock
        });
      }
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      deliverySlot,
      deliveryDate: new Date(deliveryDate),
      itemsPrice,
      taxPrice,
      shippingPrice,
      discountPrice,
      totalPrice
    });

    const createdOrder = await order.save();

    // Clear user cart after checkout
    await User.findByIdAndUpdate(req.user._id, { cart: [] });

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
      // Check authorization (must be user who ordered, or admin)
      if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
export const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = 'Processing';
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status;
      if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sales analytics
// @route   GET /api/orders/analytics
// @access  Private/Admin
export const getSalesAnalytics = async (req, res) => {
  try {
    const orders = await Order.find({ isPaid: true });

    // 1. Calculate totals
    const totalSales = orders.reduce((acc, order) => acc + order.totalPrice, 0);
    const orderCount = orders.length;

    // 2. Sales by month / day (grouping for Recharts)
    const monthlySales = {};
    orders.forEach(order => {
      const month = order.createdAt.toLocaleString('default', { month: 'short' });
      monthlySales[month] = (monthlySales[month] || 0) + order.totalPrice;
    });

    const salesData = Object.keys(monthlySales).map(month => ({
      name: month,
      Sales: Math.round(monthlySales[month])
    }));

    // 3. Category sales ratio
    const categorySales = {};
    for (const order of orders) {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        const category = product ? product.category : 'Unknown';
        categorySales[category] = (categorySales[category] || 0) + (item.price * item.qty);
      }
    }

    const categoryData = Object.keys(categorySales).map(category => ({
      name: category,
      value: Math.round(categorySales[category])
    }));

    // 4. Inventory counts
    const products = await Product.find({});
    const lowStockCount = products.filter(p => p.stock < 10).length;

    res.json({
      totalSales: Math.round(totalSales),
      orderCount,
      lowStockCount,
      salesData,
      categoryData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
