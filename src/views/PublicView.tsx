import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, fetchWithUltraCache } from '../lib/supabase';
import { Shield, User as UserIcon, Search, Megaphone, Lock, MessageSquare, ExternalLink, CheckCircle, X, Globe, Mail, Send, Share2, Eye, Users, UserPlus, UserCheck, Activity, FileArchive, Music2, Video, FileCode, FileText, Sparkles, LayoutGrid, List, ArrowRight, Phone, MessageCircle } from 'lucide-react';
import { SiWhatsapp, SiTiktok } from 'react-icons/si';
import { SocialButton, RenderSocialIcon, GlassSocialIcon } from '../components/SocialIcons';
import { GlowWrapper } from '../components/GlowWrapper';
import DynamicManifest from '../components/DynamicManifest';
import { SkeletonProfile } from '../components/SkeletonLoader';

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
  video_urls?: string[];
}

export default function PublicView() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [pageProfile, setPageProfile] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`cached_public_profile_${username}`);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`cached_public_profile_${username}`);
        if (cached) return false;
      } catch {}
    }
    return true;
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  
  // Tools State
  const [tools, setTools] = useState<Tool[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`cached_public_tools_${username}`);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPopup, setShowPopup] = useState(false);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');
  
  // Access Control States
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [pwError, setPwError] = useState(false);
  const [isGatingVerified, setIsGatingVerified] = useState(false);
  
  // Video Modal
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentVideoUrls, setCurrentVideoUrls] = useState<string[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const openVideoModal = (urls: string[]) => {
      setCurrentVideoUrls(urls);
      setCurrentVideoIndex(0);
      setVideoModalOpen(true);
  };

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
        const win = window.open(targetUrl, '_blank', 'noopener,noreferrer');
        if (win) win.focus();
      }
    } catch (err) {
      console.error("Redirection error:", err);
      const win = window.open(tool.link_url, '_blank');
      if (win) win.focus();
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
      if (!username) {
        setLoading(false);
        setPageProfile(null);
        return;
      }

      const cleanUsername = username.trim().replace(/^@/, '');
      if (cleanUsername === 'mradmin' || cleanUsername === 'super-admin' || cleanUsername === 'super-saqib-admin') {
        window.location.replace('/mradmin');
        return;
      }
      if (!pageProfile) {
        setLoading(true);
      }
      try {
        const { data: profileData, error: profileError } = await fetchWithUltraCache<any>(
          `public_profile_${cleanUsername}`,
          () => supabase.from('profiles').select('*').ilike('username', cleanUsername).maybeSingle(),
          60000
        );
          
        if (profileData && !profileError) {
           setPageProfile(profileData);
           
           // Fetch all social data in parallel for 10x faster performance
           await Promise.all([
             fetchTools(profileData.id),
             checkFollowStatus(profileData.id)
           ]);

           // Fire tracking asynchronously in background without delaying initial render
           setTimeout(() => {
             trackView(profileData.id).catch(() => {});
           }, 500);
           
           // Setup popup timing
           if (profileData.popup_enabled) {
              timer = setTimeout(() => setShowPopup(true), 1500);
           }
        } else {
           setPageProfile(null);
           if (profileError && profileError.code !== 'PGRST116') {
             console.warn("Profile fetch notice:", profileError.message || profileError);
           }
        }
      } catch (err: any) {
        console.warn("Unexpected notice in fetchPageData:", err?.message || err);
        setPageProfile(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (username) {
      fetchPageData();
    }

    // REALTIME LISTENERS
    // This allows the page to update instantly when admin changes something
    let profileChannel: any;
    let toolsChannel: any;

    const setupRealtime = async (userId: string) => {
      // 1. Listen for Profile changes
      profileChannel = supabase
        .channel(`profile_changes_${userId}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
          (payload) => {
            console.log('Realtime profile update:', payload.new);
            setPageProfile(payload.new);
          }
        )
        .subscribe();

      // 2. Listen for Tools changes (Sync Tools list instantly)
      toolsChannel = supabase
        .channel(`tools_changes_${userId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tools', filter: `user_id=eq.${userId}` },
          () => {
            console.log('Realtime tools change detected');
            fetchTools(userId);
          }
        )
        .subscribe();
    };

    // If profile is already fetched, setup listeners
    if (pageProfile?.id) {
      setupRealtime(pageProfile.id);
    }

    return () => {
       if (timer) clearTimeout(timer);
       if (profileChannel) supabase.removeChannel(profileChannel);
       if (toolsChannel) supabase.removeChannel(toolsChannel);
    };
  }, [username, pageProfile?.id]);

  const fetchTools = async (userId: string) => {
    const { data, error } = await fetchWithUltraCache<Tool[]>(
      `public_tools_${userId}`,
      () => supabase.from('tools').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      45000
    );
    if (data && !error) {
      setTools(data);
    }
  };

  const getVisitorId = () => {
    const ua = navigator.userAgent;
    const screenInfo = `${window.screen.width}x${window.screen.height}`;
    return btoa(`${ua}-${screenInfo}`);
  };

  const trackView = async (profile_id: string) => {
    const visitorHash = getVisitorId();
    
    let batteryLevel = "unknown";
    let isCharging = "unknown";
    try {
      if ((navigator as any).getBattery) {
        const battery: any = await (navigator as any).getBattery();
        batteryLevel = Math.round(battery.level * 100) + "%";
        isCharging = battery.charging ? "Yes" : "No";
      }
    } catch(e) {}

    let ipAddress = "unknown";
    try {
      const cached = typeof window !== 'undefined' ? sessionStorage.getItem('user_ip') : null;
      if (cached) {
        ipAddress = cached;
      } else {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 800);
        const res = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
        clearTimeout(timeout);
        const data = await res.json();
        if (data?.ip) {
          ipAddress = data.ip;
          sessionStorage.setItem('user_ip', data.ip);
        }
      }
    } catch(e) {}

    const metadata = {
      battery_level: batteryLevel,
      is_charging: isCharging,
      ip_address: ipAddress,
      browser_info: navigator.userAgent,
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      platform: navigator.platform || "unknown",
      language: navigator.language || "unknown"
    };

    try {
      // 1. Always increment the total view count in the database (fast total)
      await supabase.rpc('increment_profile_views', { profile_row_id: profile_id });

      // 2. Record detailed analytics event (time-series for charts)
      await supabase.from('analytics_events').insert({
        profile_id,
        event_type: 'page_view',
        metadata
      });

      // 3. record the visitor's visit time in page_visitors (for follow tracking)
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

  const getMediaIcon = (item: any) => {
    const url = item.link_url?.toLowerCase() || '';
    if (url.match(/\.(zip|rar|7z|tar)$/)) return <FileArchive className="w-12 h-12 text-amber-400" />;
    if (url.match(/\.(mp3|wav|ogg|m4a)$/)) return <Music2 className="w-12 h-12 text-pink-400" />;
    if (url.match(/\.(mp4|webm|mov|avi)$/)) return <Video className="w-12 h-12 text-blue-400" />;
    if (url.match(/\.(pdf|doc|docx|txt|epub)$/)) return <FileText className="w-12 h-12 text-emerald-400" />;
    return <FileCode className="w-12 h-12 text-purple-400" />;
  };

  const isImage = (url: string) => {
    return url?.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp|svg)$/);
  };

  if (loading) return <div className="min-h-full bg-[#030014]"><SkeletonProfile /></div>;
  if (!pageProfile) return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#030014] min-h-screen">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full"></div>
        <div className="w-24 h-24 rounded-3xl border border-white/10 bg-white/5 flex items-center justify-center relative z-10">
          <Shield className="w-12 h-12 text-purple-500/50" />
        </div>
      </div>
      <h1 className="text-4xl font-black text-white mb-2 tracking-tight">404 <span className="text-purple-500">VOID</span></h1>
      <p className="text-zinc-500 font-light max-w-sm">The digital signature '{username}' does not exist in our neural network.</p>
      <Link to="/" className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white font-medium transition-all">
        Return to Core
      </Link>
    </div>
  );

  if (pageProfile.is_banned) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#030014] min-h-screen relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            <Lock className="w-12 h-12 text-rose-500" />
          </div>
        </div>
        <span className="text-xs uppercase tracking-[0.3em] font-mono text-rose-400 font-bold mb-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full">
          Profile Suspended
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
          Account Suspended
        </h1>
        <p className="text-zinc-400 font-light max-w-md text-sm mb-6 leading-relaxed">
          This creator page has been deactivated by Super Administration.
        </p>
        {pageProfile.ban_reason && (
          <div className="max-w-md w-full bg-black/40 border border-rose-500/20 rounded-2xl p-4 text-xs font-mono text-rose-300 mb-8 text-left shadow-inner">
            <span className="text-zinc-500 block uppercase font-bold tracking-wider mb-1">Reason:</span>
            {pageProfile.ban_reason}
          </div>
        )}
        <Link to="/" className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white font-medium text-sm transition-all hover:border-white/20">
          Return to Core
        </Link>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col min-h-full"
      style={{
        fontFamily: `var(--font-${pageProfile.theme_font_family || 'sans'})`,
        color: pageProfile.theme_text_color || '#F0F0F0'
      }}
    >
      <DynamicManifest 
        name={pageProfile.name || pageProfile.username || 'Tool Kit Pro'} 
        icon={pageProfile.avatar_url || 'https://i.pinimg.com/736x/db/5e/0a/db5e0ab846238200926faca796937740.jpg'}
        username={pageProfile.username}
        description={pageProfile.description}
        seoTitle={pageProfile.seo_title}
        seoDescription={pageProfile.seo_description}
        seoKeywords={pageProfile.seo_keywords}
        socialLinks={{
          whatsapp: pageProfile.social_whatsapp ? `https://wa.me/${pageProfile.social_whatsapp.replace(/[^0-9]/g, '')}` : undefined,
          tiktok: pageProfile.social_tiktok,
          youtube: pageProfile.social_youtube,
          instagram: pageProfile.social_instagram,
          telegram: pageProfile.social_telegram,
          facebook: pageProfile.social_facebook,
          twitter: pageProfile.social_twitter,
          github: pageProfile.social_github,
        }}
      />
      {/* Full Screen Background Wrapper */}
      <div 
        className="fixed inset-0 animate-in fade-in duration-700 pointer-events-none"
        style={{
          backgroundColor: pageProfile.bg_color || '#0A0F1E',
          backgroundImage: pageProfile.bg_image_url ? `url(${pageProfile.bg_image_url})` : (pageProfile.bg_gradient || 'none'),
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'scroll',
          transform: 'translateZ(0)',
          willChange: 'transform',
          zIndex: 0
        }}
      >
        {/* Background Overlay to ensure readability if image is bright */}
        { (pageProfile.bg_image_url || pageProfile.bg_gradient) && (
           <div className="absolute inset-0 bg-[#0A0F1E]/30 backdrop-blur-[2px]"></div>
        )}
      </div>

      <div className="flex flex-col animate-in fade-in duration-1000 slide-in-from-bottom-4 w-full relative z-10 pb-32 px-4 sm:px-6">
        <div className="mb-10 sm:mb-12 border-b border-white/10 pb-8 flex flex-col md:flex-row items-start justify-between gap-6 relative z-10 w-full max-w-5xl mx-auto">
         <div className="w-full">
             <div className="relative flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 overflow-hidden">
                <GlowWrapper 
                    enabled={pageProfile.theme_profile_border} 
                    combo={pageProfile.theme_color_combo} 
                    roundedClass="rounded-[2.5rem]"
                    className="shrink-0 shadow-[0_0_30px_rgba(168,85,247,0.3)] group"
                >
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[2.3rem] overflow-hidden bg-black/40 border border-white/10">
                        {pageProfile.avatar_url ? (
                           <img src={pageProfile.avatar_url} alt="DP" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center">
                             <UserIcon className="w-12 h-12 text-purple-300/50" />
                           </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                    </div>
                </GlowWrapper>

                <div className="flex-1 min-w-0 py-2">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-1 sm:mb-2 flex flex-col sm:flex-row items-center gap-2 group cursor-default">
                        <span 
                            className="drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] truncate max-w-full"
                            style={{ 
                              color: pageProfile.theme_username_color || 'white'
                            }}
                        >
                          {pageProfile.username}
                        </span>
                        <div className="hidden sm:flex items-center px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] uppercase tracking-widest text-indigo-400 font-bold h-fit mt-1">
                           <Sparkles className="w-3 h-3 mr-1" />
                           Verified
                        </div>
                    </h1>

                    <div className="flex items-center justify-center sm:justify-start gap-3 text-purple-200/50 font-medium text-xs md:text-sm">
                        <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="truncate">Digital Identity Protocol v1.4</span>
                    </div>

                    {pageProfile.description && (
                        <p className="mt-4 text-sm md:text-base max-w-2xl font-normal leading-relaxed opacity-80 text-zinc-300">
                            {pageProfile.description}
                        </p>
                    )}

                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 mt-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 p-3 sm:p-0 rounded-2xl sm:rounded-none bg-white/5 sm:bg-transparent border border-white/10 sm:border-none">
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white/90">
                            <Eye className="w-4 h-4 text-indigo-400" />
                            <span>{pageProfile.views_count || 0}</span>
                          </div>
                          <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest font-bold">Views</span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 p-3 sm:p-0 rounded-2xl sm:rounded-none bg-white/5 sm:bg-transparent border border-white/10 sm:border-none">
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white/90">
                            <Users className="w-4 h-4 text-emerald-400" />
                            <span>{pageProfile.followers_count || 0}</span>
                          </div>
                          <span className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest font-bold">Fans</span>
                        </div>

                        <button 
                          onClick={toggleFollow}
                          disabled={followLoading}
                          className={`col-span-2 sm:col-span-1 sm:ml-4 px-8 py-3 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
                            isFollowing 
                            ? 'bg-white/10 text-white border border-white/20' 
                            : 'bg-white text-black hover:bg-zinc-200 shadow-[0_10px_20px_rgba(255,255,255,0.1)] active:scale-95'
                          } disabled:opacity-50`}
                        >
                          {followLoading ? (
                            <Activity className="w-4 h-4 animate-spin" />
                          ) : isFollowing ? (
                            <><UserCheck className="w-4 h-4" /> Following</>
                          ) : (
                            <><UserPlus className="w-4 h-4" /> Follow Profile</>
                          )}
                        </button>
                    </div>
                </div>
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

             {/* Featured WhatsApp & TikTok Action Banners */}
             {(pageProfile.social_whatsapp || pageProfile.social_tiktok) && (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pl-1 md:pl-2">
                 {pageProfile.social_whatsapp && (() => {
                   const waNum = pageProfile.social_whatsapp.replace(/[^0-9]/g, '');
                   const waGreeting = pageProfile.whatsapp_greeting || 'Assalam-o-Alaikum! I visited your verified toolkit and would like more information.';
                   const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(waGreeting)}`;
                   return (
                     <a
                       href={waUrl}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600/30 via-green-600/20 to-black/40 border border-emerald-500/40 hover:border-emerald-400 backdrop-blur-md transition-all shadow-[0_0_25px_rgba(37,211,102,0.15)] flex items-center justify-between group hover:scale-[1.01]"
                     >
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-[#25D366] text-black flex items-center justify-center shadow-lg shadow-[#25D366]/20 shrink-0 group-hover:scale-105 transition-transform">
                           <SiWhatsapp size={20} />
                         </div>
                         <div className="text-left">
                           <div className="text-xs font-bold text-white flex items-center gap-1.5">
                             <span>Chat on WhatsApp</span>
                             <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                           </div>
                           <p className="text-[11px] text-zinc-300 line-clamp-1 mt-0.5">
                             {pageProfile.whatsapp_greeting || 'Fast response direct message'}
                           </p>
                         </div>
                       </div>
                       <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
                     </a>
                   );
                 })()}

                 {pageProfile.social_tiktok && (
                   <a
                     href={pageProfile.social_tiktok}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-600/20 via-black/40 to-sky-600/20 border border-pink-500/30 hover:border-pink-400 backdrop-blur-md transition-all shadow-[0_0_25px_rgba(236,72,153,0.15)] flex items-center justify-between group hover:scale-[1.01]"
                   >
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-black text-white border border-white/20 flex items-center justify-center shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                         <SiTiktok size={18} />
                       </div>
                       <div className="text-left">
                         <div className="text-xs font-bold text-white flex items-center gap-1.5">
                           <span>Follow on TikTok</span>
                           <span className="text-[9px] uppercase tracking-wider bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded-md font-mono">Official</span>
                         </div>
                         <p className="text-[11px] text-zinc-300 line-clamp-1 mt-0.5">
                           Exclusive videos & content updates
                         </p>
                       </div>
                     </div>
                     <ArrowRight className="w-4 h-4 text-pink-400 group-hover:translate-x-1 transition-transform shrink-0" />
                   </a>
                 )}
               </div>
             )}
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

          {/* Categories Filter & Layout Switcher */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-2">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full sm:w-auto pb-1">
                 {displayCategories.map(cat => (
                     <button 
                         key={cat}
                         onClick={() => setSelectedCategory(cat)}
                         className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all backdrop-blur-md shrink-0 active:scale-95 ${
                             selectedCategory === cat 
                             ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-[1.02]'
                             : 'bg-white/[0.04] border-white/10 text-zinc-300 hover:border-white/30 hover:bg-white/[0.08]'
                         }`}
                     >
                         {cat}
                     </button>
                 ))}
              </div>

              {/* View Mode Switcher (Grid vs List) */}
              <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/10 shrink-0 self-end sm:self-auto">
                 <button
                    type="button"
                    onClick={() => setViewLayout('grid')}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                       viewLayout === 'grid'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-zinc-400 hover:text-white'
                    }`}
                    title="Grid View"
                 >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden xs:inline">Grid</span>
                 </button>
                 <button
                    type="button"
                    onClick={() => setViewLayout('list')}
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                       viewLayout === 'list'
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-zinc-400 hover:text-white'
                    }`}
                    title="List View"
                 >
                    <List className="w-4 h-4" />
                    <span className="hidden xs:inline">List</span>
                 </button>
              </div>
          </div>

          {/* Tools Rendering (Grid or List View) */}
          {viewLayout === 'list' ? (
            <div className="flex flex-col gap-3 mt-4">
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={(e) => handleToolClick(tool, e)}
                  className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-purple-500/40 backdrop-blur-xl transition-all flex items-center justify-between gap-4 cursor-pointer group shadow-sm hover:shadow-[0_0_25px_rgba(168,85,247,0.15)] transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center">
                      {isImage(tool.image_url || tool.link_url) ? (
                        <img src={tool.image_url} alt={tool.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="p-2">{getMediaIcon(tool)}</div>
                      )}
                    </div>
                    <div className="min-w-0 text-left">
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                        {tool.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {tool.category && (
                          <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                            {tool.category}
                          </span>
                        )}
                        {tool.is_locked && (
                          <span className="text-[10px] text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            <Lock className="w-2.5 h-2.5" /> Locked
                          </span>
                        )}
                        {tool.is_gated && (
                          <span className="text-[10px] text-pink-400 flex items-center gap-1 bg-pink-500/10 px-2 py-0.5 rounded-md border border-pink-500/20">
                            <Sparkles className="w-2.5 h-2.5" /> Gated
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {tool.video_urls && tool.video_urls.length > 0 && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); openVideoModal(tool.video_urls!); }}
                        className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white border border-white/10 text-xs font-semibold flex items-center gap-1 transition-all"
                        title="Preview Video"
                      >
                        <Video className="w-3.5 h-3.5 text-blue-400" />
                        <span className="hidden sm:inline">Demo</span>
                      </button>
                    )}
                    <div className="w-9 h-9 rounded-xl bg-purple-600/20 group-hover:bg-purple-600 text-purple-300 group-hover:text-white flex items-center justify-center transition-all border border-purple-500/30">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredTools.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center text-purple-300/50 text-base font-light border border-dashed border-white/20 rounded-3xl backdrop-blur-sm bg-white/5">
                  No tools match this category.
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 md:gap-8 mt-6">
                {filteredTools.map((tool) => (
                    <div key={tool.id} className="flex flex-col items-center group relative animate-in zoom-in duration-500">
                        <GlowWrapper 
                            enabled={pageProfile.theme_buttons_border} 
                            combo={pageProfile.theme_color_combo} 
                            roundedClass="rounded-[2rem]"
                            className="w-full aspect-square shadow-[0_15px_35px_rgba(0,0,0,0.4)] cursor-pointer active:scale-95 transition-transform"
                            onClick={(e: React.MouseEvent) => handleToolClick(tool, e)}
                        >
                            <div className="w-full h-full relative rounded-[calc(2rem-2px)] overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/10 group-hover:border-white/40 transition-all flex items-center justify-center">
                                {isImage(tool.image_url || tool.link_url) ? (
                                  <img src={tool.image_url} alt={tool.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                  <div className="flex flex-col items-center gap-2 group-hover:scale-110 transition-transform duration-700">
                                     {getMediaIcon(tool)}
                                  </div>
                                )}
                                
                                {/* Overlay Indicator Gradients */}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-20 transition-opacity z-10"></div>
                                
                                <div className="absolute top-3 right-3 flex flex-col gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 duration-300">
                                    <button 
                                       onClick={(e) => handleToolShare(e, tool)} 
                                       className="w-8 h-8 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white hover:text-black transition-all"
                                       title="Share Tool"
                                    >
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                    {tool.is_locked && (
                                       <div className="w-8 h-8 flex items-center justify-center bg-amber-500/20 backdrop-blur-md rounded-full border border-amber-500/40 text-amber-400">
                                          <Lock className="w-4 h-4" />
                                       </div>
                                    )}
                                </div>

                                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
                                    {tool.video_urls && tool.video_urls.length > 0 && (
                                       <button 
                                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); openVideoModal(tool.video_urls!); }}
                                          className="py-1 px-2.5 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white hover:bg-white hover:text-black shadow-lg flex items-center gap-1.5 transition-all text-[10px] font-black uppercase tracking-tighter"
                                        >
                                            <Video className="w-3.5 h-3.5" />
                                            {tool.video_urls.length > 1 ? `${tool.video_urls.length} VIDS` : 'PREVIEW'}
                                        </button>
                                    )}
                                    
                                    {tool.is_gated && (
                                        <div className="ml-auto p-1.5 bg-pink-500/20 backdrop-blur-md rounded-full border border-pink-500/40">
                                            <MessageSquare className="w-3 h-3 text-pink-400 shadow-sm" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </GlowWrapper>
                        <div className="mt-4 flex flex-col items-center text-center pointer-events-none w-full">
                            <h3 className="text-[15px] font-black tracking-tight text-white/90 px-2 line-clamp-1 drop-shadow-md">
                                {tool.name}
                            </h3>
                            {tool.category && (
                               <div className="flex items-center gap-1.5 mt-0.5 opacity-40">
                                  <span className="w-1 h-1 rounded-full bg-indigo-500" />
                                  <span className="text-[9px] text-white uppercase tracking-[0.2em] font-black">{tool.category}</span>
                                </div>
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
          )}
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

      {/* Video Modal */}
      {videoModalOpen && currentVideoUrls.length > 0 && (
         <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300">
            <button 
               onClick={() => setVideoModalOpen(false)} 
               className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white p-2 rounded-full transition-colors z-50 bg-white/5"
            >
               <X className="w-8 h-8" />
            </button>
            <div className="w-full max-w-5xl px-4 flex flex-col items-center">
                <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <video 
                       src={currentVideoUrls[currentVideoIndex]} 
                       controls 
                       autoPlay 
                       className="w-full h-full object-contain"
                    />
                </div>
                {currentVideoUrls.length > 1 && (
                   <div className="flex gap-2.5 mt-6 overflow-x-auto max-w-full pb-4 custom-scrollbar px-2">
                       {currentVideoUrls.map((url, idx) => (
                           <button
                               key={idx}
                               onClick={() => setCurrentVideoIndex(idx)}
                               className={`relative w-24 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${idx === currentVideoIndex ? 'border-purple-500 scale-105 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'border-white/10 opacity-60 hover:opacity-100'}`}
                           >
                               <video src={url} className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                   <Video className="w-4 h-4 text-white opacity-80" />
                               </div>
                           </button>
                       ))}
                   </div>
                )}
            </div>
         </div>
      )}

      {/* Floating Direct WhatsApp Widget */}
      {pageProfile.social_whatsapp && (() => {
        const waNum = pageProfile.social_whatsapp.replace(/[^0-9]/g, '');
        const waGreeting = pageProfile.whatsapp_greeting || 'Assalam-o-Alaikum! I visited your verified toolkit and would like more information.';
        const waUrl = `https://wa.me/${waNum}?text=${encodeURIComponent(waGreeting)}`;
        return (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-black shadow-[0_0_30px_rgba(37,211,102,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group border-2 border-white/30 transform-gpu will-change-transform"
            title={`Chat with ${pageProfile.username} on WhatsApp`}
          >
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0A0F1E] animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0A0F1E]"></span>
            <SiWhatsapp size={26} />
            <span className="absolute right-16 px-3 py-1.5 rounded-xl bg-black/90 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 shadow-xl">
              Chat with {pageProfile.username}
            </span>
          </a>
        );
      })()}

      </div>
    </div>
  );
}
