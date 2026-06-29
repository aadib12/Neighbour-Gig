import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, MapPin, QrCode, LogOut, Menu, X, User, Briefcase } from 'lucide-react';
import api from '../api';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const token = localStorage.getItem('access_token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000); // poll every 15s
      return () => clearInterval(interval);
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications/');
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/api/notifications/${id}/read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/api/notifications/read-all/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <nav className="glass sticky top-0 z-50 w-full px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-2xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
          <Briefcase className="w-7 h-7 text-purple-400" />
          <span>NeighbourGig</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6">
          {token ? (
            <>
              {user?.role === 'CUSTOMER' && (
                <>
                  <Link to="/dashboard" className="text-slate-300 hover:text-white transition">Dashboard</Link>
                  <Link to="/nearby-workers" className="flex items-center space-x-1 text-slate-300 hover:text-white transition">
                    <MapPin className="w-4 h-4 text-purple-400" />
                    <span>Nearby Map</span>
                  </Link>
                  <Link to="/scan-qr" className="flex items-center space-x-1 text-slate-300 hover:text-white transition">
                    <QrCode className="w-4 h-4 text-indigo-400" />
                    <span>Scan QR</span>
                  </Link>
                </>
              )}
              {user?.role === 'WORKER' && (
                <Link to="/worker-dashboard" className="text-slate-300 hover:text-white transition">Worker Dashboard</Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link to="/admin-panel" className="text-slate-300 hover:text-white transition">Admin Panel</Link>
              )}

              {/* Notifications Trigger */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-300 hover:text-white transition hover:bg-slate-800 rounded-full"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 glass rounded-xl shadow-2xl p-4 overflow-hidden z-50 text-slate-200">
                    <div className="flex justify-between items-center border-b border-slate-700/50 pb-2 mb-2">
                      <span className="font-semibold text-sm">Notifications ({unreadCount})</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-purple-400 hover:text-purple-300">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 text-sm text-slate-500">No notifications</div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => !n.is_read && markRead(n.id)}
                            className={`p-2.5 rounded-lg text-xs transition cursor-pointer ${n.is_read ? 'bg-slate-800/20 text-slate-400' : 'bg-purple-950/20 border-l-2 border-purple-500 text-white'}`}
                          >
                            <div className="font-bold mb-0.5">{n.title}</div>
                            <div>{n.message}</div>
                            <div className="text-[10px] text-slate-500 mt-1">{new Date(n.created_at).toLocaleDateString()}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profiling Menu */}
              <div className="flex items-center space-x-3 border-l border-slate-800 pl-6">
                <span className="text-sm font-medium text-slate-300">{user?.first_name || user?.email}</span>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white transition">Login</Link>
              <Link to="/login?mode=signup" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-5 py-2 rounded-lg text-sm font-semibold text-white shadow-lg transition">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          {token && unreadCount > 0 && (
            <div className="relative">
              <Bell className="w-5 h-5 text-slate-300" onClick={() => navigate(user?.role === 'WORKER' ? '/worker-dashboard' : '/dashboard')} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full" />
            </div>
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white focus:outline-none">
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-800 space-y-3 flex flex-col">
          {token ? (
            <>
              {user?.role === 'CUSTOMER' && (
                <>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white py-1">Dashboard</Link>
                  <Link to="/nearby-workers" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white py-1">Nearby Map</Link>
                  <Link to="/scan-qr" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white py-1">Scan QR</Link>
                </>
              )}
              {user?.role === 'WORKER' && (
                <Link to="/worker-dashboard" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white py-1">Worker Dashboard</Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link to="/admin-panel" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white py-1">Admin Panel</Link>
              )}
              <button 
                onClick={() => { setIsOpen(false); handleLogout(); }} 
                className="flex items-center space-x-1.5 text-rose-400 hover:text-rose-300 py-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-slate-300 hover:text-white py-1">Login</Link>
              <Link to="/login?mode=signup" onClick={() => setIsOpen(false)} className="bg-purple-600 text-center py-2 rounded-lg text-sm font-semibold text-white">
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
