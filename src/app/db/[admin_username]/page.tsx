'use client';

import dynamic from 'next/dynamic';
import { SkeletonDashboard } from '@/src/components/SkeletonLoader';

const SimDatabaseView = dynamic(() => import('@/src/views/SimDatabaseView'), {
  ssr: false,
  loading: () => <SkeletonDashboard />,
});

export default function DbPage() {
  return <SimDatabaseView />;
}

