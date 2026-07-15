import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, MapPin, CheckCircle, ShieldAlert, Sparkles, Send } from 'lucide-react';
import api from '../utils/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import io from 'socket.io-client';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const { user, toggleWishlist } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);
  
  // Review submission state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');

  const isWishlisted = user?.wishlist?.some(item => item._id === product?._id);

  // Setup sockets for live stock changes
  useEffect(() => {
    // Auto-detect backend URL: same domain in production, localhost in dev
    const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin;
    const socket = io(SOCKET_URL);

    socket.on('stock_update', ({ productId, newStock }) => {
      if (productId === id) {
        setProduct(prev => prev ? { ...prev, stock: newStock } : null);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        if (data.storeAvailability && data.storeAvailability.length > 0) {
          setSelectedStore(data.storeAvailability[0]);
        }
      } catch (err) {
        console.error('Error fetching product details:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await api.post(`/products/${id}/reviews`, { rating, comment });
      setReviewMsg('Review submitted successfully!');
      setComment('');
      
      // Reload product data to show review
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
    } catch (err) {
      setReviewMsg(err.response?.data?.message || 'Failed to submit review.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <Link to="/shop" className="mt-4 inline-block bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-full">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Product Main Detail Grid */}
      <div className="grid md:grid-cols-2 gap-12 bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm">
        
        {/* Product Image Panel */}
        <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-6 relative">
          <img
            src={product.image}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='%23f8fafc'%3E%3Crect width='100%25' height='100%25'/%3E%3Cpath d='M160 120 L165 200 Q165 205, 170 205 L230 205 Q235 205, 235 200 L240 120 Z' fill='%23e2e8f0' stroke='%23cbd5e1' stroke-width='3.5' stroke-linejoin='round'/%3E%3Cpath d='M185 120 Q185 100, 200 100 Q215 100, 215 120' fill='none' stroke='%23cbd5e1' stroke-width='3.5' stroke-linecap='round'/%3E%3Cpath d='M200 142 Q210 142, 210 152 Q200 152, 200 142 Z' fill='%2310b981'/%3E%3Cpath d='M200 152 Q190 152, 190 142 Q200 142, 200 152 Z' fill='%2310b981'/%3E%3Ctext x='200' y='235' fill='%2364748b' font-family='sans-serif' font-size='12' font-weight='800' letter-spacing='0.5' text-anchor='middle'%3EIMAGE COMING SOON%3C/text%3E%3C/svg%3E";
            }}
            className="w-full max-w-[360px] object-contain mix-blend-multiply"
          />
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-slate-900 text-white font-extrabold text-sm px-5 py-2.5 rounded-full">
                Out Of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info Description */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-xs font-bold text-emerald-600 tracking-widest uppercase">
              {product.category}
            </span>
            
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Ratings & Wishlist */}
            <div className="flex items-center space-x-6 pb-2">
              <div className="flex items-center space-x-1">
                <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                <span className="font-extrabold text-slate-800 text-sm">{product.rating}</span>
                <span className="text-slate-400 text-xs">({product.numReviews} Reviews)</span>
              </div>

              <button
                onClick={() => toggleWishlist(product._id)}
                className={`flex items-center space-x-1.5 text-xs font-semibold cursor-pointer ${
                  isWishlisted ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
                }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
              </button>
            </div>

            {/* Prices & Units */}
            <div className="flex items-baseline space-x-3 py-2 border-y border-slate-50">
              <span className="text-3xl font-black text-slate-900">₹{product.price}</span>
              <span className="text-slate-500 text-sm">/ {product.unit}</span>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-sm leading-relaxed">
              {product.description}
            </p>

            {/* Stock Levels notifications */}
            <div>
              {product.stock > 0 ? (
                product.stock < 10 ? (
                  <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-100 text-amber-800 px-3.5 py-2 rounded-xl text-xs font-semibold animate-pulse">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    <span>Hurry! Only {product.stock} items remaining in primary stock.</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span>In Stock (Ready for Dispatch)</span>
                  </div>
                )
              ) : (
                <div className="inline-flex items-center space-x-1.5 bg-red-50 text-red-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
                  <ShieldAlert className="h-4 w-4 text-red-500" />
                  <span>Out of Stock</span>
                </div>
              )}
            </div>
          </div>

          {/* Add to Cart CTA */}
          <div className="pt-4">
            {product.stock > 0 ? (
              <button
                onClick={() => addToCart(product, 1)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-4 px-8 rounded-full shadow-lg shadow-emerald-100 hover:shadow-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Shopping Cart</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-slate-100 text-slate-400 font-extrabold py-4 px-8 rounded-full cursor-not-allowed"
              >
                Sold Out
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Interactive Store Locator Availability Section */}
      <section className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm space-y-6">
        <div>
          <div className="flex items-center space-x-1 text-emerald-600 font-bold text-xs uppercase tracking-wider">
            <MapPin className="h-4 w-4" />
            <span>Smart Store Locator</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">Nearby HD Mart Store Availability</h2>
          <p className="text-slate-500 text-sm">Check real-time stock levels and distances across physical branches</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Store select cards */}
          <div className="md:col-span-1 space-y-3.5">
            {product.storeAvailability?.map((store, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedStore(store)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedStore?.storeName === store.storeName
                    ? 'border-emerald-500 bg-emerald-50/30'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <h4 className="font-bold text-slate-800 text-sm">{store.storeName}</h4>
                <p className="text-xs text-slate-500 mt-1">Stock available: <span className="font-bold text-slate-700">{store.stock} units</span></p>
                <div className="flex items-center text-xs text-emerald-600 mt-2 font-medium">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{idx === 0 ? '1.8 km away' : idx === 1 ? '4.2 km away' : '6.5 km away'}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Interactive Map Visualisation Panel */}
          <div className="md:col-span-2 bg-slate-950 border border-slate-900 rounded-2xl h-64 relative overflow-hidden flex flex-col justify-between p-4 text-white shadow-inner">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
            
            {/* Map headers */}
            <div className="flex justify-between items-start z-10">
              <span className="bg-slate-900/90 text-xs px-3 py-1.5 rounded-full border border-slate-800 font-semibold flex items-center">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 mr-1.5" />
                Live Tracking Map (Simulated)
              </span>
              <span className="text-[10px] text-slate-500">Center: Mumbai, IN</span>
            </div>

            {/* Simulated Vector Pins on Map grid */}
            <div className="relative w-full h-24 flex items-center justify-center">
              {/* User Center pin */}
              <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 text-center animate-pulse">
                <div className="h-3 w-3 bg-blue-500 rounded-full border-2 border-white mx-auto shadow-md" />
                <span className="text-[9px] font-bold text-blue-400 block mt-1 bg-slate-950/80 px-1.5 py-0.5 rounded-md">Your Location</span>
              </div>

              {/* Selected store pin */}
              {selectedStore && (
                <div className="absolute top-1/3 left-2/3 -translate-x-1/2 -translate-y-1/2 text-center">
                  <div className="h-4 w-4 bg-emerald-500 rounded-full border-2 border-white mx-auto flex items-center justify-center shadow-lg relative">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400 block mt-1 bg-slate-950/80 px-1.5 py-0.5 rounded-md">
                    {selectedStore.storeName}
                  </span>
                </div>
              )}
            </div>

            {/* Map Footer status */}
            <div className="z-10 bg-slate-900/95 border border-slate-850 p-3 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Currently Selected</span>
                <span className="font-bold text-emerald-400">{selectedStore ? selectedStore.storeName : 'None'}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[9px] font-bold uppercase tracking-wider">Availability Status</span>
                <span className={`font-bold ${selectedStore?.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedStore?.stock > 0 ? `${selectedStore.stock} In Stock` : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-sm space-y-8">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Customer Reviews</h2>
          <p className="text-slate-500 text-sm mt-0.5">See what other shoppers have to say about this product</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Reviews list */}
          <div className="md:col-span-2 space-y-4">
            {product.reviews?.length === 0 ? (
              <div className="text-slate-400 text-sm py-4">No reviews yet for this product. Be the first to leave one!</div>
            ) : (
              product.reviews?.map((review, idx) => (
                <div key={idx} className="p-5 border border-slate-50 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">{review.name}</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">{review.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Add a review Form */}
          <div className="md:col-span-1 bg-slate-50 rounded-2xl p-6 space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Write a Customer Review</h4>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1">Rating Stars</label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Very Good</option>
                    <option value={3}>3 - Good</option>
                    <option value={2}>2 - Fair</option>
                    <option value={1}>1 - Poor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 text-xs font-semibold mb-1">Comments</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us what you liked or disliked..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-emerald-600 flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Send className="h-3 w-3" />
                  <span>Submit Review</span>
                </button>

                {reviewMsg && <div className="text-center text-xs text-emerald-600 font-bold pt-1">{reviewMsg}</div>}
              </form>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-slate-500 text-xs">You must be logged in to post reviews.</p>
                <Link to="/login" className="inline-block bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

export default ProductDetails;
