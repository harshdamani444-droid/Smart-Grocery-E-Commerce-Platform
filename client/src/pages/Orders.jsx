import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle2, ChevronRight, MapPin, Calendar, Clock, ShoppingBag, DollarSign, Loader2 } from 'lucide-react';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

const Orders = () => {
  const { id } = useParams(); // Check if viewing specific order tracking details
  const { user } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Simulated coordinate offsets for real-time delivery agent tracker
  const [deliveryAgentPos, setDeliveryAgentPos] = useState({ latOffset: 0.015, lngOffset: 0.015 });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        if (id) {
          // Fetch single order details
          const { data } = await api.get(`/orders/${id}`);
          setOrder(data);
        } else {
          // Fetch user's orders list
          const { data } = await api.get('/orders/myorders');
          setOrders(data);
        }
      } catch (err) {
        setErrorMsg(err.response?.data?.message || 'Error pulling orders information.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Simulate Delivery Agent location updates moving closer to user home (0,0) when Status is "Out For Delivery"
  useEffect(() => {
    if (order && order.status === 'Out For Delivery') {
      const interval = setInterval(() => {
        setDeliveryAgentPos(prev => {
          const nextLat = Math.max(0, prev.latOffset - 0.001);
          const nextLng = Math.max(0, prev.lngOffset - 0.0015);
          return { latOffset: nextLat, lngOffset: nextLng };
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [order]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin rounded-full h-10 w-10 text-emerald-500" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">{errorMsg}</h2>
        <Link to="/" className="inline-block bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-full">
          Back to Home
        </Link>
      </div>
    );
  }

  // --- Tracking details layout for single Order ID ---
  if (id && order) {
    const steps = [
      { label: 'Order Placed', status: 'Pending', desc: 'Awaiting dispatch confirmation', icon: ShoppingBag, color: 'text-slate-500 bg-slate-100 border-slate-200' },
      { label: 'Processing', status: 'Processing', desc: 'Items are being packed at warehouse', icon: Package, color: 'text-blue-500 bg-blue-50 border-blue-200' },
      { label: 'Out For Delivery', status: 'Out For Delivery', desc: 'Simulating driver transit to your slot', icon: Truck, color: 'text-amber-500 bg-amber-50 border-amber-200' },
      { label: 'Delivered', status: 'Delivered', desc: 'Package hand-delivered successfully', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' }
    ];

    const currentStepIdx = steps.findIndex(s => s.status === order.status);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link to="/orders" className="text-xs font-bold text-emerald-600 hover:underline">
              ← Back to My Orders
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Track Order: #{order._id.substring(12)}</h1>
            <p className="text-slate-500 text-xs mt-0.5">Tracking live status updates and scheduled delivery coordinates</p>
          </div>
          <span className={`inline-flex self-start px-3.5 py-1.5 rounded-full text-xs font-bold ${
            order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700 animate-pulse'
          }`}>
            Status: {order.status}
          </span>
        </div>

        {/* Delivery Progress Stepper */}
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm">
          <div className="grid md:grid-cols-4 gap-8 relative">
            
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const isCompleted = idx <= currentStepIdx;
              const isActive = idx === currentStepIdx;

              return (
                <div key={idx} className="flex flex-row md:flex-col items-start gap-4 md:text-center relative z-10">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border-2 flex-shrink-0 transition-all ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-100'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}>
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${isCompleted ? 'text-slate-800 font-extrabold' : 'text-slate-400'}`}>
                      {step.label}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1 max-w-[180px] leading-relaxed md:mx-auto">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Items & Address Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base pb-3 border-b border-slate-50 flex items-center">
                <Package className="h-5 w-5 mr-1.5 text-emerald-500" />
                Items In This Shipment
              </h3>
              
              <div className="space-y-4">
                {order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-3.5">
                      <div className="h-12 w-12 bg-slate-50 rounded-xl p-1.5 flex items-center justify-center">
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
                        <h4 className="font-bold text-slate-800 text-xs leading-none">{item.name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1">Qty: {item.qty} × ₹{item.price}</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-800 text-sm">₹{item.qty * item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipment schedule meta */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm grid sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Delivery Appointment</span>
                <div className="flex items-center text-slate-700 text-xs space-x-1 font-semibold">
                  <Calendar className="h-4 w-4 text-emerald-500 mr-1" />
                  <span>{new Date(order.deliveryDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center text-slate-700 text-xs space-x-1 font-semibold pt-1">
                  <Clock className="h-4 w-4 text-emerald-500 mr-1" />
                  <span>{order.deliverySlot}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Destination Address</span>
                <div className="flex items-start text-slate-700 text-xs space-x-1 font-semibold leading-relaxed">
                  <MapPin className="h-4 w-4 text-emerald-500 mr-1 mt-0.5" />
                  <span>{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Delivery Driver location tracking overlay map */}
          <div className="lg:col-span-1">
            <div className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-900 shadow-xl space-y-6 flex flex-col h-full justify-between">
              
              <div className="space-y-2">
                <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold tracking-wider uppercase">
                  <Truck className="h-4 w-4" />
                  <span>Live Courier Locator</span>
                </div>
                <h3 className="text-base font-extrabold text-white">Delivery Agent Status</h3>
                <p className="text-slate-500 text-xs">
                  {order.status === 'Out For Delivery' 
                    ? 'Courier agent in transit. Simulating movement details...' 
                    : order.status === 'Delivered' 
                    ? 'Shipment reached destination. Agent returned.'
                    : 'Awaiting package packaging before tracking agent.'}
                </p>
              </div>

              {/* Simulated Map Visualizer */}
              <div className="h-52 bg-[#0b1329] border border-slate-800 rounded-3xl relative flex items-center justify-center overflow-hidden shadow-inner">
                {/* SVG stylized map vector elements */}
                <svg className="absolute inset-0 h-full w-full opacity-35" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Styled Green Areas (Parks) */}
                  <rect x="5" y="10" width="20" height="25" rx="3" fill="#1b4d3e" opacity="0.4" />
                  <rect x="50" y="5" width="25" height="20" rx="3" fill="#1b4d3e" opacity="0.4" />
                  <rect x="40" y="65" width="30" height="25" rx="3" fill="#1b4d3e" opacity="0.4" />

                  {/* Water Body (River) */}
                  <path d="M 0 60 Q 25 80, 50 55 T 100 90" fill="none" stroke="#1d4ed8" strokeWidth="6" opacity="0.3" />
                  
                  {/* Grid Road network */}
                  <line x1="0" y1="30" x2="100" y2="30" stroke="#334155" strokeWidth="0.8" />
                  <line x1="0" y1="75" x2="100" y2="75" stroke="#334155" strokeWidth="0.8" />
                  <line x1="30" y1="0" x2="30" y2="100" stroke="#334155" strokeWidth="0.8" />
                  <line x1="75" y1="0" x2="75" y2="100" stroke="#334155" strokeWidth="0.8" />
                  
                  {/* Secondary streets */}
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="1 1" />
                  <line x1="55" y1="0" x2="55" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="1 1" />

                  {/* Main diagonal avenue where the truck moves */}
                  <line x1="75" y1="75" x2="30" y2="30" stroke="#475569" strokeWidth="2.5" />
                  <line x1="75" y1="75" x2="30" y2="30" stroke="#f59e0b" strokeWidth="0.6" strokeDasharray="1.5 1.5" />
                  
                  {/* Dotted green route guide path */}
                  {order.status === 'Out For Delivery' && (
                    <line x1="75" y1="75" x2="30" y2="30" stroke="#10b981" strokeWidth="1.2" strokeDasharray="2 2" />
                  )}
                </svg>

                {/* Tech HUD Grid Pattern overlay */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
                
                {/* Store location point */}
                <div className="absolute" style={{ top: '75%', left: '75%', transform: 'translate(-50%, -50%)' }}>
                  <div className="h-4.5 w-4.5 bg-emerald-500 rounded-full border border-white flex items-center justify-center shadow-md relative">
                    <span className="h-2 w-2 bg-white rounded-full animate-ping absolute" />
                    <span className="h-2 w-2 bg-white rounded-full relative" />
                  </div>
                  <span className="text-[7.5px] font-bold text-slate-400 bg-slate-950/85 px-1 rounded-sm mt-0.5 block whitespace-nowrap -translate-x-1/4">DMart Store</span>
                </div>
                
                {/* Delivery agent pin */}
                {order.status === 'Out For Delivery' && (
                  <div 
                    className="absolute text-center transition-all duration-1000 ease-linear z-10"
                    style={{ 
                      top: `${30 + deliveryAgentPos.latOffset * 3000}%`, 
                      left: `${30 + deliveryAgentPos.lngOffset * 3000}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className="h-7 w-7 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg relative">
                      <Truck className="h-3.5 w-3.5 text-white" />
                      <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-60" />
                    </div>
                    <span className="text-[8px] font-black text-white bg-emerald-600 px-1.5 py-0.5 rounded-md mt-1 block whitespace-nowrap shadow-sm">Ravi (Agent)</span>
                  </div>
                )}

                {/* User Home Location pin (aligned to end location 30%, 30%) */}
                <div className="absolute z-10 text-center" style={{ top: '30%', left: '30%', transform: 'translate(-50%, -50%)' }}>
                  <div className="h-5.5 w-5.5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                    <MapPin className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-[8px] font-bold text-blue-400 bg-slate-950/85 px-1.5 py-0.5 rounded-md mt-1 block whitespace-nowrap">Your Home</span>
                </div>
              </div>

              {/* Agent info details */}
              <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Assigned Driver</span>
                  <span className="font-bold text-slate-200">Ravi Kumar</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Distance Status</span>
                  <span className="font-bold text-emerald-400">
                    {order.status === 'Out For Delivery' 
                      ? `${(deliveryAgentPos.latOffset * 200).toFixed(1)} km away`
                      : order.status === 'Delivered' 
                      ? 'Arrived' 
                      : 'Pending'}
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- Orders list page layout (My Orders list) ---
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Order History</h1>
        <p className="text-slate-500 text-sm mt-1">Review items purchased, check invoice files, and track shipment status</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm max-w-lg mx-auto space-y-4">
          <Package className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-slate-800 font-bold text-lg">No Orders Made</h3>
          <p className="text-slate-500 text-sm">You haven't purchased anything yet. Head to shop to check out groceries.</p>
          <Link to="/shop" className="inline-block bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-full text-xs">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
          {orders.map((item, idx) => (
            <div key={idx} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">ID: #{item._id.substring(12)}</span>
                <h4 className="font-bold text-slate-800 text-sm">
                  {item.orderItems.length} {item.orderItems.length === 1 ? 'item' : 'items'} ordered
                </h4>
                <div className="flex items-center text-xs text-slate-500 gap-4 mt-1.5">
                  <span className="flex items-center"><Calendar className="h-3.5 w-3.5 mr-1" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center"><DollarSign className="h-3.5 w-3.5 mr-0.5" /> ₹{item.totalPrice}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t border-slate-50 sm:border-0">
                <span className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold ${
                  item.status === 'Delivered'
                    ? 'bg-emerald-50 text-emerald-700'
                    : item.status === 'Cancelled'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {item.status}
                </span>

                <Link
                  to={`/orders/${item._id}`}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center space-x-1 shadow-sm transition-transform hover:translate-x-0.5"
                >
                  <span>Track Details</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Orders;
