import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Brain, Bolt, User, AlertCircle, Eye } from 'lucide-react';
import { Chatbot } from './admin-dashboard/types';

export default function ChatbotView() {
  const { admin_username } = useParams();
  const [botConfig, setBotConfig] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ text: string, sender: 'user' | 'bot' | 'error', time: string }[]>([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error: sbError } = await supabase
          .from('chatbots')
          .select('*')
          .eq('admin_username', admin_username)
          .limit(1)
          .maybeSingle();

        if (sbError || !data) {
          console.error("Supabase Error:", sbError);
          setError('Chatbot not found or inactive.');
        } else {
          setBotConfig(data);
          try {
            await supabase.rpc('increment_chatbot_views', { bot_id: data.id });
          } catch (e) {}

          setMessages([{
            text: `⚡ Connected to GPT Worker API. Ask me anything!`,
            sender: 'bot',
            time: 'SYS::READY',
          }]);
        }
      } catch (err) {
        setError('Failed to load chatbot config.');
      } finally {
        setLoading(false);
      }
    };
    if (admin_username) fetchConfig();
  }, [admin_username]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isWaiting]);

  const getTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleSendMessage = async () => {
    const message = input.trim();
    if (!message || isWaiting) return;

    setInput('');
    setIsWaiting(true);

    const userTime = getTime();
    setMessages((prev) => [...prev, { text: message, sender: 'user', time: `USER:: ${userTime}` }]);

    try {
      const url = `https://chat-gpt.fak-official.workers.dev/?q=${encodeURIComponent(message)}`;
      const response = await fetch(url);
      
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      
      const contentType = response.headers.get('content-type');
      let botReply;
      
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        botReply = data.response || data.reply || data.answer || data.text || data.message || JSON.stringify(data);
      } else {
        botReply = await response.text();
      }

      setMessages((prev) => [...prev, { text: botReply, sender: 'bot', time: `AI:: ${getTime()}` }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, { text: `❌ Error: ${err.message}`, sender: 'error', time: `SYS::ERROR` }]);
    } finally {
      setIsWaiting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white font-['Rajdhani']">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Brain className="w-12 h-12 text-cyan-400" />
          <h2 className="text-xl font-bold tracking-widest text-cyan-400 font-['Orbitron']">INITIALIZING NEURAL LINK...</h2>
        </div>
      </div>
    );
  }

  if (error || !botConfig) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white font-['Rajdhani']">
        <div className="bg-red-500/10 border border-red-500/50 p-8 rounded-2xl max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2 font-['Orbitron']">SYSTEM OFFLINE</h2>
          <p className="text-zinc-400">{error || "Chatbot not found."}</p>
        </div>
      </div>
    );
  }

  const themeColor = botConfig.theme_color || '#ff2d75';
  const neonBlue = '#00d4ff';
  const neonPurple = '#b829ea';

  return (
    <div 
      className="min-h-screen w-full bg-[#0a0a0f] text-white font-['Rajdhani'] flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed"
      style={botConfig.bg_image_url ? { backgroundImage: `url(${botConfig.bg_image_url})` } : {}}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;600&display=swap');
        
        .chat-container-glass {
          background: rgba(20, 20, 35, 0.8);
          backdrop-filter: blur(20px);
          box-shadow: 0 0 40px rgba(0, 212, 255, 0.1), 0 0 80px ${themeColor}22;
          border: 1px solid rgba(0, 212, 255, 0.2);
        }
        .message-bot {
          background: linear-gradient(135deg, ${themeColor}22, rgba(0, 212, 255, 0.1));
          border: 1px solid ${themeColor}33;
        }
        .message-user {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(184, 41, 234, 0.2));
          border: 1px solid rgba(0, 212, 255, 0.3);
        }
        .typing-dot {
          animation: neonTyping 1.2s infinite;
        }
        .typing-dot:nth-child(1) { background: ${themeColor}; box-shadow: 0 0 10px ${themeColor}; animation-delay: 0s; }
        .typing-dot:nth-child(2) { background: ${neonBlue}; box-shadow: 0 0 10px ${neonBlue}; animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { background: ${neonPurple}; box-shadow: 0 0 10px ${neonPurple}; animation-delay: 0.4s; }
        
        @keyframes neonTyping {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-8px); opacity: 1; }
        }
        
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .online-dot { animation: pulse-dot 2s infinite; }
      `}</style>

      {/* Grid overlay */}
      {!botConfig.bg_image_url && (
         <div className="absolute inset-0 pointer-events-none z-0" style={{
           backgroundImage: `linear-gradient(rgba(0, 212, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.05) 1px, transparent 1px)`,
           backgroundSize: '50px 50px'
         }}></div>
      )}
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none"></div>

      {/* Main Container */}
      <div className="w-full max-w-3xl h-[100dvh] md:h-[85vh] md:rounded-[30px] flex flex-col z-10 chat-container-glass overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-[#0a0a14]/90 px-6 py-5 border-b border-[#00d4ff]/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden shrink-0"
              style={{ background: `linear-gradient(135deg, ${neonPurple}, ${themeColor})`, boxShadow: `0 0 20px ${themeColor}88` }}
            >
              {botConfig.bot_avatar ? (
                <img src={botConfig.bot_avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <Brain className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h2 className="font-['Orbitron'] text-xl md:text-2xl font-bold uppercase" style={{
                background: `linear-gradient(45deg, ${neonBlue}, ${themeColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {botConfig.bot_name || 'NEURAL AI // v2.0'}
              </h2>
              <p className="text-[#39ff14] text-xs md:text-sm flex items-center gap-2 font-medium">
                <span className="w-2.5 h-2.5 bg-[#39ff14] rounded-full online-dot shadow-[0_0_8px_#39ff14]"></span>
                API Connected
              </p>
            </div>
          </div>
          {botConfig.admin_name && (
             <div className="hidden md:flex text-xs font-['Orbitron'] text-white/50 items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 uppercase">
                <User className="w-3.5 h-3.5" />
                BY {botConfig.admin_name}
             </div>
          )}
        </div>

        {/* Chat Box */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-5 bg-[#05050f]/60" style={{ scrollbarWidth: 'thin', scrollbarColor: `${neonPurple} transparent` }}>
          {botConfig.name && (
            <div className="text-center w-full mb-2">
               <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-['Orbitron'] tracking-widest uppercase">
                  {botConfig.name}
               </span>
            </div>
          )}
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl text-sm md:text-base font-medium break-words whitespace-pre-wrap leading-relaxed animate-in slide-in-from-bottom-4 fade-in duration-300 ${
                msg.sender === 'user' ? 'self-end message-user rounded-br-sm' : 
                msg.sender === 'error' ? 'self-center bg-red-500/10 border-red-500/30 text-red-400' :
                'self-start message-bot rounded-bl-sm'
              }`}
            >
              {msg.text}
              <div className={`text-[9px] md:text-[10px] font-['Orbitron'] mt-2 opacity-60 ${msg.sender === 'user' ? 'text-right text-[#00d4ff]' : 'text-left text-[#ff2d75]'}`}>
                {msg.time}
              </div>
            </div>
          ))}

          {isWaiting && (
            <div className="self-start message-bot rounded-2xl rounded-bl-sm py-4 px-5 flex items-center gap-2 border border-[#ff2d75]/20 animate-in fade-in">
               <div className="typing-dot w-2 h-2 rounded-full"></div>
               <div className="typing-dot w-2 h-2 rounded-full"></div>
               <div className="typing-dot w-2 h-2 rounded-full"></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-[#0a0a14]/90 p-4 md:p-6 border-t border-[#00d4ff]/20 flex gap-3 shrink-0 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isWaiting}
            placeholder="> Type your message..."
            className="flex-1 bg-[#141428]/80 border-2 border-[#00d4ff]/30 rounded-full px-5 py-3.5 md:py-4 text-white text-sm md:text-base outline-none transition-all placeholder:text-white/30 focus:border-[#ff2d75] focus:shadow-[0_0_20px_rgba(255,45,117,0.2)] disabled:opacity-50 font-['Rajdhani']"
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isWaiting}
            className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full flex items-center justify-center text-white disabled:opacity-50 transition-all hover:scale-110 active:scale-95 disabled:hover:scale-100"
            style={{ background: `linear-gradient(135deg, ${themeColor}, ${neonPurple})`, boxShadow: input.trim() ? `0 0 20px ${themeColor}66` : 'none' }}
          >
            <Bolt className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* View count indicator */}
        {botConfig.views_count > 0 && (
           <div className="absolute top-4 right-4 hidden md:flex items-center gap-1.5 text-xs text-white/40 font-['Orbitron'] bg-black/40 px-3 py-1 rounded-full border border-white/5">
             <Eye className="w-3.5 h-3.5" />
             {botConfig.views_count.toLocaleString()}
           </div>
        )}
      </div>
    </div>
  );
}
