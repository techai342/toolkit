'use client';

import dynamic from 'next/dynamic';
import { SkeletonDashboard } from '@/src/components/SkeletonLoader';

const MediaDownload = dynamic(() => import('@/src/views/MediaDownload'), {
  ssr: false,
  loading: () => <SkeletonDashboard />,
});

export default function MediaClient() {
  return <MediaDownload />;
}
