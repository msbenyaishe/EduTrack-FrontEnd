import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role not authorized
    // Redirect to their respective dashboard
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  // Authorized, render child routes
  return <Outlet />;
};

export default ProtectedRoute;
