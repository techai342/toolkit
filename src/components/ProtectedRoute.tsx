import React, { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { SkeletonDashboard } from './SkeletonLoader';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const { username } = useParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Strictly match server-side HTML on initial client render to prevent hydration errors
  if (!mounted) {
    return <SkeletonDashboard />;
  }

  // Instant check from cache
  let activeProfile = profile;
  if (!activeProfile && typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('auth_profile');
      if (cached) activeProfile = JSON.parse(cached);
    } catch {}
  }

  // Only show skeleton if we genuinely have no cached profile and are waiting for auth
  if (loading && !activeProfile) {
    return <SkeletonDashboard />;
  }

  // If not logged in after check completes
  if (!loading && !user && !activeProfile) {
    return <Navigate to="/login" replace />;
  }

  if (!activeProfile) {
    return <SkeletonDashboard />;
  }

  // Handle username-based authorization if the route has a username param
  if (username && activeProfile.username !== username) {
    const admins = ['mrsaqib242', 'mrsaqib243', 'ali', 'fahad'];
    if (!admins.includes(activeProfile.username)) {
      return <Navigate to={`/admin/${activeProfile.username}`} replace />;
    }
  }

  return <>{children}</>;
}
