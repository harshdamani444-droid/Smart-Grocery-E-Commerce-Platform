import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { KeyRound, Mail, Sparkles, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const { login, googleLoginStub, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (!email || !password) return;
    setErrorMsg('');
    setLoading(true);

    const res = await login(email, password);
    if (!res.success) {
      setErrorMsg(res.message);
      setLoading(false);
    }
  };

  const handleGoogleLoginMock = async () => {
    setErrorMsg('');
    setLoading(true);

    // Mock Google credentials
    const googleEmail = 'googleuser@gmail.com';
    const googleName = 'Google Customer';
    const googleId = `g_${Math.random().toString(36).substring(2, 11)}`;

    const res = await googleLoginStub(googleEmail, googleName, googleId);
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
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 text-xs">Sign in to your HD Mart checkout portal</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-3.5 rounded-2xl text-xs flex items-center space-x-2">
            <AlertCircle className="h-4.5 w-4.5 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-600 text-xs font-semibold mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="user@gmail.com (Default)"
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
                placeholder="userpassword (Default)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <span>Sign In</span>
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-slate-100" />
          <span className="text-[10px] text-slate-400 font-bold uppercase px-3">or</span>
          <div className="flex-1 border-t border-slate-100" />
        </div>

        {/* Google Mock Login */}
        <button
          onClick={handleGoogleLoginMock}
          disabled={loading}
          className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3.5 rounded-2xl border border-slate-200 flex items-center justify-center space-x-2 transition-colors cursor-pointer disabled:opacity-50 text-xs"
        >
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Continue with Google (Mock)</span>
        </button>

        {/* Link to Register */}
        <div className="text-center text-xs text-slate-500 pt-2">
          New to HD Mart?{' '}
          <Link to={`/register?redirect=${redirect}`} className="text-emerald-600 font-bold hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
