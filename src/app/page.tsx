'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/lib/AuthContext';
import { SkeletonDashboard } from '@/src/components/SkeletonLoader';

export default function HomePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Instant local redirect if profile is cached
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('auth_profile');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.username) {
            router.replace(`/admin/${parsed.username}`);
            return;
          }
        }
      } catch {}
    }

    if (!loading) {
      if (user && profile) {
        router.replace(`/admin/${profile.username}`);
      } else if (!user) {
        router.replace('/login');
      }
    }
  }, [user, profile, loading, router]);

  return <SkeletonDashboard />;
}
