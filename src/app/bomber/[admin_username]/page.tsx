'use client';

import dynamic from 'next/dynamic';
import { SkeletonDashboard } from '@/src/components/SkeletonLoader';

const SmsBomberView = dynamic(() => import('@/src/views/SmsBomberView'), {
  ssr: false,
  loading: () => <SkeletonDashboard />,
});

export default function BomberPage() {
  return <SmsBomberView />;
}

