import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('access_token');
  const userJson = localStorage.getItem('user');
  
  if (!token || !userJson) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userJson);

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not matching target role, redirect to appropriate home
    if (user.role === 'WORKER') {
      return <Navigate to="/worker-dashboard" replace />;
    } else if (user.role === 'ADMIN') {
      return <Navigate to="/admin-panel" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
