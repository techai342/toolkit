'use client';

import dynamic from 'next/dynamic';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { SkeletonDashboard } from '@/src/components/SkeletonLoader';

const AdminDashboard = dynamic(
  () => import('@/src/views/admin-dashboard/AdminDashboard'),
  {
    ssr: false,
    loading: () => <SkeletonDashboard />,
  }
);

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}
