import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../api';

const LoginSignup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('CUSTOMER');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'signup') {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRedirect = (userRole) => {
    if (userRole === 'WORKER') {
      navigate('/worker-dashboard');
    } else if (userRole === 'ADMIN') {
      navigate('/admin-panel');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login flow
        const res = await api.post('/api/auth/login/', {
          email: formData.email,
          password: formData.password
        });
        
        const { tokens, ...userData } = res.data;
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        localStorage.setItem('user', JSON.stringify(userData));
        
        handleRedirect(userData.role);
      } else {
        // Register flow
        const res = await api.post('/api/auth/register/', {
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          role: role
        });
        
        const { tokens, ...userData } = res.data;
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Direct worker to fill profile or customer to dashboard
        handleRedirect(userData.role);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.response?.data?.email?.[0] || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="glass rounded-3xl p-8 border border-slate-800 shadow-2xl relative">
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

        {/* Tab Header Selector */}
        <div className="flex justify-center border-b border-slate-800 pb-6 mb-6">
          <button 
            onClick={() => setIsLogin(true)} 
            className={`w-1/2 text-center pb-2.5 font-bold transition text-sm ${isLogin ? 'text-purple-400 border-b-2 border-purple-500' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Sign In
          </button>
          <button 
            onClick={() => setIsLogin(false)} 
            className={`w-1/2 text-center pb-2.5 font-bold transition text-sm ${!isLogin ? 'text-purple-400 border-b-2 border-purple-500' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Sign Up
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-extrabold text-white text-center">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 text-xs text-center mt-1">
            {isLogin ? 'Enter your credentials to enter NeighbourGig' : 'Start booking or listing gig services today'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input 
                      type="text"
                      name="first_name"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Last Name</label>
                  <input 
                    type="text"
                    name="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                  <input 
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Join As</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    className={`py-3 rounded-xl font-bold text-xs border transition flex flex-col items-center space-y-1 ${role === 'CUSTOMER' ? 'bg-purple-600/10 border-purple-500 text-purple-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                  >
                    <User className="w-5 h-5" />
                    <span>Customer</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('WORKER')}
                    className={`py-3 rounded-xl font-bold text-xs border transition flex flex-col items-center space-y-1 ${role === 'WORKER' ? 'bg-purple-600/10 border-purple-500 text-purple-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Worker / Gig helper</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input 
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
              <input 
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Submit button */}
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3.5 rounded-xl font-extrabold text-sm text-white transition shadow-xl shadow-purple-900/10 flex justify-center items-center space-x-2"
          >
            <span>{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginSignup;
