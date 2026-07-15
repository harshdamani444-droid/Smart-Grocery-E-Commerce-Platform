import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { KeyRound, Mail, User, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirect);
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    const res = await register(name, email, password, 'customer');
    if (!res.success) {
      setErrorMsg(res.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[500px] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
        
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-slate-500 text-xs">Join HD Mart and start slotting deliveries</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-3.5 rounded-2xl text-xs flex items-center space-x-2">
            <AlertCircle className="h-4.5 w-4.5 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-600 text-xs font-semibold mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="enter name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-705 rounded-2xl px-4 py-3 pl-11 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                required
              />
              <User className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 text-xs font-semibold mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-705 rounded-2xl px-4 py-3 pl-11 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                required
              />
              <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 text-xs font-semibold mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-705 rounded-2xl px-4 py-3 pl-11 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                required
              />
              <KeyRound className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 text-xs font-semibold mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-705 rounded-2xl px-4 py-3 pl-11 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                required
              />
              <KeyRound className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold py-3.5 rounded-2xl shadow-md flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <span>Create Account</span>
          </button>
        </form>

        {/* Link to Login */}
        <div className="text-center text-xs text-slate-500 pt-2">
          Already have an account?{' '}
          <Link to={`/login?redirect=${redirect}`} className="text-emerald-600 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
