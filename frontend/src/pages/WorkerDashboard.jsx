import React, { useState, useEffect } from 'react';
import { QrCode, ToggleLeft, ToggleRight, DollarSign, Calendar, Clock, MapPin, Check, X, ShieldAlert, Award, Star, ListPlus } from 'lucide-react';
import api, { getMediaUrl } from '../api';

const WorkerDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile fields editing
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState(0);
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // New Availability form state
  const [newDate, setNewDate] = useState('');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('17:00');
  const [addingSchedule, setAddingSchedule] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 0. Fetch Predefined Services
      const servicesRes = await api.get('/api/workers/services/');
      setAvailableServices(servicesRes.data);

      // 1. Fetch Worker Profile
      const profileRes = await api.get('/api/workers/register/');
      setProfile(profileRes.data);
      setBio(profileRes.data.bio || '');
      setHourlyRate(profileRes.data.hourly_rate || 0);
      setAddress(profileRes.data.address || '');
      setLatitude(profileRes.data.latitude || 0);
      setLongitude(profileRes.data.longitude || 0);
      setSelectedServices(profileRes.data.skills || []);
      
      // 2. Fetch Bookings
      const bookingsRes = await api.get('/api/bookings/user/');
      setBookings(bookingsRes.data);
      
      // 3. Fetch Availabilities
      const availRes = await api.get('/api/workers/availabilities/');
      setAvailabilities(availRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const formData = new FormData();
      formData.append('bio', bio);
      formData.append('hourly_rate', parseFloat(hourlyRate));
      formData.append('address', address);
      
      const latVal = parseFloat(latitude);
      const lngVal = parseFloat(longitude);
      formData.append('latitude', isNaN(latVal) ? '' : latVal);
      formData.append('longitude', isNaN(lngVal) ? '' : lngVal);
      
      formData.append('skills', JSON.stringify(selectedServices));

      if (profilePictureFile) {
        formData.append('profile_picture', profilePictureFile);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      const res = profile 
        ? await api.patch('/api/workers/register/', formData, config)
        : await api.post('/api/workers/register/', formData, config);

      setProfile(res.data);
      setProfilePictureFile(null);
      alert("Profile updated successfully!");
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleToggleAvailability = async () => {
    if (!profile) return;
    try {
      const res = await api.patch('/api/workers/register/', {
        is_available: !profile.is_available
      });
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookingAction = async (id, statusAction) => {
    try {
      await api.patch(`/api/bookings/${id}/status/`, { status: statusAction });
      fetchDashboardData();
    } catch (err) {
      alert("Booking status update failed: " + (err.response?.data?.status || 'Unknown error'));
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    setAddingSchedule(true);
    try {
      await api.post('/api/workers/availabilities/', {
        date: newDate,
        start_time: newStart + ':00',
        end_time: newEnd + ':00'
      });
      setNewDate('');
      setNewStart('09:00');
      setNewEnd('17:00');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert("Failed to add schedule.");
    } finally {
      setAddingSchedule(false);
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm("Delete this availability slot?")) return;
    try {
      await api.delete(`/api/workers/availabilities/${id}/`);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const triggerGeolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
        },
        (error) => {
          alert("Error retrieving coordinates. Please type manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading worker dashboard...</div>;
  }

  // Analytics
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
  const earnings = completedBookings.reduce((sum, b) => sum + parseFloat(b.total_price), 0).toFixed(2);
  const pendingRequests = bookings.filter(b => b.status === 'PENDING').length;

  return (
    <div className="space-y-10 py-4">
      {/* Profile check banner */}
      {!profile && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-5 rounded-2xl flex items-center space-x-3">
          <ShieldAlert className="w-6 h-6 text-rose-500 shrink-0" />
          <div>
            <div className="font-bold">Profile Setup Required</div>
            <div className="text-xs mt-0.5">Please fill out your service details, location coordinates, and rate below to start accepting bookings.</div>
          </div>
        </div>
      )}

      {/* Hero Header Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Earnings Card */}
        <div className="glass p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Earnings</span>
            <h3 className="text-2xl font-black text-white mt-1">${earnings}</h3>
          </div>
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Card */}
        <div className="glass p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pending Bookings</span>
            <h3 className="text-2xl font-black text-amber-400 mt-1">{pendingRequests} request{pendingRequests !== 1 ? 's' : ''}</h3>
          </div>
          <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Rating Card */}
        <div className="glass p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Average Rating</span>
            <h3 className="text-2xl font-black text-white mt-1 flex items-center space-x-1">
              <span>{profile?.rating || '0.0'}</span>
              <Star className="w-4 h-4 text-amber-500 fill-current" />
            </h3>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Status Toggle Card */}
        <div className="glass p-6 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Availability Status</span>
            <h3 className="text-lg font-bold text-white mt-1">
              {profile?.is_available ? 'Accepting Gigs' : 'Offline'}
            </h3>
          </div>
          <button onClick={handleToggleAvailability} className="focus:outline-none">
            {profile?.is_available ? (
              <ToggleRight className="w-12 h-12 text-purple-500" />
            ) : (
              <ToggleLeft className="w-12 h-12 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Gig Availability & QR Code */}
        <div className="space-y-8 lg:col-span-1">
          
          {/* Schedule management */}
          <div className="glass p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl hover:border-slate-700/60 transition-all duration-300">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <ListPlus className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span>Gig Availability</span>
            </h3>

            {/* List current availabilities */}
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {availabilities.length === 0 ? (
                <div className="text-[11px] text-slate-500 py-2">No availability schedules added yet.</div>
              ) : (
                availabilities.map(av => (
                  <div key={av.id} className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl text-xs border border-slate-800/80 hover:border-indigo-500/30 transition duration-300">
                    <div>
                      <span className="font-bold text-white mr-2">{av.date ? av.date : av.day_name}:</span>
                      <span className="text-slate-400">{av.start_time.slice(0, 5)} - {av.end_time.slice(0, 5)}</span>
                    </div>
                    <button onClick={() => handleDeleteSchedule(av.id)} className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-500/10 rounded-lg transition">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleAddSchedule} className="pt-4 border-t border-slate-800/60 space-y-3">
              <div>
                <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Date</label>
                <input 
                  type="date" 
                  required
                  value={newDate} 
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Start Time</label>
                  <input 
                    type="time" 
                    value={newStart} 
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">End Time</label>
                  <input 
                    type="time" 
                    value={newEnd} 
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={addingSchedule}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg hover:shadow-indigo-500/20 active:scale-95 duration-200"
              >
                {addingSchedule ? 'Adding...' : 'Add Slot'}
              </button>
            </form>
          </div>

          {/* QR mapping card */}
          {profile?.qr_code && (
            <div className="glass p-6 rounded-2xl border border-slate-800 text-center space-y-4 shadow-xl hover:border-slate-700/60 transition-all duration-300">
              <h3 className="text-lg font-bold text-white flex items-center justify-center space-x-1.5">
                <QrCode className="w-5 h-5 text-purple-400" />
                <span>Share Profile QR</span>
              </h3>
              
              <div className="w-40 h-40 bg-white p-2 rounded-xl mx-auto flex items-center justify-center border border-slate-800 shadow-lg">
                <img 
                  src={getMediaUrl(profile.qr_code.qr_code_image) || 'https://via.placeholder.com/150'} 
                  alt="QR Code Code Mapping" 
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Customers can scan this QR code to access your profile details and book you instantly on NeighbourGig.
              </p>
              <a 
                href={getMediaUrl(profile.qr_code.qr_code_image)}
                download={`neighbourgig_qr_${profile.id}.png`}
                target="_blank"
                rel="noreferrer"
                className="inline-block w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs py-3 rounded-xl transition"
              >
                Open QR Image
              </a>
            </div>
          )}

        </div>

        {/* Right Column: Bookings Queue & Profile details */}
        <div className="space-y-8 lg:col-span-2">
          
          {/* Bookings Queue */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>Booking Orders Queue</span>
              <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-semibold">{bookings.length}</span>
            </h3>

            {bookings.length === 0 ? (
              <div className="glass p-12 rounded-2xl text-center text-slate-500 border border-slate-800">
                No booking orders received yet.
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div key={booking.id} className="glass rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-700/80 transition duration-300">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-white font-bold">{booking.service.name}</span>
                        <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase ${
                          booking.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                          booking.status === 'ACCEPTED' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
                          booking.status === 'COMPLETED' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 space-y-1">
                        <div>Customer: {booking.customer.user.first_name} {booking.customer.user.last_name} ({booking.customer.user.phone})</div>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 text-purple-400" />
                            <span>{booking.booking_date}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{booking.start_time} ({booking.hours} hr{booking.hours > 1 ? 's' : ''})</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate max-w-sm">{booking.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-slate-800/80 pt-3 sm:pt-0">
                      <span className="text-green-400 font-bold">${booking.total_price}</span>
                      
                      <div className="flex gap-2 ml-auto sm:ml-0">
                        {booking.status === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => handleBookingAction(booking.id, 'REJECTED')}
                              className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 hover:bg-rose-500 hover:text-white transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleBookingAction(booking.id, 'ACCEPTED')}
                              className="p-2 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 hover:bg-green-500 hover:text-white transition"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {booking.status === 'ACCEPTED' && (
                          <button 
                            onClick={() => handleBookingAction(booking.id, 'COMPLETED')}
                            className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition shadow"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile details */}
          <div className="glass p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-white">Gig Services Profile Settings</h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Hourly rate ($)</label>
                  <input 
                    type="number"
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Profile Picture</label>
                  <div className="flex items-center space-x-3">
                    {profile?.profile_picture && (
                      <img 
                        src={getMediaUrl(profile.profile_picture)} 
                        alt="Current Avatar" 
                        className="w-10 h-10 rounded-full object-cover border border-slate-800"
                      />
                    )}
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfilePictureFile(e.target.files[0])}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-400 focus:outline-none focus:border-purple-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-purple-600/10 file:text-purple-400 hover:file:bg-purple-600/20 file:cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Predefined Services Offered (Skills)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 max-h-48 overflow-y-auto">
                  {availableServices.map((svc) => (
                    <label key={svc.id} className="flex items-center space-x-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none">
                      <input 
                        type="checkbox"
                        checked={selectedServices.includes(svc.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedServices([...selectedServices, svc.name]);
                          } else {
                            setSelectedServices(selectedServices.filter(s => s !== svc.name));
                          }
                        }}
                        className="rounded border-slate-700 bg-slate-950 text-purple-500 focus:ring-purple-500 focus:ring-offset-slate-950 w-4 h-4"
                      />
                      <span>{svc.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Bio Description</label>
                <textarea 
                  rows="3"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell clients about your experience, tools, and background..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 resize-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Worker Base Address</label>
                <input 
                  type="text"
                  value={address}
                  placeholder="Street address, City, State"
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              {/* Coordinates lookup */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Local Latitude / Longitude</label>
                <div className="flex space-x-2">
                  <input 
                    type="text"
                    placeholder="Latitude"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition"
                  />
                  <input 
                    type="text"
                    placeholder="Longitude"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
                <button 
                  type="button"
                  onClick={triggerGeolocate}
                  className="mt-2 text-[10px] text-purple-400 font-bold hover:underline transition"
                >
                  Locate me automatically
                </button>
              </div>

              <button 
                type="submit" 
                disabled={updatingProfile}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-3 rounded-xl transition duration-200 active:scale-95 shadow-lg"
              >
                {updatingProfile ? 'Saving...' : 'Update details'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;
