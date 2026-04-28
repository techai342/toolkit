import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Shield, User as UserIcon, Search, Megaphone, Lock, MessageSquare, ExternalLink, CheckCircle, X, Globe, Mail, Send, Share2, Eye, Users, UserPlus, UserCheck, Activity } from 'lucide-react';
import { SocialButton, RenderSocialIcon, GlassSocialIcon } from '../components/SocialIcons';
import { GlowWrapper } from '../components/GlowWrapper';

interface Tool {
  id: string;
  user_id: string;
  name: string;
  slug?: string;
  link_url: string;
  image_url: string;
  category: string;
  created_at: string;
  is_media?: boolean;
  is_locked?: boolean;
  password?: string;
  is_gated?: boolean;
  gate_url?: string;
  gate_text?: string;
  gate_icon?: string;
}

export default function PublicView() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [pageProfile, setPageProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  // Tools State
  const [tools, setTools] = useState<Tool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPopup, setShowPopup] = useState(false);
  
  // Access Control States
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [pwError, setPwError] = useState(false);
  const [isGatingVerified, setIsGatingVerified] = useState(false);

  const handleToolClick = (tool: Tool, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedTool(tool);

    if (tool.is_locked) {
      setPwModalOpen(true);
      setPwError(false);
      setEnteredPassword('');
      return;
    }

    if (tool.is_gated) {
      setGateModalOpen(true);
      setIsGatingVerified(false);
      return;
    }

    // Direct access
    openToolLink(tool);
  };

  const openToolLink = (tool: Tool) => {
    try {
      if (tool.is_media) {
        // Redirect to media download page
        navigate(`/${pageProfile.username}/media/${tool.id}`);
      } else {
        // Open the external link directly
        let targetUrl = tool.link_url.trim();
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
          targetUrl = `https://${targetUrl}`;
        }
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      console.error("Redirection error:", err);
      window.open(tool.link_url, '_blank');
    }
  };

  const verifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTool) return;

    if (enteredPassword === selectedTool.password) {
      setPwModalOpen(false);
      if (selectedTool.is_gated) {
        setGateModalOpen(true);
      } else {
        openToolLink(selectedTool);
      }
    } else {
      setPwError(true);
    }
  };

  const handleToolShare = (e: React.MouseEvent, tool: Tool) => {
    e.stopPropagation();
    const url = `${window.location.origin}/${pageProfile.username}/${tool.slug || tool.name.toLowerCase().replace(/[^a-z0-9_-]/g, '')}`;
    if (navigator.share) {
      navigator.share({
        title: tool.name,
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      window.alert("Link copied!");
    }
  };

  // Add a listener to auto-redirect after clicking the social link and returning to the tab
  useEffect(() => {
    if (isGatingVerified && gateModalOpen) {
      const handleFocus = () => {
        finishGateAction();
      };
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [isGatingVerified, gateModalOpen, selectedTool]);

  const handleGateAction = () => {
    if (!selectedTool?.gate_url) return;
    
    let target = selectedTool.gate_url.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://${target}`;
    }

    // Open verification link in new tab
    window.open(target, '_blank', 'noopener,noreferrer');

    setIsGatingVerified(true);
  };

  const finishGateAction = () => {
    if (selectedTool) {
      const toolToOpen = { ...selectedTool };
      setGateModalOpen(false);
      openToolLink(toolToOpen);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const fetchPageData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();
          
        if (data && !error) {
           setPageProfile(data);
           fetchTools(data.id);
           trackView(data.id);
           checkFollowStatus(data.id);
           
           // Setup popup timing
           if (data.popup_enabled) {
              timer = setTimeout(() => setShowPopup(true), 1500);
           }
        } else {
           setPageProfile(null);
           console.error("Profile fetch error:", error);
        }
      } catch (err) {
        console.error("Unexpected error in fetchPageData:", err);
        setPageProfile(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (username) {
      fetchPageData();
    }

    return () => {
       if (timer) clearTimeout(timer);
    };
  }, [username]);

  const fetchTools = async (userId: string) => {
    const { data, error } = await supabase.from('tools').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (data && !error) setTools(data);
  };

  const getVisitorId = () => {
    const ua = navigator.userAgent;
    const screenInfo = `${window.screen.width}x${window.screen.height}`;
    return btoa(`${ua}-${screenInfo}`);
  };

  const trackView = async (profile_id: string) => {
    const visitorHash = getVisitorId();
    try {
      // 1. Always increment the view count in the database
      await supabase.rpc('increment_profile_views', { profile_row_id: profile_id });

      // 2. record the visitor's visit time in page_visitors (for follow tracking)
      await supabase
        .from('page_visitors')
        .upsert(
          { profile_id, visitor_hash: visitorHash, last_visited: new Date().toISOString() },
          { onConflict: 'profile_id, visitor_hash' }
        );
        
      // Update local state for immediate feedback if possible
      setPageProfile((prev: any) => prev ? ({
        ...prev,
        views_count: (prev.views_count || 0) + 1
      }) : null);
    } catch (err) {
      console.error("Tracking error:", err);
    }
  };

  const checkFollowStatus = async (profileId: string) => {
    const visitorHash = getVisitorId();
    const { data, error } = await supabase
      .from('page_visitors')
      .select('is_following')
      .eq('profile_id', profileId)
      .eq('visitor_hash', visitorHash)
      .maybeSingle(); // Switch to maybeSingle to avoid errors if no record exists
    
    if (data && !error) {
      setIsFollowing(!!data.is_following);
    }
  };

  const toggleFollow = async () => {
    if (!pageProfile || followLoading) return;
    setFollowLoading(true);
    const visitorHash = getVisitorId();
    const newStatus = !isFollowing;

    try {
      const { error } = await supabase
        .from('page_visitors')
        .upsert(
          { 
            profile_id: pageProfile.id, 
            visitor_hash: visitorHash, 
            is_following: newStatus,
            last_visited: new Date().toISOString() 
          },
          { onConflict: 'profile_id, visitor_hash' }
        );

      if (!error) {
        setIsFollowing(newStatus);
        // Increment/Decrement global counter
        await supabase.rpc(newStatus ? 'increment_profile_followers' : 'decrement_profile_followers', { profile_row_id: pageProfile.id });
        
        // Refresh local profile counts
        setPageProfile((prev: any) => ({
          ...prev,
          followers_count: (prev.followers_count || 0) + (newStatus ? 1 : -1)
        }));
      }
    } catch (err) {
      console.error("Follow error:", err);
    } finally {
      setFollowLoading(false);
    }
  };

  // Dynamic Categories based on created tools
  const uniqueCategories = Array.from(new Set(tools.map(t => t.category).filter(Boolean)));
  const displayCategories = ['All', ...uniqueCategories];

  const filteredTools = tools.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  if (loading) return <div className="flex-1 flex items-center justify-center animate-pulse text-purple-400 font-medium tracking-wider">Loading Space...</div>;
  if (!pageProfile) return <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-center"><h1 className="text-4xl font-black text-purple-400">404 SPACE NOT FOUND</h1><p className="text-zinc-400 font-light">The requested user '{username}' does not exist.</p></div>;

  return (
    <div 
      className="flex flex-col min-h-full"
      style={{
        fontFamily: `var(--font-${pageProfile.theme_font_family || 'sans'})`,
        color: pageProfile.theme_text_color || '#F0F0F0'
      }}
    >
      {/* Full Screen Background Wrapper */}
      <div 
        className="fixed inset-0 animate-in fade-in duration-700 pointer-events-none"
        style={{
          backgroundColor: pageProfile.bg_color || '#0A0F1E',
          backgroundImage: pageProfile.bg_image_url ? `url(${pageProfile.bg_image_url})` : (pageProfile.bg_gradient || 'none'),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          zIndex: 0
        }}
      >
        {/* Background Overlay to ensure readability if image is bright */}
        { (pageProfile.bg_image_url || pageProfile.bg_gradient) && (
           <div className="absolute inset-0 bg-[#0A0F1E]/30 backdrop-blur-[2px]"></div>
        )}
      </div>

      <div className="flex flex-col animate-in fade-in duration-700 w-full relative z-10">
        <div className="mb-12 border-b border-white/10 pb-8 flex flex-col md:flex-row items-start justify-between gap-6 relative z-10 w-full max-w-5xl mx-auto overflow-hidden">
         <div className="w-full md:w-auto">
             <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2 flex items-center gap-3 md:gap-4 overflow-hidden">
                <GlowWrapper 
                    enabled={pageProfile.theme_profile_border} 
                    combo={pageProfile.theme_color_combo} 
                    roundedClass="rounded-full"
                    className="shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                >
                    {pageProfile.avatar_url ? (
                       <img src={pageProfile.avatar_url} alt="DP" className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover" />
                    ) : (
                       <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                         <UserIcon className="w-7 h-7 md:w-8 md:h-8 text-purple-300" />
                       </div>
                    )}
                </GlowWrapper>
                <span 
                    className="drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] truncate"
                    style={{ color: pageProfile.theme_username_color || 'transparent', background: !pageProfile.theme_username_color ? 'linear-gradient(to right, #a78bfa, #818cf8)' : 'none', WebkitBackgroundClip: !pageProfile.theme_username_color ? 'text' : 'initial', WebkitTextFillColor: pageProfile.theme_username_color || 'transparent' }}
                >
                  @{pageProfile.username}
                </span>
             </h1>
             <div className="flex items-center gap-3 text-purple-200/60 font-medium text-xs md:text-sm pl-1 md:pl-2">
                <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Verified Creator Space</span>
             </div>

             {pageProfile.description && (
                 <p className="mt-3 pl-1 md:pl-2 text-sm md:text-base max-w-2xl font-light leading-relaxed opacity-90">
                     {pageProfile.description}
                 </p>
             )}

             <div className="flex items-center gap-4 mt-4 pl-1 md:pl-2">
                <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium opacity-80">
                  <Eye className="w-4 h-4 text-purple-400" />
                  <span>{pageProfile.views_count || 0} Views</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs md:text-sm font-medium opacity-80">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>{pageProfile.followers_count || 0} Followers</span>
                </div>
                
                <button 
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={`ml-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                    isFollowing 
                    ? 'bg-white/10 text-white border border-white/20' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]'
                  } disabled:opacity-50`}
                >
                  {followLoading ? (
                    <Activity className="w-3 h-3 animate-spin" />
                  ) : isFollowing ? (
                    <><UserCheck className="w-3 h-3" /> Following</>
                  ) : (
                    <><UserPlus className="w-3 h-3" /> Follow</>
                  )}
                </button>
             </div>

             {pageProfile.phone_number && (
                 <div className="mt-3 pl-1 md:pl-2">
                     <a href={`tel:${pageProfile.phone_number}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors text-sm font-medium">
                         <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                         {pageProfile.phone_number}
                     </a>
                 </div>
             )}

             <div className="flex flex-wrap gap-2 mt-4 pl-1 md:pl-2">
                 {['facebook', 'youtube', 'whatsapp', 'github', 'telegram', 'instagram', 'twitter', 'tiktok'].map(platform => {
                     const url = pageProfile[`social_${platform}`];
                     if (!url) return null;
                     return (
                         <GlowWrapper 
                             key={platform}
                             enabled={pageProfile.theme_social_border} 
                             combo={pageProfile.theme_color_combo} 
                             roundedClass="rounded-full"
                         >
                             <SocialButton platform={platform as any} url={url} />
                         </GlowWrapper>
                     );
                 })}
             </div>
         </div>
      </div>

      {/* Main Tools Container */}
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 relative z-10">
          {/* Search Bar */}
          <GlowWrapper 
              enabled={pageProfile.theme_search_border} 
              combo={pageProfile.theme_color_combo} 
              roundedClass="rounded-2xl"
              className="w-full"
          >
              <div className="relative w-full">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                 <input 
                     type="text" 
                     placeholder="Search tools..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full bg-white/[0.03] backdrop-blur-md border border-white/10 text-white rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-purple-400 focus:bg-white/10 focus:ring-4 focus:ring-purple-500/20 transition-all placeholder-white/40 shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                 />
              </div>
          </GlowWrapper>

          {/* Categories Filter */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              {displayCategories.map(cat => (
                  <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-6 py-2 rounded-xl border text-sm font-medium transition-all backdrop-blur-md ${
                          selectedCategory === cat 
                          ? 'bg-purple-600/80 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.6)]'
                          : 'bg-white/[0.03] border-white/10 text-purple-200/80 hover:border-purple-400/50 hover:bg-white/10'
                      }`}
                  >
                      {cat}
                  </button>
              ))}
          </div>

          {/* Tools Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8 mt-4">
              {filteredTools.map((tool) => (
                  <div key={tool.id} className="flex flex-col items-center group relative">
                      <GlowWrapper 
                          enabled={pageProfile.theme_buttons_border} 
                          combo={pageProfile.theme_color_combo} 
                          roundedClass="rounded-2xl"
                          className="w-full aspect-square shadow-[0_0_20px_rgba(0,0,0,0.5)] cursor-pointer"
                          onClick={(e: React.MouseEvent) => handleToolClick(tool, e)}
                      >
                          <div className="w-full h-full relative rounded-[calc(1rem-2px)] overflow-hidden bg-white/[0.02] backdrop-blur-lg border border-white/10 group-hover:border-purple-400/60 transition-all">
                              <img src={tool.image_url} alt={tool.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              
                              {/* Overlay Indicators */}
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10"></div>
                              
                              <div className="absolute bottom-2 left-2 flex gap-1 z-20">
                                  <button 
                                     onClick={(e) => handleToolShare(e, tool)} 
                                     className="p-1 px-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 text-white hover:text-emerald-300"
                                     title="Share Tool"
                                  >
                                      <Share2 className="w-3 h-3" />
                                  </button>
                                  {tool.is_locked && (
                                      <div className="p-1 px-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-amber-500/30">
                                          <Lock className="w-3 h-3 text-amber-400 shadow-sm" />
                                      </div>
                                  )}
                                  {tool.is_gated && (
                                      <div className="p-1 px-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-pink-500/30">
                                          <MessageSquare className="w-3 h-3 text-pink-400 shadow-sm" />
                                      </div>
                                  )}
                              </div>
                          </div>
                      </GlowWrapper>
                      <div className="mt-3 flex flex-col items-center text-center pointer-events-none">
                          <h3 className="text-sm md:text-[15px] font-bold tracking-tight text-white px-2 line-clamp-1 drop-shadow-md">
                              {tool.name}
                          </h3>
                          {tool.category && (
                             <span className="text-[10px] text-purple-300/70 mt-0.5 uppercase tracking-[0.1em] font-black">{tool.category}</span>
                          )}
                      </div>
                  </div>
              ))}
              
              {filteredTools.length === 0 && (
                  <div className="col-span-full py-16 flex flex-col items-center justify-center text-purple-300/50 text-base font-light border border-dashed border-white/20 rounded-3xl backdrop-blur-sm bg-white/5">
                      {tools.length === 0 ? 'No tools match this category.' : 'No tools match this category.'}
                  </div>
              )}
          </div>
      </div>

       {/* Password Modal */}
       {pwModalOpen && selectedTool && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#030014]/95 backdrop-blur-2xl animate-in fade-in duration-300">
             <div className="relative bg-[#0F0A1F] border border-amber-500/30 p-8 w-full max-w-md shadow-[0_0_80px_rgba(245,158,11,0.2)] rounded-[2.5rem] animate-in zoom-in-95 duration-200">
                <button 
                   onClick={() => setPwModalOpen(false)} 
                   className="absolute top-6 right-6 text-zinc-500 hover:text-white p-2 bg-white/5 rounded-full transition-colors"
                >
                   <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center text-center">
                   <div className="mb-8 relative group">
                      <div className="w-24 h-24 relative">
                         <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-md rounded-2xl border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]" />
                         <div className="relative z-10 flex items-center justify-center w-full h-full">
                            <Lock className="w-12 h-12 text-amber-500 drop-shadow-md" />
                         </div>
                      </div>
                   </div>
                   <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Access Restricted</h2>
                   <p className="text-zinc-400 text-sm mb-8 px-4 font-light">The content <b>{selectedTool.name}</b> is encrypted. Please provide the access key to continue.</p>
                   
                   <form onSubmit={verifyPassword} className="w-full space-y-5">
                      <div className="relative group">
                          <input 
                             autoFocus
                             type="password" 
                             value={enteredPassword}
                             onChange={e => setEnteredPassword(e.target.value)}
                             placeholder="Unlock Code"
                             className={`w-full bg-white/[0.03] border-2 ${pwError ? 'border-red-500/50 focus:border-red-500 bg-red-500/5' : 'border-white/10 focus:border-amber-500/50 focus:bg-white/5'} text-center text-2xl tracking-[0.5em] rounded-3xl px-6 py-5 outline-none transition-all placeholder:text-zinc-600 placeholder:tracking-normal font-mono shadow-inner`}
                          />
                          {pwError && (
                             <div className="absolute -bottom-6 left-0 right-0 animate-in slide-in-from-top-1 duration-200">
                                <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Access Denied: Invalid Key</span>
                             </div>
                          )}
                      </div>
                      <div className="h-4"></div>
                      <button 
                         type="submit" 
                         className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black font-black text-xl py-5 rounded-3xl transition-all shadow-[0_10px_30px_rgba(245,158,11,0.3)] active:scale-[0.97] hover:-translate-y-1"
                      >
                         DECRYPT & UNLOCK
                      </button>
                   </form>
                </div>
             </div>
          </div>
       )}

       {/* Social Gating Modal */}
       {gateModalOpen && selectedTool && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#030014]/95 backdrop-blur-2xl animate-in fade-in duration-300">
             <div className="relative bg-[#0F0A1F] border border-pink-500/30 p-8 w-full max-w-md shadow-[0_0_80px_rgba(236,72,153,0.2)] rounded-[2.5rem] animate-in zoom-in-95 duration-200">
                <button 
                   onClick={() => setGateModalOpen(false)} 
                   className="absolute top-6 right-6 text-zinc-500 hover:text-white p-2 bg-white/5 rounded-full transition-colors"
                >
                   <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center text-center">
                   <div className="mb-8 relative">
                      {selectedTool.gate_icon ? (
                         <GlassSocialIcon platform={selectedTool.gate_icon} className="w-24 h-24" />
                      ) : (
                         <div className="w-24 h-24 bg-gradient-to-br from-pink-500/20 to-purple-500/10 rounded-3xl flex items-center justify-center border border-pink-500/20 shadow-[inset_0_0_20px_rgba(236,72,153,0.1)]">
                            <MessageSquare className="w-12 h-12 text-pink-500" />
                         </div>
                      )}
                      
                      <div className="absolute -bottom-2 -right-2 bg-pink-500 text-white p-1.5 rounded-full border-4 border-[#0F0A1F] shadow-lg animate-bounce">
                         <Lock className="w-3 h-3" />
                      </div>
                   </div>
                   <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Access Locked</h2>
                   <p className="text-zinc-400 text-sm mb-10 px-4 leading-relaxed font-light">To access <b>{selectedTool.name}</b>, please complete the verification below.</p>
                   
                   {!isGatingVerified ? (
                      <button 
                         onClick={handleGateAction}
                         className="w-full group bg-white text-black font-black text-lg py-5 rounded-[2rem] transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4 hover:bg-zinc-100"
                      >
                         <div className="bg-black/5 p-2 rounded-xl group-hover:rotate-12 transition-transform">
                            {selectedTool.gate_icon ? (
                               <RenderSocialIcon platform={selectedTool.gate_icon as any} />
                            ) : (
                               <ExternalLink className="w-6 h-6" />
                            )}
                         </div>
                         <span className="truncate">{selectedTool.gate_text || 'Subscribe to Unlock'}</span>
                      </button>
                   ) : (
                      <div className="w-full space-y-5 animate-in slide-in-from-bottom-6 duration-500">
                         <div className="p-6 bg-green-500/10 border-2 border-green-500/20 rounded-[2rem] flex flex-col items-center gap-3">
                             <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-7 h-7 text-green-400" />
                             </div>
                             <span className="text-green-300 font-black text-lg uppercase tracking-widest">Verification Success</span>
                         </div>
                         <button 
                            onClick={finishGateAction}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black text-2xl py-6 rounded-[2rem] transition-all shadow-[0_15px_40px_rgba(168,85,247,0.4)] hover:shadow-[0_20px_50px_rgba(168,85,247,0.6)] hover:-translate-y-1 active:scale-[0.97]"
                         >
                            CONTINUE TO TOOL
                         </button>
                      </div>
                   )}

                   <button 
                      onClick={() => setGateModalOpen(false)}
                      className="mt-8 text-zinc-500 hover:text-zinc-300 text-sm font-bold uppercase tracking-widest transition-colors"
                   >
                      Skip For Now
                   </button>
                </div>
             </div>
          </div>
       )}

      {/* Marketing Popup */}
      {showPopup && pageProfile?.popup_enabled && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030014]/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className={`relative p-[3px] rounded-[1.7rem] w-full max-w-[400px] shadow-[0_0_50px_rgba(168,85,247,0.15)] group overflow-hidden animate-in zoom-in-95 duration-500`}>
               
               {/* Animated Gradient Background */}
               {pageProfile.popup_border_style !== 'none' && (
                  <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite]">
                     {pageProfile.popup_border_style === 'rgb' && <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_10%,#ef4444_30%,#22c55e_50%,#3b82f6_70%,transparent_90%)]" />}
                     {pageProfile.popup_border_style === 'fire' && <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_20%,#f97316_40%,#eab308_60%,transparent_80%)]" />}
                     {pageProfile.popup_border_style === 'ocean' && <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_20%,#0ea5e9_40%,#3b82f6_60%,transparent_80%)]" />}
                     {pageProfile.popup_border_style === 'purple_cyan' && <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_20%,#a855f7_40%,#06b6d4_60%,transparent_80%)]" />}
                     {pageProfile.popup_border_style === 'toxic' && <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_20%,#84cc16_40%,#bef264_60%,transparent_80%)]" />}
                     {pageProfile.popup_border_style === 'royal' && <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_20%,#eab308_40%,#a855f7_60%,transparent_80%)]" />}
                     {pageProfile.popup_border_style === 'sakura' && <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_20%,#f472b6_40%,#fdf2f8_60%,transparent_80%)]" />}
                     {pageProfile.popup_border_style === 'sunset' && <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_10%,#ef4444_30%,#f97316_50%,#a855f7_70%,transparent_90%)]" />}
                  </div>
               )}

               {/* Inner Content that hides the middle of gradient */}
               <div className="relative bg-[#0A0F1E] rounded-3xl p-6 md:p-8 w-full h-full z-10 flex flex-col items-center text-center">
                   
                   <div className="flex items-center justify-center gap-3 w-full mb-4">
                       {(!pageProfile.popup_icon || pageProfile.popup_icon === 'megaphone') ? (
                           <Megaphone className="w-7 h-7 text-pink-500 shrink-0" fill="currentColor" />
                       ) : (
                           <RenderSocialIcon platform={pageProfile.popup_icon} className="w-7 h-7 text-white shrink-0" />
                       )}
                       <h2 className="text-[22px] sm:text-2xl font-black text-white drop-shadow-sm leading-tight text-left">
                           {pageProfile.popup_title || 'Special Offer'}
                       </h2>
                   </div>
                   
                   <p className="text-zinc-300 text-sm leading-relaxed font-light mb-6">
                       {pageProfile.popup_description || 'Check out my new content and tools!'}
                   </p>
                   
                   <div className="w-full flex justify-center gap-3">
                       {pageProfile.popup_link && (
                           <a 
                               href={pageProfile.popup_link} 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className="flex-1 bg-teal-400 hover:bg-teal-300 active:scale-[0.98] rounded-full text-black font-bold py-3 px-4 transition-all shadow-[0_0_20px_rgba(45,212,191,0.2)] text-center text-sm tracking-wide"
                               onClick={() => setShowPopup(false)}
                           >
                               {pageProfile.popup_button_text || 'Join Now'}
                           </a>
                       )}
                       <button 
                           onClick={() => setShowPopup(false)}
                           className="flex-1 py-3 px-4 rounded-full bg-white/10 hover:bg-white/20 font-medium text-white transition-all text-sm active:scale-[0.98]"
                       >
                           Close
                       </button>
                   </div>
               </div>
           </div>
        </div>
      )}

      </div>
    </div>
  );
}
