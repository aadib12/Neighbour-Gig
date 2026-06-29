import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import LandingPage from './pages/LandingPage';
import LoginSignup from './pages/LoginSignup';
import CustomerDashboard from './pages/CustomerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import WorkerProfile from './pages/WorkerProfile';
import NearbyWorkers from './pages/NearbyWorkers';
import QRScanner from './pages/QRScanner';
import ChatUI from './pages/ChatUI';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white">
        <Navbar />
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginSignup />} />
            
            {/* Customer Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/nearby-workers" 
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <NearbyWorkers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/scan-qr" 
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <QRScanner />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/worker/:id" 
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'WORKER', 'ADMIN']}>
                  <WorkerProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER', 'WORKER']}>
                  <ChatUI />
                </ProtectedRoute>
              } 
            />

            {/* Worker Routes */}
            <Route 
              path="/worker-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['WORKER']}>
                  <WorkerDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Admin Routes */}
            <Route 
              path="/admin-panel" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-600">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center px-4 md:px-8">
            <p>&copy; {new Date().getFullYear()} NeighbourGig. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Hyperlocal Gig Economy Marketplace - Built with React & Django</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
