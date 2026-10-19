'use client';

import dynamic from 'next/dynamic';
import { SkeletonProfile } from '@/src/components/SkeletonLoader';

const PublicView = dynamic(() => import('@/src/views/PublicView'), {
  ssr: false,
  loading: () => <SkeletonProfile />,
});

export default function PublicUserClient() {
  return <PublicView />;
}
