'use client';

import dynamic from 'next/dynamic';
import { SkeletonDashboard } from '@/src/components/SkeletonLoader';

const Login = dynamic(() => import('@/src/views/Login'), {
  ssr: false,
  loading: () => <SkeletonDashboard />,
});

export default function LoginPage() {
  return <Login />;
}

