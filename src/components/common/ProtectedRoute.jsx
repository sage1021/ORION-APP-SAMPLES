import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import SplashScreen from '../layout/SplashScreen';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
