'use client';

import dynamic from 'next/dynamic';
import { SkeletonDashboard } from '@/src/components/SkeletonLoader';

const SmartRedirect = dynamic(() => import('@/src/views/SmartRedirect'), {
  ssr: false,
  loading: () => <SkeletonDashboard />,
});

export default function SmartRedirectCatchPage() {
  return <SmartRedirect />;
}

