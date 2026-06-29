import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, DollarSign, Star, MessageSquare, Plus, CheckCircle, Navigation, QrCode } from 'lucide-react';
import api from '../api';

const CustomerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review form state
  const [activeReviewBookingId, setActiveReviewBookingId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/bookings/user');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await api.patch(`/api/bookings/${id}/status/`, { status: 'CANCELLED' });
      fetchBookings();
    } catch (err) {
      alert("Failed to cancel booking: " + (err.response?.data?.status || "Unknown error"));
    }
  };

  const handleReviewSubmit = async (e, bookingId) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post('/api/reviews/', {
        booking: bookingId,
        rating: reviewRating,
        comment: reviewComment
      });
      alert("Thank you for your review!");
      setActiveReviewBookingId(null);
      setReviewComment('');
      setReviewRating(5);
      fetchBookings(); // reload list
    } catch (err) {
      alert(err.response?.data?.non_field_errors?.[0] || err.response?.data?.booking?.[0] || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'ACCEPTED': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'REJECTED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'COMPLETED': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'CANCELLED': return 'bg-slate-800 text-slate-500 border-slate-700/50';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="space-y-10 py-4">
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-slate-900/60 to-purple-950/20 p-8 rounded-3xl border border-slate-800/80 gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Hello, {user.first_name || 'Customer'}!</h2>
          <p className="text-slate-400 text-sm mt-1">Manage your hyperlocal service bookings and locate workers.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/nearby-workers" className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg transition">
            <Navigation className="w-4 h-4" />
            <span>Search on Map</span>
          </Link>
          <Link to="/scan-qr" className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 px-5 py-3 rounded-xl text-sm font-semibold text-slate-300 transition">
            <QrCode className="w-4 h-4 text-purple-400" />
            <span>Scan QR Code</span>
          </Link>
        </div>
      </div>

      {/* Bookings Area */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center space-x-2">
          <span>Your Bookings</span>
          <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-semibold">{bookings.length} total</span>
        </h3>

        {loading ? (
          <div className="text-center py-20 text-slate-500">Loading your bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center border border-slate-800 text-slate-500">
            <p className="mb-4">You have not booked any gig services yet.</p>
            <Link to="/nearby-workers" className="text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center space-x-1 text-sm">
              <span>Find a local helper now</span>
              <span>&rarr;</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="glass rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700/80 transition duration-300 relative overflow-hidden">
                
                {/* Floating status */}
                <div className={`absolute top-4 right-4 border text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-white pr-20">
                      {booking.service.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Worker: {booking.worker.user.first_name} {booking.worker.user.last_name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-y border-slate-800/50 py-3 text-xs text-slate-400">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>{booking.booking_date}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <span>{booking.start_time} ({booking.hours} hr{booking.hours > 1 ? 's' : ''})</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 text-xs text-slate-400">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{booking.address}</span>
                  </div>
                </div>

                {/* Pricing & Controls footer */}
                <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-between items-center">
                  <div className="flex items-center text-green-400 font-bold">
                    <DollarSign className="w-4 h-4" />
                    <span>{booking.total_price}</span>
                  </div>

                  <div className="flex gap-2">
                    {/* Cancel action */}
                    {booking.status === 'PENDING' && (
                      <button 
                        onClick={() => handleCancel(booking.id)}
                        className="text-xs font-semibold text-rose-400 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 transition"
                      >
                        Cancel Booking
                      </button>
                    )}

                    {/* Review action */}
                    {booking.status === 'COMPLETED' && !booking.review && (
                      <button 
                        onClick={() => setActiveReviewBookingId(activeReviewBookingId === booking.id ? null : booking.id)}
                        className="text-xs font-semibold text-amber-400 hover:bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 transition"
                      >
                        Review Service
                      </button>
                    )}

                    {booking.status === 'COMPLETED' && booking.review && (
                      <div className="flex items-center text-amber-500 text-xs font-semibold space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>Reviewed ({booking.review.rating}/5)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Review Sub-form */}
                {activeReviewBookingId === booking.id && (
                  <form onSubmit={(e) => handleReviewSubmit(e, booking.id)} className="mt-5 pt-5 border-t border-slate-800 space-y-3.5">
                    <div className="text-xs font-bold text-white uppercase tracking-wider">Write Review</div>
                    
                    {/* Stars Selector */}
                    <div className="flex items-center space-x-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className={`w-5 h-5 cursor-pointer ${star <= reviewRating ? 'text-amber-400 fill-current' : 'text-slate-600'}`}
                        />
                      ))}
                    </div>

                    <textarea 
                      required
                      rows="2"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience working with this helper..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 resize-none"
                    />

                    <div className="flex justify-end space-x-2">
                      <button 
                        type="button" 
                        onClick={() => setActiveReviewBookingId(null)}
                        className="px-3 py-1.5 bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={submittingReview}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 rounded-lg text-[10px] font-bold text-slate-900 transition"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </form>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
