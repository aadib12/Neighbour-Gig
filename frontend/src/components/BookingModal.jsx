import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, DollarSign } from 'lucide-react';
import api from '../api';

const BookingModal = ({ worker, onClose, onBookingSuccess }) => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [hours, setHours] = useState(1);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      // Fetch services matching this worker's categories or generic services list
      const res = await api.get('/api/workers/services/');
      setServices(res.data);
      if (res.data.length > 0) {
        setSelectedService(res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const bookingPayload = {
      worker: worker.id,
      service: selectedService,
      booking_date: date,
      start_time: time,
      hours: parseInt(hours),
      address: address,
      latitude: worker.latitude || 0,
      longitude: worker.longitude || 0
    };

    try {
      await api.post('/api/bookings/', bookingPayload);
      onBookingSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.response?.data?.booking_date?.[0] || 'Failed to create booking. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const estimatedTotal = (worker.hourly_rate * hours).toFixed(2);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="glass w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 p-5">
          <div>
            <h3 className="text-xl font-bold text-white">Book service</h3>
            <p className="text-xs text-slate-400">with {worker.user.first_name} {worker.user.last_name}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* Select Service */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Select Service</label>
            <select 
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
            >
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.category_name})</option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>Date</span>
              </label>
              <input 
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Start Time</span>
              </label>
              <input 
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Hours Duration */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Hours Requested</label>
            <input 
              type="number"
              min="1"
              max="24"
              required
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Service Location Address</span>
            </label>
            <textarea 
              required
              rows="2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Provide complete booking address..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Price Summary */}
          <div className="flex justify-between items-center bg-slate-800/40 p-4 rounded-xl border border-slate-800">
            <div className="text-sm">
              <span className="text-slate-400 block text-xs uppercase font-semibold">Total Price Estimate</span>
              <span className="text-white text-xs font-medium">${worker.hourly_rate}/hr &times; {hours} hrs</span>
            </div>
            <div className="flex items-center text-xl font-bold text-green-400">
              <DollarSign className="w-5 h-5" />
              <span>{estimatedTotal}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="w-1/3 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="w-2/3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3 rounded-xl text-sm font-semibold text-white transition shadow-lg flex justify-center items-center"
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
