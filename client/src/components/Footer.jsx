import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400">
      
      {/* Trust Badges */}
      <div className="border-b border-slate-800 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-emerald-950 text-emerald-400 rounded-2xl">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Free Delivery</h4>
                <p className="text-xs text-slate-500">Orders above ₹500</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-emerald-950 text-emerald-400 rounded-2xl">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">100% Freshness</h4>
                <p className="text-xs text-slate-500">Directly from farms</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-emerald-950 text-emerald-400 rounded-2xl">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Easy Returns</h4>
                <p className="text-xs text-slate-500">No questions asked policy</p>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-emerald-950 text-emerald-400 rounded-2xl">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Convenient Slots</h4>
                <p className="text-xs text-slate-500">Select delivery times</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">HD Mart</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Premium quality grocery shopping at HD Mart. Get fresh foods, milk, household cleaning items delivered to your slot.
            </p>
            <div className="text-xs text-slate-600">
              © {new Date().getFullYear()} HD Mart Ltd. All rights reserved.
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/shop?category=Fruits & Vegetables" className="hover:text-emerald-400 transition-colors">Fruits & Vegetables</a></li>
              <li><a href="/shop?category=Dairy & Eggs" className="hover:text-emerald-400 transition-colors">Dairy & Eggs</a></li>
              <li><a href="/shop?category=Bakery" className="hover:text-emerald-400 transition-colors">Bakery & Breads</a></li>
              <li><a href="/shop?category=Packaged Food" className="hover:text-emerald-400 transition-colors">Packaged Snacks</a></li>
              <li><a href="/shop?category=Household Care" className="hover:text-emerald-400 transition-colors">Household Cleaners</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Help & Support</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="cursor-pointer hover:text-emerald-400">Track Order</span></li>
              <li><span className="cursor-pointer hover:text-emerald-400">Return Policy</span></li>
              <li><span className="cursor-pointer hover:text-emerald-400">Store Locations</span></li>
              <li><span className="cursor-pointer hover:text-emerald-400">Terms of Service</span></li>
              <li><span className="cursor-pointer hover:text-emerald-400">Contact Us</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact Info</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li>Customer Support Helpline:</li>
              <li className="text-white font-medium text-base">1800-419-1234</li>
              <li>support@smartgrocery.com</li>
              <li>Surat, Gujarat, India</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
