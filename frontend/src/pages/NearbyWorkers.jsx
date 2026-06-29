import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Navigation, Star, DollarSign, Search, Sliders } from 'lucide-react';
import api from '../api';
import MapView from '../components/MapView';
import BookingModal from '../components/BookingModal';

const NearbyWorkers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Geolocation & search states
  const [lat, setLat] = useState('37.774929'); // Default San Francisco coordinates
  const [lng, setLng] = useState('-122.419416');
  const [radius, setRadius] = useState(10); // Default 10km
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [categories, setCategories] = useState([]);

  // Booking Modal trigger
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState(null);

  useEffect(() => {
    fetchCategories();
    // Proactively request browser location
    triggerGeolocate();
  }, []);

  useEffect(() => {
    fetchNearbyWorkers();
  }, [lat, lng, radius, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/workers/categories/');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNearbyWorkers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/workers/nearby/`, {
        params: {
          lat: lat,
          lng: lng,
          radius: radius
        }
      });
      
      // Filter locally by category slug if chosen (or route backend filters)
      let filtered = res.data;
      if (selectedCategory) {
        // Backend ViewSet category parameter can also handle this, 
        // but since we get nearby coordinates, let's do a safe filter matching skills/category
        // In this MVP we can filter if category matches slug keywords in their skills tags
        filtered = res.data.filter(worker => 
          Array.isArray(worker.skills) && worker.skills.some(skill => skill.toLowerCase().includes(selectedCategory.toLowerCase()))
        );
      }
      setWorkers(filtered);
    } catch (err) {
      console.error("Failed to query nearby workers", err);
    } finally {
      setLoading(false);
    }
  };

  const triggerGeolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toFixed(6));
          setLng(position.coords.longitude.toFixed(6));
        },
        (error) => {
          console.warn("Location permission denied or unavailable. Using default coordinates.");
        }
      );
    }
  };

  return (
    <div className="space-y-6 py-4 flex flex-col min-h-screen">
      {/* Top filter controls */}
      <div className="glass p-5 rounded-2xl border border-slate-800/80 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs">
            <Sliders className="w-4 h-4 text-purple-400" />
            <span className="font-bold uppercase tracking-wider text-slate-400">Filters</span>
          </div>

          {/* Category Dropdown */}
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Services</option>
            {categories.map(c => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>

          {/* Radius Slider */}
          <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-1.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Radius: {radius}km</span>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={radius} 
              onChange={(e) => setRadius(e.target.value)}
              className="accent-purple-500 w-24 h-1 rounded-lg cursor-pointer bg-slate-700" 
            />
          </div>
        </div>

        {/* Location Buttons */}
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => {
              setLat('37.774929');
              setLng('-122.419416');
            }}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
          >
            <span>SF Test Coordinates</span>
          </button>
          
          <button 
            type="button"
            onClick={triggerGeolocate}
            className="bg-purple-600/10 hover:bg-purple-600 border border-purple-500/20 text-purple-400 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>My Location</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Left Side: Worker Cards */}
        <div className="w-full md:w-1/3 flex flex-col gap-4 overflow-y-auto pr-1">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
            Workers Nearby ({workers.length})
          </h3>

          {loading ? (
            <div className="text-center py-20 text-slate-500">Querying coordinates...</div>
          ) : workers.length === 0 ? (
            <div className="glass p-8 rounded-xl text-center border border-slate-800 text-slate-500 text-xs">
              No workers found within {radius}km. Try expanding the search radius.
            </div>
          ) : (
            workers.map(worker => (
              <div 
                key={worker.id}
                className="glass rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition duration-300 flex flex-col justify-between h-44"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-white text-sm">
                        {worker.user?.first_name || 'Anonymous'} {worker.user?.last_name || 'Worker'}
                      </h4>
                      <p className="text-[10px] text-purple-400 font-semibold uppercase mt-0.5">
                        {(Array.isArray(worker.skills) ? worker.skills.slice(0, 2).join(', ') : '') || 'Local Helper'}
                      </p>
                    </div>
                    <div className="flex items-center text-xs text-amber-500 font-bold bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded">
                      <Star className="w-3 h-3 fill-current mr-0.5" />
                      <span>{worker.rating || '0.0'}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {worker.bio || 'Experienced worker offering quick local assistance.'}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-slate-800/80 pt-3 mt-2">
                  <div className="flex items-center text-green-400 font-bold text-sm">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>{worker.hourly_rate}/hr</span>
                  </div>

                  <div className="flex space-x-2">
                    <Link 
                      to={`/worker/${worker.id}`}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-[10px] font-bold text-slate-300 transition"
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={() => setSelectedWorkerForBooking(worker)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-[10px] font-bold text-white transition shadow"
                    >
                      Book
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Right Side: Map Container */}
        <div className="w-full md:w-2/3 h-[450px] md:h-[600px] overflow-hidden">
          <MapView 
            center={[parseFloat(lat), parseFloat(lng)]} 
            workers={workers} 
            onSelectWorker={(worker) => setSelectedWorkerForBooking(worker)}
          />
        </div>

      </div>

      {/* Booking Trigger Modal */}
      {selectedWorkerForBooking && (
        <BookingModal 
          worker={selectedWorkerForBooking} 
          onClose={() => setSelectedWorkerForBooking(null)}
          onBookingSuccess={(booking) => {
            setSelectedWorkerForBooking(null);
            sessionStorage.setItem('pending_payment_booking', JSON.stringify(booking));
            navigate('/dashboard');
          }}
        />
      )}
    </div>
  );
};

export default NearbyWorkers;
