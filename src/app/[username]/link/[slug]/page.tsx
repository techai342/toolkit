'use client';

import dynamic from 'next/dynamic';
import { SkeletonDashboard } from '@/src/components/SkeletonLoader';

const ShortLinkRedirect = dynamic(
  () => import('@/src/views/ShortLinkRedirect'),
  {
    ssr: false,
    loading: () => <SkeletonDashboard />,
  }
);

export default function ShortLinkPage() {
  return <ShortLinkRedirect />;
}

