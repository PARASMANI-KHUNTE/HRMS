import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  // 1. Check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check if the user has the required role
  const role = user?.role || user?.user?.role;
  const hasRequiredRole = allowedRoles.includes(role);

  if (!hasRequiredRole) {
    // Redirect to a safe page if role doesn't match
    // This prevents users from accessing other roles' dashboards
    return <Navigate to="/" replace />;
  }

  // 3. If everything is fine, render the requested component
  return <Outlet />;
};

export default ProtectedRoute;
