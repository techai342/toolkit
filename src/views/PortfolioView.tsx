import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  MessageCircle, 
  Instagram, 
  Facebook, 
  Info, 
  MessageSquare, 
  Quote, 
  LayoutGrid, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Download, 
  Share2,
  CheckCircle2,
  ArrowLeft,
  Music2,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DynamicManifest from '../components/DynamicManifest';

interface PortfolioData {
  id: string;
  title: string;
  description: string;
  main_image_url: string;
  gallery_urls: string[];
  theme_color: string;
  quote?: string;
  profile_id: string;
  slug: string;
  social_whatsapp?: string;
  social_instagram?: string;
  social_tiktok?: string;
  social_facebook?: string;
  whatsapp_greeting?: string;
}

interface Profile {
  username: string;
  display_name: string;
  phone_number?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_tiktok?: string;
}

export default function PortfolioView() {
  const { username, slug } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [username, slug]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // 1. Get Profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (!profileData) return;
      setProfile(profileData);

      // 2. Get Portfolio
      const { data: portData } = await supabase
        .from('portfolios')
        .select('*')
        .eq('profile_id', profileData.id)
        .eq('slug', slug)
        .single();

      if (portData) {
        setPortfolio(portData);
        // Increment views (fire and forget)
        supabase.rpc('increment_portfolio_views', { portfolio_id: portData.id }).then(() => {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const handleShare = async () => {
    if (!portfolio) return;
    try {
      await navigator.share({
        title: portfolio.title,
        text: `Check out my portfolio: ${portfolio.title}`,
        url: window.location.href
      });
    } catch (err) {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const sendWhatsApp = () => {
    const whatsappNumber = portfolio?.social_whatsapp || profile?.phone_number;
    if (!whatsappNumber || (!chatMessage.trim() && !portfolio?.social_whatsapp)) return;
    
    const text = chatMessage.trim() || "Hi! I saw your portfolio.";
    const url = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setChatOpen(false);
    setChatMessage('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Portfolio Not Found</h1>
        <button onClick={() => navigate(`/${username}`)} className="text-blue-500 flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] font-sans text-[#1d1d1f] overflow-x-hidden selection:bg-blue-200">
      <DynamicManifest 
        name={portfolio.title} 
        icon={portfolio.main_image_url} 
        username={username}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .rgb-border-container {
          position: relative;
          padding: 3px;
          border-radius: 43px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.1);
        }
        .rgb-border-container::before {
          content: '';
          position: absolute;
          width: 150%;
          height: 150%;
          background: conic-gradient(#ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
          animation: rotateRGB 4s linear infinite;
          top: -25%; left: -25%;
        }
        @keyframes rotateRGB {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-[100] bg-white/75 backdrop-blur-2xl border-b border-black/5 py-3 px-4 md:px-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate(`/${username}`)} className="flex items-center gap-2 transition-transform active:scale-95">
            <span className="text-lg md:text-xl font-bold tracking-tight text-blue-600">{profile?.display_name || username}</span>
          </button>
          <div className="flex items-center gap-2 md:gap-3">
             {/* WhatsApp */}
             {(portfolio?.social_whatsapp || profile?.phone_number) && (
               <button 
                onClick={() => setChatOpen(true)}
                className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-green-500 hover:scale-110 transition-transform active:scale-95"
               >
                 <MessageCircle size={20} />
               </button>
             )}
             
             {/* Instagram */}
             {(portfolio?.social_instagram || profile?.social_instagram) && (
               <a 
                href={portfolio?.social_instagram || profile?.social_instagram} 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-pink-500 hover:scale-110 transition-transform active:scale-95"
               >
                 <Instagram size={20} />
               </a>
             )}

             {/* Facebook */}
             {(portfolio?.social_facebook || profile?.social_facebook) && (
               <a 
                href={portfolio?.social_facebook || profile?.social_facebook} 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 hover:scale-110 transition-transform active:scale-95"
               >
                 <Facebook size={20} />
               </a>
             )}

             {/* TikTok */}
             {(portfolio?.social_tiktok || profile?.social_tiktok) && (
               <a 
                href={portfolio?.social_tiktok || profile?.social_tiktok} 
                target="_blank" 
                rel="noreferrer" 
                className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-black hover:scale-110 transition-transform active:scale-95"
               >
                 <Music2 size={20} />
               </a>
             )}

             <button onClick={handleShare} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-500 hover:scale-110 transition-transform active:scale-95">
               <Share2 size={20} />
             </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-32">
        <div className="rgb-border-container shadow-2xl">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[40px] p-6 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-16">
            {/* Profile Pic with orbit */}
            <div className="relative p-2 border-2 border-dashed border-blue-500 rounded-full animate-[spin_20s_linear_infinite]">
              <div className="w-44 h-44 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white shadow-xl animate-[spin_20s_linear_infinite_reverse]">
                <img src={portfolio.main_image_url} alt={portfolio.title} className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] uppercase font-heavy tracking-wider">Premium Portfolio</span>
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
              
              <h1 className="text-5xl md:text-7xl font-outfit font-extrabold tracking-tighter mb-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent uppercase">
                {portfolio.title}
              </h1>
              
              <p className="text-xl md:text-2xl font-serif italic text-gray-500 mb-6">{portfolio.description}</p>
              
              <div className="flex flex-wrap gap-3 mb-8 justify-center md:justify-start">
                <button 
                  onClick={() => setChatOpen(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
                >
                  <MessageSquare size={18} /> Message Me
                </button>
              </div>

              {portfolio.quote && (
                <div className="relative py-4 px-6 bg-[#F2F2F7]/50 rounded-2xl border border-white/50 backdrop-blur-md">
                   <Quote className="absolute -top-3 -left-3 text-blue-200" size={32} />
                   <p className="text-gray-600 text-sm italic leading-relaxed">"{portfolio.quote}"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Gallery */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-bold tracking-tight">Recent Work</h3>
              <div className="h-1.5 w-12 bg-blue-600 rounded-full mt-2"></div>
            </div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <LayoutGrid size={14} /> Explore Grid
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {portfolio.gallery_urls.map((url, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => openLightbox(idx)}
                className="group relative aspect-[4/5] rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-2xl transition-all"
              >
                <img src={url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                    <LayoutGrid size={24} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex items-center justify-center"
          >
            <button onClick={() => setLightboxOpen(false)} className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
              <X size={24} />
            </button>
            
            <button onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + portfolio.gallery_urls.length) % portfolio.gallery_urls.length); }} className="absolute left-4 p-3 bg-white/5 rounded-full text-white hover:bg-white/10 transition-colors">
              <ChevronLeft size={32} />
            </button>

            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <img 
                src={portfolio.gallery_urls[currentIndex]} 
                className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl object-contain animate-in zoom-in-95 duration-300"
              />
              <div className="mt-8 flex gap-4">
                 <a 
                   href={portfolio.gallery_urls[currentIndex]} 
                   download 
                   className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-full font-bold shadow-xl shadow-blue-600/30 active:scale-95 transition-all text-sm"
                 >
                   <Download size={18} /> Download
                 </a>
                 <button 
                    onClick={async () => {
                      if (navigator.share) {
                        await navigator.share({ url: portfolio.gallery_urls[currentIndex] });
                      } else {
                        navigator.clipboard.writeText(portfolio.gallery_urls[currentIndex]);
                        alert('Link copied!');
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/10 rounded-full font-bold active:scale-95 transition-all text-sm"
                 >
                   <Share2 size={18} /> Share
                 </button>
              </div>
            </div>

            <button onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % portfolio.gallery_urls.length); }} className="absolute right-4 p-3 bg-white/5 rounded-full text-white hover:bg-white/10 transition-colors">
              <ChevronRight size={32} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {chatOpen && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setChatOpen(false)}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl"
             >
                {/* Header */}
                <div className="bg-[#075e54] p-3 px-4 flex items-center gap-3 text-white shadow-lg">
                   <div className="relative">
                      <img 
                        src={portfolio.main_image_url} 
                        className="w-10 h-10 rounded-full object-cover border border-white/20"
                        alt="Profile"
                      />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075e54] rounded-full"></div>
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="font-bold truncate text-[16px] leading-tight flex items-center gap-1.5">
                       {profile?.display_name || username}
                       <CheckCircle2 size={12} className="text-emerald-400 fill-emerald-400/20" />
                     </h4>
                     <p className="text-[11px] opacity-90 flex items-center gap-1">
                       online
                     </p>
                   </div>
                   <div className="flex items-center gap-4 mr-1">
                      <Phone size={18} className="opacity-80" />
                      <button onClick={() => setChatOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} />
                      </button>
                   </div>
                </div>
                
                {/* Body - WhatsApp Background Pattern */}
                <div 
                  className="p-4 bg-[#e5ddd5] min-h-[300px] max-h-[50vh] overflow-y-auto"
                  style={{
                    backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
                    backgroundBlendMode: 'overlay'
                  }}
                >
                   <div className="flex justify-center mb-4">
                      <span className="bg-[#d1e4f3] text-[10px] font-bold text-gray-500 px-3 py-1 rounded-lg shadow-sm">TODAY</span>
                   </div>

                   <div className="relative bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] text-[14px] leading-relaxed mb-4 animate-in slide-in-from-left-2 duration-300">
                      <div className="absolute top-0 -left-2 w-0 h-0 border-t-[10px] border-t-white border-l-[10px] border-l-transparent"></div>
                      {portfolio.whatsapp_greeting || "Assalam-o-Alaikum! Main Saqib hoon. Aap mujhse yahan baat kar sakte hain."}
                      <p className="text-[9px] text-gray-400 text-right mt-1">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                   </div>
                </div>

                {/* Footer */}
                <div className="p-2.5 bg-[#f0f0f0] flex items-center gap-2">
                   <div className="flex-1 bg-white rounded-full flex items-center px-4 py-2.5 shadow-sm border border-black/5">
                      <input 
                        type="text" 
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type a message"
                        className="flex-1 bg-transparent text-[16px] outline-none placeholder-gray-500"
                        onKeyPress={(e) => e.key === 'Enter' && sendWhatsApp()}
                      />
                   </div>
                   <button 
                     onClick={sendWhatsApp}
                     className="w-12 h-12 bg-[#00a884] text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-all"
                   >
                     <MessageCircle size={24} className="fill-white" />
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
