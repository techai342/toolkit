'use client';

import dynamic from 'next/dynamic';
import { SkeletonDashboard } from '@/src/components/SkeletonLoader';

const AiImageGeneratorView = dynamic(
  () => import('@/src/views/AiImageGeneratorView'),
  {
    ssr: false,
    loading: () => <SkeletonDashboard />,
  }
);

export default function ImageClient() {
  return <AiImageGeneratorView />;
}
