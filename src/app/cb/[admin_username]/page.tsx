'use client';

import dynamic from 'next/dynamic';
import { SkeletonDashboard } from '@/src/components/SkeletonLoader';

const ChatbotView = dynamic(() => import('@/src/views/ChatbotView'), {
  ssr: false,
  loading: () => <SkeletonDashboard />,
});

export default function ChatbotPage() {
  return <ChatbotView />;
}

