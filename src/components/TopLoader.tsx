'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function TopLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // When route changes, trigger a quick, sleek line sweep
    setLoading(true);
    setProgress(30);

    const timer1 = setTimeout(() => setProgress(75), 100);
    const timer2 = setTimeout(() => setProgress(100), 250);
    const timer3 = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [pathname, searchParams]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none h-[3px] bg-transparent">
      {/* Glowing progress line */}
      <div
        className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-indigo-500 shadow-[0_0_12px_rgba(168,85,247,0.8),0_0_6px_rgba(6,182,212,0.8)] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
      {/* Leading neon head glow */}
      <div
        className="absolute top-0 h-[3px] w-24 bg-white/40 blur-[2px] transition-all duration-300 ease-out"
        style={{
          left: `calc(${progress}% - 96px)`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}

export default function TopLoader() {
  return (
    <Suspense fallback={null}>
      <TopLoaderInner />
    </Suspense>
  );
}

/**
 * Sleek line loader for inside pages / cards instead of bulky skeletons
 */
export function LineLoader({ text = "Loading space data..." }: { text?: string }) {
  return (
    <div className="w-full flex flex-col items-center justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white/5 rounded-full h-1.5 overflow-hidden relative border border-white/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
        <div className="absolute top-0 bottom-0 left-0 h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-indigo-500 rounded-full animate-[shimmer_1.2s_infinite] w-1/2 shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
      </div>
      {text && (
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-400 mt-4 animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
}
