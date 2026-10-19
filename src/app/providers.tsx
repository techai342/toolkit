'use client';

import React, { Suspense } from 'react';
import { AuthProvider } from '@/src/lib/AuthContext';
import Layout from '@/src/components/Layout';
import GlobalTracker from '@/src/components/GlobalTracker';
import PWAInstallButton from '@/src/components/PWAInstallButton';
import TopLoader from '@/src/components/TopLoader';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <TopLoader />
      <Suspense fallback={null}>
        <GlobalTracker />
        <Layout>
          {children}
        </Layout>
        <PWAInstallButton />
      </Suspense>
    </AuthProvider>
  );
}
