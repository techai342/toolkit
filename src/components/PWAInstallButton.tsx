import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const location = useLocation();

  // Logic to determine if we are on a public profile page
  // Public profile paths are strictly /:username (one segment)
  // We exclude /login, /register, and root /
  const isPublicProfilePage = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length !== 1) return false;
    const reserved = ['login', 'register', 'admin', 'db', 'bomber'];
    return !reserved.includes(segments[0]);
  };

  useEffect(() => {
    // Check if app is already installed/in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
      console.log('PWA prompt ready');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsVisible(false);
      setIsStandalone(true);
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  // Only show if visible, not standalone, AND on a public profile page
  if (!isVisible || isStandalone || !isPublicProfilePage()) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ y: 100, opacity: 0, scale: 0.8 }}
        animate={{ 
          y: 0, 
          opacity: 1, 
          scale: 1,
          transition: { type: "spring", damping: 15, stiffness: 300 }
        }}
        exit={{ y: 100, opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleInstall}
        className="fixed bottom-24 md:bottom-10 right-4 md:right-8 z-[100] flex items-center gap-2.5 bg-gradient-to-tr from-[#7C3AED]/90 via-[#8B5CF6]/90 to-[#6366F1]/90 backdrop-blur-xl text-white px-4 py-2.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_15px_rgba(124,58,237,0.3)] border border-white/20 overflow-hidden group min-w-[140px]"
      >
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
        
        {/* Shine Sweep */}
        <motion.div 
          animate={{ x: ['-250%', '500%'] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", repeatDelay: 3 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
        />

        {/* Pulse Aura */}
        <motion.div 
          animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-2xl opacity-20"
        />

        <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-xl relative z-10 border border-white/30 shadow-lg group-hover:rotate-[15deg] group-hover:scale-110 transition-all duration-300">
          <Download size={16} className="stroke-[3.5px] drop-shadow-md text-white" />
        </div>
        
        <div className="flex flex-col items-start leading-tight relative z-10 select-none">
          <span className="font-black text-[10px] md:text-sm uppercase tracking-[0.1em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">INSTALL APP</span>
          <div className="flex items-center gap-1.5">
             <span className="text-[7px] md:text-[9px] opacity-80 font-black uppercase tracking-[0.2em] mt-0.5 text-cyan-200">OFFICIAL PRO</span>
             <motion.div 
               animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="text-[8px] md:text-xs text-yellow-300 font-bold"
             >✨</motion.div>
          </div>
        </div>
      </motion.button>
    </AnimatePresence>
  );
}
