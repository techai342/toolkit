'use client';

import dynamic from 'next/dynamic';
import { SkeletonDashboard } from '@/src/components/SkeletonLoader';

const HiddenAdminStats = dynamic(
  () => import('@/src/views/HiddenAdminStats'),
  {
    ssr: false,
    loading: () => <SkeletonDashboard />,
  }
);

export default function HiddenAdminPage() {
  return <HiddenAdminStats />;
}

