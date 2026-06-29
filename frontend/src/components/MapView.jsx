import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';

// Custom icons using Leaflet divIcon to ensure compatibility and premium styles
const getWorkerIcon = () => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="w-9 h-9 bg-purple-600 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-xl hover:bg-purple-500 hover:scale-110 transition duration-200">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

const getCustomerIcon = () => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div class="w-9 h-9 bg-rose-500 rounded-full border-2 border-slate-900 flex items-center justify-center shadow-xl">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"></path><circle cx="12" cy="10" r="3"></circle></svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

const MapView = ({ center, workers, onSelectWorker }) => {
  if (!center || isNaN(center[0]) || isNaN(center[1])) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs">
        Initializing map coordinates...
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden border border-slate-800 rounded-2xl shadow-inner">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* Dark theme maps tiles from CartoDB */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Customer Location Pin */}
        <Marker position={center} icon={getCustomerIcon()}>
          <Popup>
            <div className="text-slate-900 font-semibold p-1">
              Your Current Location
            </div>
          </Popup>
        </Marker>

        {/* Worker Pins */}
        {workers.map((worker) => {
          if (!worker.latitude || !worker.longitude) return null;
          return (
            <Marker 
              key={worker.id} 
              position={[parseFloat(worker.latitude), parseFloat(worker.longitude)]}
              icon={getWorkerIcon()}
            >
              <Popup>
                <div className="p-2 text-slate-900 w-48">
                  <div className="font-bold text-sm">
                    {worker.user.first_name} {worker.user.last_name}
                  </div>
                  <div className="text-xs text-purple-600 font-semibold mb-1">
                    {worker.skills.slice(0, 2).join(', ') || 'General Helper'}
                  </div>
                  <div className="flex items-center text-xs space-x-1 text-amber-500 mb-2">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{worker.rating || '0.0'}</span>
                    <span className="text-slate-400">({worker.hourly_rate}/hr)</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 border-t pt-2">
                    <Link 
                      to={`/worker/${worker.id}`}
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 transition"
                    >
                      View Profile
                    </Link>
                    {onSelectWorker && (
                      <button 
                        onClick={() => onSelectWorker(worker)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-2 py-1 rounded transition"
                      >
                        Book Now
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default React.memo(MapView);
