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
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    {
      title: "Super Savings Week!",
      subtitle: "Get up to 40% off on all daily grocery items. Fresh foods, packaged brands, household essentials & more.",
      badge: "⭐ HD Mart Best Prices Guaranteed",
      code: "HDMART10",
      buttonText: "Shop Groceries",
      link: "/shop",
      gradient: "from-[#02529c] via-[#09427b] to-slate-900",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Fresh Fruits & Vegetables",
      subtitle: "Sourced directly from local orchards and farms daily. Guaranteed fresh and organic. Cleaned and safely packed.",
      badge: "🍏 100% Fresh Farm Harvest",
      code: "SUPER50",
      buttonText: "Buy Fresh Produce",
      link: "/shop?category=Fruits & Vegetables",
      gradient: "from-[#5a9c1e] via-[#467916] to-slate-900",
      image: "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&q=80&w=600"
    },
    {
      title: "Dairy & Bakery Specials",
      subtitle: "Delicious organic breads, cookies, milk, and eggs for your morning breakfasts. Save flat ₹50 on ₹300+ orders.",
      badge: "🥛 Fresh Dairy & Breakfast",
      code: "SUPER50",
      buttonText: "Order Breakfast",
      link: "/shop?category=Dairy & Eggs",
      gradient: "from-[#d97706] via-[#b45309] to-slate-900",
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=600"
    }
  ];

  // Carousel slide timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // Setup sockets inside client home page to listen for live stock updates
  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin;
    const socket = io(SOCKET_URL);

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
    { name: 'Fruits & Vegetables', count: '10+ Items', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200', color: 'bg-green-50 text-[#5a9c1e] border-green-100' },
    { name: 'Dairy & Eggs', count: '8+ Items', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=200', color: 'bg-blue-50 text-[#02529c] border-blue-100' },
    { name: 'Bakery', count: '5+ Items', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=200', color: 'bg-amber-50 text-amber-800 border-amber-100' },
    { name: 'Packaged Food', count: '12+ Items', image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=200', color: 'bg-purple-50 text-purple-800 border-purple-100' },
    { name: 'Household Care', count: '15+ Items', image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=200', color: 'bg-rose-50 text-rose-800 border-rose-100' }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* Sliding Hero Carousel */}
      <section className="relative overflow-hidden min-h-[380px] sm:min-h-[460px] bg-slate-950 text-white transition-all duration-700">
        {banners.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} py-12 sm:py-20 px-4 sm:px-6 lg:px-8 flex items-center transition-all duration-700 transform ${
              idx === currentSlide
                ? 'opacity-100 translate-x-0 pointer-events-auto scale-100'
                : 'opacity-0 translate-x-12 pointer-events-none scale-95'
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_55%)]" />
            <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center relative z-10">
              
              <div className="space-y-6 text-left">
                <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full text-yellow-300 text-xs font-bold tracking-wide">
                  <span>{slide.badge}</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1]">
                  {slide.title}
                </h2>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg">
                  {slide.subtitle}
                </p>

                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-start sm:items-center">
                  <Link
                    to={slide.link}
                    className="bg-[#ffcb05] hover:bg-[#e0b200] text-slate-900 font-extrabold px-8 py-3.5 rounded-full shadow-lg flex items-center justify-center space-x-2 transition-all hover:translate-y-[-2px] cursor-pointer text-sm"
                  >
                    <span>{slide.buttonText}</span>
                    <ArrowRight className="h-4.5 w-4.5 text-slate-900" />
                  </Link>
                  {slide.code && (
                    <span className="text-xs font-bold border border-white/30 px-4 py-2 rounded-2xl bg-white/5">
                      Coupon Code: <span className="text-yellow-300">{slide.code}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Slider image */}
              <div className="hidden md:flex justify-center relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full max-w-[420px] h-[260px] object-cover rounded-3xl shadow-2xl border border-white/10"
                />
              </div>

            </div>
          </div>
        ))}

        {/* Carousel indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2.5">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentSlide ? 'w-8 bg-[#ffcb05]' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
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
        <div className="bg-gradient-to-r from-[#02529c] to-blue-800 rounded-3xl text-white p-8 md:p-12 shadow-xl shadow-blue-100 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_35%)]" />
          <div className="space-y-4 relative z-10 text-center md:text-left">
            <span className="bg-white/10 border border-white/20 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-yellow-300">
              Save big on daily purchases
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Get 10% Flat discount using HDMART10 coupon
            </h2>
            <p className="text-blue-100 max-w-xl text-sm leading-relaxed">
              Use code HDMART10 during cart checkout on grocery purchases of ₹500 or more. Valid on Fresh foods, Dairy products, and Household care!
            </p>
          </div>
          <Link
            to="/shop"
            className="bg-[#ffcb05] hover:bg-[#e0b200] text-slate-900 font-extrabold px-8 py-4 rounded-full shadow-lg relative z-10 flex-shrink-0 cursor-pointer text-sm transition-all hover:translate-y-[-1px]"
          >
            Apply Code Now
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;
