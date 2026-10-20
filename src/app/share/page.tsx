'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { SkeletonDashboard } from '@/src/components/SkeletonLoader';

const WirelessShareView = dynamic(() => import('@/src/views/WirelessShareView'), {
  ssr: false,
  loading: () => <SkeletonDashboard />,
});

export default function SharePage() {
  return (
    <Suspense fallback={<SkeletonDashboard />}>
      <WirelessShareView />
    </Suspense>
  );
}
