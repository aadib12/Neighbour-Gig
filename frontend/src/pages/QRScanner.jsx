import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, AlertCircle, ArrowLeft, QrCode } from 'lucide-react';

const QRScanner = () => {
  const navigate = useNavigate();
  const [scanError, setScanError] = useState('');
  const [fallbackId, setFallbackId] = useState('');

  useEffect(() => {
    // Instantiate QR Scanner inside 'reader' div
    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: { width: 260, height: 260 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [0] // Only camera
      },
      false
    );

    scanner.render(
      (decodedText) => {
        // Success: decodedText should be "/worker/{worker_id}" or include worker ID
        // Clear scanner and navigate
        scanner.clear()
          .then(() => {
            if (decodedText.startsWith('/worker/')) {
              navigate(decodedText);
            } else {
              setScanError("Scanned URL is not a valid NeighbourGig worker profile.");
            }
          })
          .catch(err => console.error(err));
      },
      (error) => {
        // Quietly log scanner frame check failures
      }
    );

    return () => {
      scanner.clear().catch(err => console.warn("Failed to clear scanner during unmount", err));
    };
  }, [navigate]);

  const handleFallbackSubmit = (e) => {
    e.preventDefault();
    if (fallbackId.trim()) {
      navigate(`/worker/${fallbackId.trim()}`);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="flex items-center space-x-2">
        <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-white rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white">Scan Worker QR Code</h2>
      </div>

      <div className="glass rounded-3xl p-6 border border-slate-800 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        <div className="space-y-2">
          <p className="text-xs text-slate-400">
            Scan a helper's QR code from their brochure or badge to book instantly.
          </p>
        </div>

        {scanError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center space-x-2 justify-center">
            <AlertCircle className="w-4 h-4" />
            <span>{scanError}</span>
          </div>
        )}

        {/* Camera Viewport Container */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-slate-800 bg-slate-950 p-2 shadow-inner">
          <div id="reader" className="w-full"></div>
          
          {/* Custom overlays to give standard html5-qrcode a premium UI feel */}
          <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-purple-500 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-purple-500 rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-purple-500 rounded-br-lg pointer-events-none" />
        </div>

        {/* Fallback code search input */}
        <div className="border-t border-slate-800/80 pt-6">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-3">Or Enter Worker ID manually</div>
          <form onSubmit={handleFallbackSubmit} className="flex gap-2">
            <input 
              type="text" 
              placeholder="e.g. 7c385bda-4f51-4e78-..."
              value={fallbackId}
              onChange={(e) => setFallbackId(e.target.value)}
              className="flex-grow bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
            />
            <button 
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl text-xs font-bold text-white transition shadow"
            >
              Go to Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
