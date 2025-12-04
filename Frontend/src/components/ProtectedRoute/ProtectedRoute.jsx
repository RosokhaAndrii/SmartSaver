import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth/useAuth';

export default function ProtectedRoute({ children }) {
  const { accessToken, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!accessToken) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
};

