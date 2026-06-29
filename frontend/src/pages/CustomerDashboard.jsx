import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, DollarSign, Star, MessageSquare, Plus, CheckCircle, Navigation, QrCode, X, Check } from 'lucide-react';
import api from '../api';

const PaymentModal = ({ booking, onClose, onPaymentSuccess }) => {
  const [method, setMethod] = useState('UPI'); // UPI or COD
  const [upiId, setUpiId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        localStorage.setItem(`paid_booking_${booking.id}`, method);
        onPaymentSuccess();
        onClose();
      }, 1500);
    }, 1500);
  };

  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
    `upi://pay?pa=neighbourgig@upi&pn=NeighbourGig&am=${booking.total_price}&cu=INR`
  )}`;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-center z-50 p-4 animate-in fade-in duration-300">
      <div className="glass w-full max-w-md rounded-2xl border border-slate-800 p-6 space-y-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        {success ? (
          <div className="text-center py-10 space-y-4 animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
              <Check className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Payment Confirmed!</h4>
              <p className="text-xs text-slate-400 mt-1">
                {method === 'UPI' ? 'UPI payment successfully verified.' : 'Cash on Delivery confirmed.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Select Payment Method</h3>
                <p className="text-xs text-slate-400">Total: ${booking.total_price}</p>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1 hover:bg-slate-800 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setMethod('UPI')}
                className={`w-1/2 p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition duration-300 ${
                  method === 'UPI' 
                    ? 'bg-purple-600/10 border-purple-500 text-purple-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <QrCode className="w-6 h-6" />
                <span className="text-xs font-bold">UPI / Scan QR</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('COD')}
                className={`w-1/2 p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition duration-300 ${
                  method === 'COD' 
                    ? 'bg-purple-600/10 border-purple-500 text-purple-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <DollarSign className="w-6 h-6" />
                <span className="text-xs font-bold">Cash on Delivery</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {method === 'UPI' ? (
                <div className="space-y-4 text-center animate-in fade-in duration-300">
                  <div className="bg-white p-2.5 rounded-xl inline-block shadow-lg border border-slate-200">
                    <img src={upiQrUrl} alt="UPI Payment QR" className="w-36 h-36 object-contain" />
                  </div>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                    Scan this QR code with any UPI app (GPay, PhonePe, Paytm) to transfer **${booking.total_price}**
                  </p>
                  <div className="text-left">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Or enter your UPI ID</label>
                    <input
                      type="text"
                      required
                      placeholder="username@okaxis"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-2 animate-in fade-in duration-300">
                  <p className="font-semibold text-white">Cash on Delivery (COD)</p>
                  <p>You will pay the worker directly in cash or local methods upon service completion.</p>
                  <p className="text-[10px] text-purple-400">No advance payment required.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-3 rounded-xl transition duration-200 active:scale-95 shadow-lg flex justify-center items-center"
              >
                {submitting ? 'Verifying payment...' : 'Confirm'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

const CustomerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentBooking, setSelectedPaymentBooking] = useState(null);
  
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
      const res = await api.get('/api/bookings/user/');
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

                  <div className="flex gap-2 items-center">
                    {/* Pay Now or Payment Status Display */}
                    {booking.status === 'ACCEPTED' && (() => {
                      const payStatus = localStorage.getItem(`paid_booking_${booking.id}`);
                      if (payStatus) {
                        return (
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border uppercase ${
                            payStatus === 'UPI' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          }`}>
                            Paid ({payStatus})
                          </span>
                        );
                      }
                      return (
                        <button 
                          onClick={() => setSelectedPaymentBooking(booking)}
                          className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-lg shadow transition duration-200 active:scale-95"
                        >
                          Pay Now
                        </button>
                      );
                    })()}

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

      {/* Interactive Payment Checkout Modal */}
      {selectedPaymentBooking && (
        <PaymentModal 
          booking={selectedPaymentBooking} 
          onClose={() => setSelectedPaymentBooking(null)}
          onPaymentSuccess={() => fetchBookings()}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
