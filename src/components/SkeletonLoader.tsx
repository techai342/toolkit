'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Zap, Cpu } from 'lucide-react';

export const SkeletonDashboard = ({ title = "LOADING DASHBOARD" }: { title?: string }) => {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState("INITIALIZING SPACE OS...");

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(48);
      setStatusText("SYNCING MODULES & DATABASES...");
    }, 180);

    const t2 = setTimeout(() => {
      setProgress(86);
      setStatusText("ESTABLISHING SECURE BRIDGE...");
    }, 450);

    const t3 = setTimeout(() => {
      setProgress(98);
      setStatusText("READYING DASHBOARD INTERFACE...");
    }, 750);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#030014] flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans">
      {/* Background Animated Neon Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse delay-1000" />
      {/* Sci-Fi Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Futuristic Gaming HUD Card */}
      <div className="w-full max-w-lg bg-white/[0.02] backdrop-blur-3xl border border-purple-500/20 rounded-[32px] p-8 sm:p-12 shadow-[0_0_60px_rgba(0,0,0,0.8),0_0_35px_rgba(168,85,247,0.2)] relative flex flex-col items-center text-center">
        {/* Top Glowing Header Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-mono uppercase tracking-[0.25em] mb-8 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
          SYSTEM_BOOT // ACTIVE
        </div>

        {/* Central Glowing Cyber Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-[0_0_35px_rgba(168,85,247,0.6)] border border-white/20">
            <Cpu className="w-10 h-10 text-white stroke-[2.2] animate-pulse" />
          </div>
          {/* Outer Orbit Halo */}
          <div className="absolute -inset-3 rounded-full border border-purple-500/20 animate-spin duration-3000 pointer-events-none" />
        </div>

        {/* Big Gaming Title */}
        <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-cyan-300 drop-shadow-[0_2px_15px_rgba(168,85,247,0.6)] mb-2 font-display">
          {title}
        </h2>

        {/* Subtitle / System Log */}
        <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-zinc-400 mb-8 min-h-[16px] animate-pulse">
          {statusText}
        </p>

        {/* Game-Style Loading Bar */}
        <div className="w-full bg-black/60 rounded-full h-4 p-1 border border-purple-500/40 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9),0_0_20px_rgba(168,85,247,0.3)] relative overflow-hidden mb-3">
          {/* Progress Bar Fill */}
          <div
            className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300 ease-out shadow-[0_0_15px_rgba(168,85,247,0.9)] relative"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer Light Sweep inside the bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_1s_infinite] rounded-full" />
          </div>
        </div>

        {/* Progress Percentage & Tech Status */}
        <div className="w-full flex justify-between items-center text-[10px] font-mono text-zinc-500 tracking-widest px-1">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-purple-400" />
            <span className="text-zinc-400">ENGINE_SYNC</span>
          </div>
          <span className="text-cyan-300 font-bold text-sm tracking-wider">{progress}%</span>
        </div>
      </div>

      {/* Bottom Footer Credit */}
      <div className="mt-8 text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">
        SPACE OS // POWERED BY SAQIB
      </div>
    </div>
  );
};

export const SkeletonProfile = () => (
  <SkeletonDashboard title="LOADING PROFILE" />
);

export default SkeletonDashboard;
