import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Calendar, Clock, MapPin, DollarSign, ArrowLeft, Heart, MessageSquare } from 'lucide-react';
import api from '../api';
import BookingModal from '../components/BookingModal';

const WorkerProfile = () => {
  const { id } = useParams();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    fetchWorkerDetails();
  }, [id]);

  const fetchWorkerDetails = async () => {
    try {
      // 1. Fetch Worker Profile
      const workerRes = await api.get(`/api/workers/profiles/${id}/`);
      setWorker(workerRes.data);
      
      // 2. Fetch reviews matching this worker
      // In a real app, we filter reviews by worker_id on backend ViewSet
      const reviewsRes = await api.get('/api/reviews/');
      const workerReviews = reviewsRes.data.filter(r => r.booking?.worker?.id === id || r.worker === id);
      setReviews(workerReviews);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading worker profile...</div>;
  }

  if (!worker) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold">Worker not found</h3>
        <Link to="/dashboard" className="text-purple-400 mt-2 block">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Back button */}
      <div>
        <Link to="/dashboard" className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to list</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Summary & Actions */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl border border-slate-800 text-center space-y-5 relative">
            <div className="absolute top-4 right-4">
              <button className="p-2 bg-slate-800/40 hover:bg-slate-800 rounded-full border border-slate-800 transition text-rose-500">
                <Heart className="w-5 h-5 fill-current" />
              </button>
            </div>

            {/* Profile image avatar fallback */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto flex items-center justify-center text-white text-3xl font-extrabold shadow-2xl border-4 border-slate-800 overflow-hidden">
              {worker.profile_picture ? (
                <img src={worker.profile_picture} alt="Worker profile" className="w-full h-full object-cover" />
              ) : (
                <span>{worker.user.first_name?.[0] || 'W'}{worker.user.last_name?.[0] || 'P'}</span>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">{worker.user.first_name} {worker.user.last_name}</h2>
              <div className="flex justify-center items-center space-x-1 text-amber-500 font-bold mt-1 text-sm">
                <Star className="w-4 h-4 fill-current" />
                <span>{worker.rating || '0.0'}</span>
                <span className="text-slate-500 text-xs font-normal">({reviews.length} reviews)</span>
              </div>
            </div>

            {/* Rate & Address metadata */}
            <div className="flex justify-around items-center border-y border-slate-800/60 py-4 text-xs text-slate-400">
              <div className="text-center">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500">Hourly Rate</span>
                <span className="text-green-400 font-bold text-lg flex items-center justify-center mt-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{worker.hourly_rate}/hr</span>
                </span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-500">Location</span>
                <span className="text-white font-bold text-sm flex items-center justify-center mt-1 space-x-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span className="truncate max-w-[120px]">{worker.address || 'Neighbourhood'}</span>
                </span>
              </div>
            </div>

            {/* Main Book Button */}
            <button 
              onClick={() => setShowBooking(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3.5 rounded-xl font-extrabold text-sm text-white shadow-xl transition"
            >
              Book Service Now
            </button>
          </div>

          {/* Availabilities mapping */}
          <div className="glass p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Available Working Hours</span>
            </h3>
            
            <div className="space-y-2 text-xs">
              {worker.availabilities?.length === 0 ? (
                <p className="text-slate-500">Contact helper directly for working hours.</p>
              ) : (
                worker.availabilities?.map(av => (
                  <div key={av.id} className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="font-bold text-slate-300">{av.day_name}</span>
                    <span className="text-purple-400 font-semibold">{av.start_time.slice(0, 5)} - {av.end_time.slice(0, 5)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Bio, Skills & Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bio & Skills */}
          <div className="glass p-8 rounded-2xl border border-slate-800 space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-purple-400">About Me</h3>
              <p className="text-slate-300 leading-relaxed text-sm">
                {worker.bio || "No description provided. This gig worker is highly recommended inside the neighborhood for their skills and local availability."}
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Expertise & Skills</h3>
              <div className="flex flex-wrap gap-2">
                {worker.skills?.map((skill, index) => (
                  <span key={index} className="bg-purple-950/20 text-purple-400 border border-purple-800/30 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                    {skill}
                  </span>
                )) || <span className="text-slate-500 text-xs">General Gig Helper</span>}
              </div>
            </div>
          </div>

          {/* Reviews list */}
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              <span>Customer Reviews ({reviews.length})</span>
            </h3>

            {reviews.length === 0 ? (
              <div className="glass p-8 rounded-xl text-center text-slate-500 border border-slate-800 text-sm">
                No reviews yet. Be the first to book and review {worker.user.first_name}!
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="glass p-5 rounded-xl border border-slate-800/80 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-sm text-white">{review.customer_name}</div>
                        <div className="text-[10px] text-slate-500">{new Date(review.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center text-amber-500 space-x-0.5 text-xs font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{review.rating}.0</span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Overlay Modal */}
      {showBooking && (
        <BookingModal 
          worker={worker} 
          onClose={() => setShowBooking(false)} 
          onBookingSuccess={() => {
            alert("Booking request submitted successfully!");
            setShowBooking(false);
          }}
        />
      )}
    </div>
  );
};

export default WorkerProfile;
