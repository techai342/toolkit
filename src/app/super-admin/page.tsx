'use client';

import dynamic from 'next/dynamic';
import { SkeletonDashboard } from '@/src/components/SkeletonLoader';

const SuperAdminDashboard = dynamic(
  () => import('@/src/views/SuperAdminDashboard'),
  {
    ssr: false,
    loading: () => <SkeletonDashboard />,
  }
);

export default function SuperAdminPage() {
  return <SuperAdminDashboard />;
}
