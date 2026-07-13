import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import io from 'socket.io-client';

const Home = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Setup sockets inside client home page to listen for live stock updates
  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('stock_update', ({ productId, newStock }) => {
      setRecommendations(prev =>
        prev.map(p => p._id === productId ? { ...p, stock: newStock } : p)
      );
      setFeaturedProducts(prev =>
        prev.map(p => p._id === productId ? { ...p, stock: newStock } : p)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recRes = await api.get('/products/recommendations');
        setRecommendations(recRes.data);

        const prodRes = await api.get('/products');
        setFeaturedProducts(prodRes.data.slice(0, 4));
      } catch (err) {
        console.error('Error fetching home page data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const categories = [
    { name: 'Fruits & Vegetables', count: '10+ Items', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200', color: 'bg-emerald-50 text-emerald-800' },
    { name: 'Dairy & Eggs', count: '8+ Items', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=200', color: 'bg-blue-50 text-blue-800' },
    { name: 'Bakery', count: '5+ Items', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200', color: 'bg-amber-50 text-amber-800' },
    { name: 'Packaged Food', count: '12+ Items', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=200', color: 'bg-purple-50 text-purple-800' },
    { name: 'Household Care', count: '15+ Items', image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=200', color: 'bg-rose-50 text-rose-800' }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-950 text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_45%)]" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-semibold tracking-wide">
              <Sparkles className="h-4 w-4" />
              <span>DMart Inspired E-Commerce Platform</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Fresh Groceries, <br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Smart Pricing
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-lg">
              Experience local grocery shopping reinvented. Buy fresh items, choose preferred delivery slots, find nearby availability, and track orders seamlessly.
            </p>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                to="/shop"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-full shadow-lg shadow-emerald-900/30 flex items-center justify-center space-x-2 transition-all hover:translate-y-[-2px] cursor-pointer"
              >
                <span>Shop Catalog</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              
              <Link
                to="/shop?category=Fruits & Vegetables"
                className="bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold px-8 py-4 rounded-full flex items-center justify-center transition-all hover:translate-y-[-2px]"
              >
                Buy Fresh Veggies
              </Link>
            </div>
          </div>

          {/* Hero Banner Image Graphic Mockup */}
          <div className="hidden md:flex justify-center relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600"
              alt="Grocery Basket Hero"
              className="w-full max-w-[450px] rounded-3xl shadow-2xl border border-white/5 rotate-[-2deg] hover:rotate-0 transition-transform duration-500"
            />
          </div>

        </div>
      </section>

      {/* Category List Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center md:text-left mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Browse by Category</h2>
          <p className="text-sm text-slate-500 mt-1">Explore our range of categories for your kitchen and home</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/shop?category=${cat.name}`}
              className="bg-white rounded-3xl p-5 border border-slate-100 hover:border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group"
            >
              <div className="h-20 w-20 rounded-full bg-slate-50 overflow-hidden flex items-center justify-center p-3 group-hover:scale-105 transition-transform">
                <img src={cat.image} alt={cat.name} className="object-cover" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm mt-4 group-hover:text-emerald-600 transition-colors">
                {cat.name}
              </h3>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-2 ${cat.color}`}>
                {cat.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Recommendations Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <div className="flex items-center space-x-1.5 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-emerald-500 animate-spin" />
              <span>Smart Recommendation Engine</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">Recommended For You</h2>
            <p className="text-sm text-slate-500">Curated algorithms based on popularity and browsing preferences</p>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 mt-3 sm:mt-0">
            <span>View Catalog</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-3xl h-72 animate-pulse-slow border border-slate-100" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No recommended items yet. Check back soon.</div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.slice(0, 4).map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Special Deals Graphic Promo */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl text-white p-8 md:p-12 shadow-xl shadow-emerald-100 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.1),transparent_35%)]" />
          <div className="space-y-4 relative z-10 text-center md:text-left">
            <span className="bg-white/20 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              Save big on daily purchases
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Get 10% Flat discount using DMART10 coupon
            </h2>
            <p className="text-emerald-50 max-w-xl text-sm leading-relaxed">
              Use code DMART10 during cart checkout on grocery purchases of ₹500 or more. Valid on Fresh foods, Dairy products, and Household care!
            </p>
          </div>
          <Link
            to="/shop"
            className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-8 py-4 rounded-full shadow-lg relative z-10 flex-shrink-0 cursor-pointer"
          >
            Apply Code Now
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;
