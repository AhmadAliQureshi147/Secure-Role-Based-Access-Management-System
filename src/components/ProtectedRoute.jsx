import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

const ProtectedRoute = (requiredRole) => {
  const { user, role } = useAuth();

  if (!user) {
    return <Navigate to="/signin" />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/landing" />;
  }
};

export default ProtectedRoute;
