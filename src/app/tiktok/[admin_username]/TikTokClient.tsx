'use client';

import dynamic from 'next/dynamic';
import { SkeletonDashboard } from '@/src/components/SkeletonLoader';

const TikTokDownloaderView = dynamic(
  () => import('@/src/views/TikTokDownloaderView'),
  {
    ssr: false,
    loading: () => <SkeletonDashboard />,
  }
);

export default function TikTokClient() {
  return <TikTokDownloaderView />;
}
