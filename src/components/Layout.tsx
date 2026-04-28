import React from 'react';
import { Database, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Layout({ children, customBg }: { children: React.ReactNode, customBg?: boolean }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const isPublicView = 
    location.pathname !== '/' && 
    location.pathname !== '/login' && 
    location.pathname !== '/register' && 
    !location.pathname.startsWith('/admin') &&
    !location.pathname.includes('/media/');

  const isAdminDashboard = location.pathname.startsWith('/admin');
  const isCustomBg = isPublicView || isAdminDashboard;

  const hideFooter = location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/register' && !location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen w-full ${isCustomBg ? 'bg-transparent' : 'bg-[#030014]'} text-[#F0F0F0] font-sans flex flex-col overflow-hidden relative selection:bg-purple-500/30 selection:text-white z-0`}>
      
      {/* Background Animated Gradients / Orbs */}
      {!isCustomBg && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-700/30 blur-[120px] -z-10 animate-pulse mix-blend-screen pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[150px] -z-10 animate-pulse mix-blend-screen pointer-events-none" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-cyan-600/20 blur-[100px] -z-10 mix-blend-screen pointer-events-none"></div>
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-[-5]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        </>
      )}

      {/* Navigation Bar */}
      {!isPublicView && (
      <nav className="flex justify-between items-end mb-12 relative z-10 shrink-0 p-4 sm:p-6 md:p-12 lg:p-16 pb-0 sm:pb-0 md:pb-0 lg:pb-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center text-white cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.4)]" onClick={() => navigate('/')}>
            <Database className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-2xl font-black tracking-widest uppercase cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" onClick={() => navigate('/')}>
            SPACE
          </span>
        </div>
        
        {user ? (
          <button 
            onClick={handleSignOut}
            className="px-6 py-2.5 rounded-full border border-purple-500/50 bg-purple-500/10 text-[10px] font-bold uppercase tracking-[0.2em] text-white hover:bg-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.6)] transition-all flex items-center gap-2 backdrop-blur-md"
          >
            <span className="hidden sm:inline">Terminate Session</span>
            <span className="sm:hidden">Log Out</span>
            <LogOut className="w-3 h-3" />
          </button>
        ) : (
          <div className="hidden md:flex gap-8 font-mono text-[10px] lg:text-xs uppercase tracking-widest text-zinc-400">
            <button onClick={() => navigate('/login')} className="hover:text-purple-400 transition-colors uppercase">Login</button>
            <button onClick={() => navigate('/register')} className="hover:text-purple-400 transition-colors uppercase">Register</button>
          </div>
        )}
      </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 w-full max-w-[1400px] mx-auto h-full p-4 sm:p-6 md:p-12 lg:p-16">
        {children}
      </main>

      {/* Bottom Interface Bar */}
      {!hideFooter && (
      <footer className="mt-auto flex justify-between items-end pt-6 md:pt-8 border-t border-white/10 relative z-10 w-full shrink-0 p-4 sm:p-6 md:p-12 lg:p-16 pt-0 sm:pt-0 md:pt-0 lg:pt-0">
        <div className="flex gap-6 md:gap-16">
          <div className="flex flex-col gap-1 md:gap-2">
            <span className="text-[9px] md:text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Connection Status</span>
            <div className="flex items-center gap-2">
              {user ? (
                 <>
                   <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse"></div>
                   <span className="text-[10px] md:text-sm font-medium tracking-tight text-white uppercase">Bridge Established {(profile?.username) && `@${profile.username}`}</span>
                 </>
              ) : (
                <>
                   <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-zinc-600"></div>
                   <span className="text-[10px] md:text-sm font-medium tracking-tight text-zinc-500 uppercase">Awaiting Auth</span>
                 </>
              )}
            </div>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}

