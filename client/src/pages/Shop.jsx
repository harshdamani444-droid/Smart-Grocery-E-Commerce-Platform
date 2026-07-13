import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, QrCode, Sparkles, ShoppingCart, Loader2 } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { CartContext } from '../context/CartContext';

const Shop = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('newest');
  const [keyword, setKeyword] = useState('');

  // Barcode mock state
  const [showScanner, setShowScanner] = useState(false);
  const [scannerLoading, setScannerLoading] = useState(false);
  const [scanResult, setScanResult] = useState('');

  const categoriesList = ['All', 'Fruits & Vegetables', 'Dairy & Eggs', 'Bakery', 'Packaged Food', 'Household Care'];

  // Load initial filter states from URL search params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setCategory(params.get('category') || 'All');
    setKeyword(params.get('keyword') || '');
    setMinPrice(params.get('minPrice') || '');
    setMaxPrice(params.get('maxPrice') || '');
    setSort(params.get('sort') || 'newest');
  }, [location.search]);

  // Fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (category && category !== 'All') queryParams.append('category', category);
        if (keyword) queryParams.append('keyword', keyword);
        if (minPrice) queryParams.append('minPrice', minPrice);
        if (maxPrice) queryParams.append('maxPrice', maxPrice);
        if (sort) queryParams.append('sort', sort);

        const { data } = await api.get(`/products?${queryParams.toString()}`);
        setProducts(data);
      } catch (err) {
        console.error('Error loading products:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, keyword, minPrice, maxPrice, sort]);

  const updateFilters = (key, value) => {
    const params = new URLSearchParams(location.search);
    if (value && value !== 'All') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    navigate(`/shop?${params.toString()}`);
  };

  const handleClearFilters = () => {
    navigate('/shop');
  };

  // Mock Barcode Scanning process
  const triggerMockScan = async (barcode) => {
    setScannerLoading(true);
    setScanResult('');
    // Simulate laser animation
    setTimeout(async () => {
      try {
        const { data } = await api.get(`/products?barcode=${barcode}`);
        if (data && data.length > 0) {
          const product = data[0];
          addToCart(product, 1);
          setScanResult(`Successfully added "${product.name}" to cart!`);
        } else {
          setScanResult('Product not found for scanned barcode.');
        }
      } catch (err) {
        setScanResult('Error locating scanned barcode.');
      } finally {
        setScannerLoading(false);
      }
    }, 1800);
  };

  const mockBarcodeItems = [
    { name: 'Fresh Organic Apples', code: '8901030752538' },
    { name: 'Full Cream Milk', code: '8901262070011' },
    { name: 'Brown Bread', code: '8901725181223' },
    { name: 'Chocolate Chip Cookies', code: '8901063142275' },
    { name: 'Dishwashing Liquid Lemon', code: '8901030704957' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Search Header / Scanner Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">HD Mart Catalog</h1>
          <p className="text-slate-500 text-sm mt-1">Browse and find fresh items with advanced grocery filters</p>
        </div>

        {/* Scan Barcode button */}
        <button
          onClick={() => setShowScanner(!showScanner)}
          className="flex items-center justify-center space-x-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold px-5 py-3 rounded-2xl border border-emerald-100 transition-colors shadow-xs cursor-pointer"
        >
          <QrCode className="h-5 w-5" />
          <span>Barcode Simulator</span>
        </button>
      </div>

      {/* Barcode scanner mockup panel */}
      {showScanner && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 mb-8 border border-slate-800 relative overflow-hidden shadow-2xl animate-fade-in">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_50%)]" />
          
          <div className="max-w-lg mx-auto text-center space-y-4 relative z-10">
            <h3 className="text-lg font-bold flex items-center justify-center space-x-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <span>Smart Barcode Scanner Simulator</span>
            </h3>
            <p className="text-slate-400 text-xs">
              Simulate scanning barcode items like you would at the self-checkout counter in DMart. Select a product barcode below to scan.
            </p>

            {/* Laser scanning window visualization */}
            <div className="w-56 h-36 border-2 border-emerald-500/30 rounded-2xl mx-auto flex items-center justify-center bg-slate-950/80 relative shadow-inner overflow-hidden">
              {scannerLoading && (
                <div className="absolute left-0 w-full h-0.5 bg-emerald-400 shadow-[0_0_10px_#10b981] animate-[bounce_1.5s_infinite]" />
              )}
              {scannerLoading ? (
                <div className="flex flex-col items-center space-y-2 text-emerald-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Reading Code...</span>
                </div>
              ) : scanResult ? (
                <div className="p-3 text-xs text-emerald-400 font-semibold">{scanResult}</div>
              ) : (
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Align barcode</div>
              )}
            </div>

            {/* Select items to scan */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {mockBarcodeItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => triggerMockScan(item.code)}
                  disabled={scannerLoading}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3.5 py-2 rounded-xl transition-all border border-slate-750 disabled:opacity-50 flex items-center space-x-1 cursor-pointer"
                >
                  <ShoppingCart className="h-3 w-3 text-slate-400" />
                  <span>Scan {item.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-extrabold text-slate-950 text-base flex items-center">
                <SlidersHorizontal className="h-4.5 w-4.5 mr-2 text-slate-700" />
                Filters
              </span>
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                Clear All
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3">Category</h3>
              <div className="space-y-1.5">
                {categoriesList.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => updateFilters('category', cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center justify-between cursor-pointer ${
                      category === cat
                        ? 'bg-emerald-500 text-white font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3">Price Range (₹)</h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    updateFilters('minPrice', e.target.value);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    updateFilters('maxPrice', e.target.value);
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Sort Selection */}
            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3">Sort By</h3>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  updateFilters('sort', e.target.value);
                }}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="newest">New Arrivals</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="bg-white rounded-3xl h-72 animate-pulse-slow border border-slate-100" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
              <SlidersHorizontal className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-slate-800 font-bold text-lg">No Products Found</h3>
              <p className="text-slate-500 text-sm mt-1">Try adjusting search parameters or clearing filters.</p>
              <button
                onClick={handleClearFilters}
                className="mt-4 bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-emerald-600 transition-colors cursor-pointer"
              >
                Clear Search & Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>

      </div>

    </div>
  );
};

export default Shop;
