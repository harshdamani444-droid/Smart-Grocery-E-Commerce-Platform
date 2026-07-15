import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, Search, Mic, LogOut, User, Menu, X, MicOff, Settings } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartItems } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [keyword, setKeyword] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/shop?keyword=${keyword}`);
    } else {
      navigate('/shop');
    }
  };

  const startVoiceSearch = () => {
    if (!speechSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setKeyword(transcript);
      navigate(`/shop?keyword=${transcript}`);
    };

    recognition.start();
  };

  // Keep search keyword in sync with URL search params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const kw = params.get('keyword');
    if (kw) {
      setKeyword(kw);
    } else if (location.pathname !== '/shop') {
      setKeyword('');
    }
  }, [location]);

  return (
    <>
      {/* DMart Top Alert Bar */}
      <div className="bg-[#02529c] text-white text-[10px] sm:text-xs py-2 px-4 text-center font-extrabold tracking-wide flex items-center justify-center space-x-2 sm:space-x-4 border-b border-white/10 relative z-50">
        <span className="flex items-center">⚡ FREE Home Delivery on orders above ₹1,000!</span>
        <span className="hidden md:inline text-white/40">|</span>
        <span className="hidden sm:inline">📞 Support: 1800-200-1234</span>
        <span className="hidden md:inline text-white/40">|</span>
        <span className="text-yellow-300">🎟️ Use Code HDMART10 for 10% Flat Discount!</span>
      </div>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 flex-shrink-0">
            <img src="/logo.png" alt="HD Mart Logo" className="h-9 sm:h-11 object-contain" />
            <span className="hidden sm:block text-xl font-black text-[#02529c]">
              HD <span className="text-[#8dc63f]">Mart</span>
            </span>
          </Link>

          {/* Search bar & Voice Search */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg mx-8 relative items-center">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search fresh vegetables, dairy, household items..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-705 rounded-full px-5 py-2.5 pl-11 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#02529c] focus:border-[#02529c] focus:bg-white transition-all shadow-inner"
              />
              <Search className="absolute left-4 top-3 h-4.5 w-4.5 text-slate-400" />
            </div>

            {speechSupported && (
              <button
                type="button"
                onClick={startVoiceSearch}
                className={`absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors ${
                  isListening ? 'text-emerald-600 bg-emerald-50 animate-pulse' : ''
                }`}
                title="Search by voice"
              >
                {isListening ? <Mic className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}
          </form>

          {/* Nav Icons */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link to="/shop" className="text-sm font-medium text-slate-600 hover:text-[#02529c] transition-colors">
              Browse All
            </Link>

            <Link
              to="/shop?category=Fruits & Vegetables"
              className="text-sm font-medium text-slate-600 hover:text-[#02529c] transition-colors"
            >
              Fresh Foods
            </Link>

            {/* Wishlist */}
            <Link to="/orders" className="relative p-2 text-slate-600 hover:text-[#02529c] transition-colors" title="My Orders">
              <Heart className="h-5.5 w-5.5" />
              {user?.wishlist?.length > 0 && (
                <span className="absolute top-0 right-0 h-4.5 w-4.5 rounded-full bg-[#8dc63f] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {user.wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-600 hover:text-[#02529c] transition-colors flex items-center space-x-1"
              title="Shopping Cart"
            >
              <ShoppingCart className="h-5.5 w-5.5" />
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-4 h-4.5 w-4.5 rounded-full bg-[#8dc63f] text-white text-[10px] font-bold flex items-center justify-center shadow-sm">
                  {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                </span>
              )}
              {cartItems.length > 0 && (
                <span className="hidden xl:inline text-xs font-semibold text-[#02529c] bg-blue-50 px-2 py-0.5 rounded-full">
                  ₹{cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)}
                </span>
              )}
            </Link>

            {/* User Profile / Admin Menu */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-1.5 focus:outline-none cursor-pointer">
                  <div className="h-8 w-8 rounded-full bg-blue-100 text-[#02529c] flex items-center justify-center font-semibold text-sm border border-blue-200 shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform scale-95 group-hover:scale-100 z-50">
                  {user && user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-[#02529c] transition-colors"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Seller Dashboard
                    </Link>
                  )}
                  <Link
                    to="/orders"
                    className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-[#02529c] transition-colors"
                  >
                    <User className="h-4 w-4 mr-2" />
                    My Orders
                  </Link>
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={logout}
                    className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#02529c] hover:bg-[#0b3c75] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md shadow-blue-100 transition-all duration-300 hover:translate-y-[-1px]"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile navigation button */}
          <div className="flex items-center lg:hidden space-x-4">
            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-[#02529c]">
              <ShoppingCart className="h-5.5 w-5.5" />
              {cartItems.length > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-[#8dc63f] text-white text-[9px] font-bold flex items-center justify-center">
                  {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-[#02529c] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile search bar and voice search */}
      <div className="md:hidden px-4 pb-4 border-b border-slate-100">
        <form onSubmit={handleSearchSubmit} className="flex relative items-center">
          <input
            type="text"
            placeholder="Search groceries..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-full px-4 py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#02529c]"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          {speechSupported && (
            <button
              type="button"
              onClick={startVoiceSearch}
              className={`absolute right-3.5 p-1 rounded-full text-slate-400 ${
                isListening ? 'text-emerald-600 animate-pulse' : ''
              }`}
            >
              <Mic className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>

      {/* Mobile menu panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-100 bg-white px-4 py-3 space-y-2 shadow-inner">
          <Link
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-[#02529c] transition-colors"
          >
            Browse All Products
          </Link>
          <Link
            to="/shop?category=Fruits & Vegetables"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-[#02529c] transition-colors"
          >
            Fruits & Vegetables
          </Link>
          <Link
            to="/shop?category=Dairy & Eggs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-[#02529c] transition-colors"
          >
            Dairy & Eggs
          </Link>
          <hr className="my-1 border-slate-100" />
          {user ? (
            <>
              {user && user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-blue-50 hover:text-[#02529c]"
                >
                  Seller Dashboard
                </Link>
              )}
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-blue-50 hover:text-[#02529c]"
              >
                My Orders
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center bg-[#02529c] text-white font-semibold py-2.5 rounded-lg shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  </>
  );
};

export default Navbar;
