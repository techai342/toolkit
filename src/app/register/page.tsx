'use client';

import dynamic from 'next/dynamic';
import { SkeletonDashboard } from '@/src/components/SkeletonLoader';

const Register = dynamic(() => import('@/src/views/Register'), {
  ssr: false,
  loading: () => <SkeletonDashboard />,
});

export default function RegisterPage() {
  return <Register />;
}

