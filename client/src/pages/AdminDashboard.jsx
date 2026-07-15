import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingBag, AlertTriangle, Trash2, Edit3, PlusCircle, Settings, CheckCircle2, ChevronRight, X, Loader2 } from 'lucide-react';
import api from '../utils/api';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  // Analytics states
  const [metrics, setMetrics] = useState({ totalSales: 0, orderCount: 0, lowStockCount: 0 });
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  // Product CRUD states
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form inputs
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Fruits & Vegetables');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('1 unit');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Orders state
  const [orders, setOrders] = useState([]);

  // Payment settings state
  const [settingsKeyId, setSettingsKeyId] = useState('');
  const [settingsKeySecret, setSettingsKeySecret] = useState('');
  const [isRzpConfigured, setIsRzpConfigured] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const loadAnalytics = async () => {
    try {
      const { data } = await api.get('/orders/analytics');
      setMetrics({
        totalSales: data.totalSales,
        orderCount: data.orderCount,
        lowStockCount: data.lowStockCount
      });
      setSalesData(data.salesData);
      setCategoryData(data.categoryData);
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSettings = async () => {
    try {
      const { data } = await api.get('/payment/config');
      setSettingsKeyId(data.keyId);
      setIsRzpConfigured(data.isConfigured);
      if (data.hasSecret) {
        setSettingsKeySecret('••••••••••••••••');
      } else {
        setSettingsKeySecret('');
      }
    } catch (err) {
      console.error('Error loading payment configuration:', err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMsg('');
    setSettingsError('');
    try {
      await api.post('/payment/config', {
        keyId: settingsKeyId,
        keySecret: settingsKeySecret
      });
      setSettingsMsg('Razorpay configuration updated successfully!');
      setIsRzpConfigured(true);
    } catch (err) {
      setSettingsError(err.response?.data?.message || 'Error updating settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    loadProducts();
    loadOrders();
    loadSettings();
  }, []);

  const handleProductDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        loadProducts();
        loadAnalytics();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const productData = { name, price: Number(price), category, stock: Number(stock), unit, barcode, description, image };

    try {
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, productData);
        setEditProduct(null);
      } else {
        await api.post('/products', productData);
        setShowAddModal(false);
      }
      // Reset fields
      setName(''); setPrice(''); setCategory('Fruits & Vegetables'); setStock(''); setUnit('1 unit'); setBarcode(''); setDescription(''); setImage('');
      loadProducts();
      loadAnalytics();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      loadOrders();
      loadAnalytics();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    setUploadError('');

    try {
      const { data } = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setImage(data.url);
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const openEditProduct = (prod) => {
    setEditProduct(prod);
    setName(prod.name);
    setPrice(prod.price);
    setCategory(prod.category);
    setStock(prod.stock);
    setUnit(prod.unit);
    setBarcode(prod.barcode || '');
    setDescription(prod.description);
    setImage(prod.image);
    setShowAddModal(true);
  };

  const openAddProduct = () => {
    setEditProduct(null);
    setName(''); setPrice(''); setCategory('Fruits & Vegetables'); setStock(''); setUnit('1 unit'); setBarcode(''); setDescription(''); setImage('');
    setShowAddModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Manage catalog products, edit inventory levels, change tracking statuses</p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'products' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* --- Analytics tab view --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Analytics stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Sales</span>
                <h3 className="text-2xl font-black text-slate-900">₹{metrics.totalSales}</h3>
              </div>
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Paid Orders</span>
                <h3 className="text-2xl font-black text-slate-900">{metrics.orderCount}</h3>
              </div>
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Low Stock Alert</span>
                <h3 className="text-2xl font-black text-slate-900">{metrics.lowStockCount}</h3>
              </div>
              <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>

          </div>

          {/* Recharts Diagrams panels */}
          <div className="grid lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-6">Revenue Over Time</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="Sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Category Volume Share</h3>
              <div className="h-56 relative flex items-center justify-center">
                {categoryData.length === 0 ? (
                  <span className="text-slate-400 text-xs">No sales data available.</span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 pt-4 border-t border-slate-50">
                {categoryData.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- Products tab view (CRUD catalog list) --- */}
      {activeTab === 'products' && (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden space-y-6 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-50">
            <h3 className="font-extrabold text-slate-900 text-base">Catalog Inventory Items</h3>
            
            <button
              onClick={openAddProduct}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-1 shadow-sm cursor-pointer"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              <span>Add Product</span>
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">No products found. Add one above.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Item Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {products.map(prod => (
                    <tr key={prod._id} className="hover:bg-slate-50/50">
                      
                      <td className="p-4 flex items-center space-x-3">
                        <img src={prod.image} alt={prod.name} className="h-10 w-10 object-contain p-1 border rounded-lg bg-white" />
                        <div>
                          <span className="font-bold text-slate-800 text-sm block">{prod.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Barcode: {prod.barcode || 'N/A'}</span>
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-slate-600">{prod.category}</td>
                      <td className="p-4 font-extrabold text-slate-800 text-sm">₹{prod.price}</td>
                      <td className="p-4">
                        <span className={`font-bold text-sm ${prod.stock < 10 ? 'text-amber-600' : 'text-slate-800'}`}>
                          {prod.stock} units
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => openEditProduct(prod)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleProductDelete(prod._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- Orders tab view (Tracking Status editor) --- */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden p-6">
          <h3 className="font-extrabold text-slate-900 text-base pb-4 border-b border-slate-50 mb-6">Customer Shipments Tracker</h3>

          {orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">No orders placed by customers yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total Amount</th>
                    <th className="p-4">Slot Appointment</th>
                    <th className="p-4">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map(orderItem => (
                    <tr key={orderItem._id} className="hover:bg-slate-50/50">
                      
                      <td className="p-4 font-bold text-slate-800 text-sm">
                        <Link to={`/orders/${orderItem._id}`} className="hover:underline flex items-center">
                          <span>#{orderItem._id.substring(12)}</span>
                          <ChevronRight className="h-3 w-3 text-slate-400 ml-1" />
                        </Link>
                      </td>

                      <td className="p-4 font-semibold text-slate-700">{orderItem.user?.name || 'Customer'}</td>
                      <td className="p-4 font-extrabold text-slate-800 text-sm">₹{orderItem.totalPrice}</td>
                      
                      <td className="p-4 text-slate-500 font-medium leading-tight">
                        <div className="font-bold">{new Date(orderItem.deliveryDate).toLocaleDateString()}</div>
                        <div className="text-[10px] mt-0.5">{orderItem.deliverySlot}</div>
                      </td>

                      {/* Status select editor */}
                      <td className="p-4">
                        <select
                          value={orderItem.status}
                          onChange={(e) => handleOrderStatusUpdate(orderItem._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                            orderItem.status === 'Delivered'
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                              : orderItem.status === 'Cancelled'
                              ? 'bg-red-50 border-red-100 text-red-700'
                              : 'bg-blue-50 border-blue-100 text-blue-700'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Out For Delivery">Out For Delivery</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 space-y-6 max-w-2xl animate-scale-in">
          <div className="border-b border-slate-50 pb-4">
            <h3 className="font-extrabold text-slate-900 text-base">Payment Gateway Settings</h3>
            <p className="text-xs text-slate-500 mt-1">Configure your official Razorpay keys to enable native checkout payments.</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            {/* Status indicator badge */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-bold">Integration Status:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isRzpConfigured 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
              }`}>
                {isRzpConfigured ? 'Active (Live/Test Mode)' : 'Simulation Sandbox Mode (Keys Missing)'}
              </span>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Razorpay Key ID</label>
              <input
                type="text"
                placeholder="rzp_test_..."
                value={settingsKeyId}
                onChange={(e) => setSettingsKeyId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Razorpay Key Secret</label>
              <input
                type="password"
                placeholder="Enter Key Secret"
                value={settingsKeySecret}
                onChange={(e) => setSettingsKeySecret(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                required
              />
            </div>

            {settingsMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-medium">
                {settingsMsg}
              </div>
            )}
            {settingsError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-800 text-xs rounded-xl font-medium">
                {settingsError}
              </div>
            )}

            <button
              type="submit"
              disabled={savingSettings}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-xs font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              {savingSettings ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving Configuration...</span>
                </>
              ) : (
                <span>Save Gateway Configuration</span>
              )}
            </button>
          </form>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Where to get credentials?</span>
            <p className="text-[11px] text-slate-600 leading-normal">
              Sign up or log in to your dashboard at <a href="https://dashboard.razorpay.com" target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline">Razorpay Dashboard</a>. Switch the environment to <strong>Test Mode</strong>, navigate to <strong>Account & Settings</strong> &rarr; <strong>API Keys</strong>, and click <strong>Generate Key</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border border-slate-100 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-scale-in">
            
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 mb-6">
              {editProduct ? 'Edit Catalog Item' : 'Add New Catalog Item'}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Product Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Packaged Food">Packaged Food</option>
                    <option value="Household Care">Household Care</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Initial Stock Count</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Unit Label (1kg, 500ml)</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Barcode ID</label>
                  <input
                    type="text"
                    placeholder="890..."
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Product Photograph (Upload or Link)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Paste image link https://..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none text-xs"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      id="product-photo-upload"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="product-photo-upload"
                      className="w-full flex items-center justify-center bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-bold py-2.5 px-4 rounded-xl cursor-pointer transition-colors text-xs text-center"
                    >
                      {uploadingImage ? 'Uploading photo...' : '📁 Upload Local Photo'}
                    </label>
                  </div>
                </div>
                {uploadError && <p className="text-red-500 text-[10px] mt-1 font-semibold">{uploadError}</p>}
                {image && (
                  <div className="mt-3 flex items-center space-x-3 bg-slate-50 border border-slate-100 p-2 rounded-xl">
                    <img src={image} alt="Preview" className="h-10 w-10 object-contain rounded-lg bg-white border border-slate-200" />
                    <span className="text-[10px] text-slate-500 truncate max-w-[280px]">{image}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
