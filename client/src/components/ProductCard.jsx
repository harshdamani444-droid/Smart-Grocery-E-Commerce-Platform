import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ShieldAlert } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { user, toggleWishlist } = useContext(AuthContext);

  const isWishlisted = user?.wishlist?.some(item => item._id === product._id);

  const handleWishlistClick = (e) => {
    e.preventDefault();
    toggleWishlist(product._id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 hover:border-emerald-100 overflow-hidden shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 flex flex-col relative group">
      
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        className={`absolute top-4 right-4 p-2 rounded-full border border-slate-100 shadow-sm z-10 transition-all ${
          isWishlisted
            ? 'bg-red-50 text-red-500 border-red-100'
            : 'bg-white text-slate-400 hover:text-red-500 hover:bg-red-50'
        }`}
        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`h-4.5 w-4.5 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="block overflow-hidden relative pt-[75%] bg-slate-50">
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300' fill='%23f8fafc'%3E%3Crect width='100%25' height='100%25'/%3E%3Cpath d='M160 120 L165 200 Q165 205, 170 205 L230 205 Q235 205, 235 200 L240 120 Z' fill='%23e2e8f0' stroke='%23cbd5e1' stroke-width='3.5' stroke-linejoin='round'/%3E%3Cpath d='M185 120 Q185 100, 200 100 Q215 100, 215 120' fill='none' stroke='%23cbd5e1' stroke-width='3.5' stroke-linecap='round'/%3E%3Cpath d='M200 142 Q210 142, 210 152 Q200 152, 200 142 Z' fill='%2310b981'/%3E%3Cpath d='M200 152 Q190 152, 190 142 Q200 142, 200 152 Z' fill='%2310b981'/%3E%3Ctext x='200' y='235' fill='%2364748b' font-family='sans-serif' font-size='12' font-weight='800' letter-spacing='0.5' text-anchor='middle'%3EIMAGE COMING SOON%3C/text%3E%3C/svg%3E";
          }}
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-full">
              Out Of Stock
            </span>
          </div>
        )}
        {product.stock > 0 && product.stock < 10 && (
          <span className="absolute bottom-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center shadow-sm animate-pulse">
            <ShieldAlert className="h-3 w-3 mr-1" />
            Only {product.stock} Left
          </span>
        )}
      </Link>

      {/* Product Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[11px] font-bold text-emerald-600 tracking-wider uppercase">
            {product.category}
          </span>

          {/* Name */}
          <Link to={`/product/${product._id}`} className="block mt-1">
            <h3 className="text-slate-800 font-semibold text-base line-clamp-2 hover:text-emerald-600 transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Unit & Ratings */}
          <div className="flex items-center justify-between mt-1 text-slate-500 text-xs">
            <span>{product.unit}</span>
            <div className="flex items-center space-x-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-700">{Number(product.rating).toFixed(1)}</span>
              <span className="text-slate-400">({product.numReviews})</span>
            </div>
          </div>
        </div>

        {/* Action / Footer */}
        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-50">
          <div>
            <span className="text-slate-400 text-[10px] block font-medium">DMart Price</span>
            <span className="text-slate-900 font-extrabold text-lg">₹{product.price}</span>
          </div>

          {product.stock > 0 ? (
            <button
              onClick={handleAddToCart}
              className="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-2xl flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100 hover:translate-y-[-1px] cursor-pointer"
              title="Add to cart"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
            </button>
          ) : (
            <button
              disabled
              className="bg-slate-100 text-slate-400 p-2.5 rounded-2xl cursor-not-allowed"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
