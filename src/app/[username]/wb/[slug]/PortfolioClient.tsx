'use client';

import dynamic from 'next/dynamic';
import { SkeletonDashboard } from '@/src/components/SkeletonLoader';

const PortfolioView = dynamic(() => import('@/src/views/PortfolioView'), {
  ssr: false,
  loading: () => <SkeletonDashboard />,
});

export default function PortfolioClient() {
  return <PortfolioView />;
}
