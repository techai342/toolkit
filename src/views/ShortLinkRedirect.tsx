import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { RenderSocialIcon } from '../components/SocialIcons';
import { Activity, Shield, Link as LinkIcon, ExternalLink, Users, Lock, Youtube, Instagram, MessageSquare, Megaphone, Globe, CheckCircle, Search, Palette, Phone, Music2, Mail, Send, Share2 } from 'lucide-react';

export default function ShortLinkRedirect() {
  const { username, slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [shortLink, setShortLink] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPasswordUnlocked, setIsPasswordUnlocked] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isGated, setIsGated] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasClickedFollow, setHasClickedFollow] = useState(false);
  const [showFollowPopup, setShowFollowPopup] = useState(false);
  const firstLoadRef = useRef(true);

  // Auto-redirect when user returns to the tab after clicking follow
  useEffect(() => {
    if (firstLoadRef.current) {
        firstLoadRef.current = false;
        return;
    }
    if (hasClickedFollow) {
      const handleFocus = () => {
        if (!isRedirecting && shortLink?.target_url) {
            setShowFollowPopup(false);
            startRedirect(shortLink.target_url);
        }
      };
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [hasClickedFollow, isRedirecting, shortLink]);

  const getVisitorId = () => {
    const ua = navigator.userAgent;
    const screenInfo = `${window.screen.width}x${window.screen.height}`;
    return btoa(`${ua}-${screenInfo}`);
  };

  const checkFollowStatus = async (profileId: string) => {
    const visitorHash = getVisitorId();
    const { data, error } = await supabase
      .from('page_visitors')
      .select('is_following')
      .eq('profile_id', profileId)
      .eq('visitor_hash', visitorHash)
      .maybeSingle();
    
    if (data && !error) {
      if (data.is_following) {
        setIsFollowing(true);
        return true;
      }
    }
    return false;
  };

  const handleFollowClick = async () => {
    if (!profile || !shortLink) return;
    
    console.log("HandleFollowClick called. Social URL:", shortLink.gated_social_url);
    
    // Ensure social URL is valid
    let url = shortLink.gated_social_url;
    if (!url) {
      alert("Social link is not configured correctly.");
      return;
    }
    if (!url.startsWith('http')) {
      url = `https://${url}`;
    }
    
    console.log("Opening URL:", url);
    // Open social link in new tab
    window.open(url, '_blank');
    
    // Mark as following in DB
    const visitorHash = getVisitorId();
    await supabase
      .from('page_visitors')
      .upsert(
        { profile_id: profile.id, visitor_hash: visitorHash, is_following: true, last_visited: new Date().toISOString() },
        { onConflict: 'profile_id, visitor_hash' }
      );
    
    setHasClickedFollow(true);
  };

  const startRedirect = (target: string) => {
    setIsRedirecting(true);
    setTimeout(() => {
      let targetUrl = target;
      if (!targetUrl.startsWith('http')) {
        targetUrl = `https://${targetUrl}`;
      }
      window.location.href = targetUrl;
    }, 1500);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === shortLink.password) {
      if (shortLink.is_gated && !isFollowing) {
        setIsPasswordUnlocked(true);
        return;
      }
      setIsUnlocked(true);
      startRedirect(shortLink.target_url);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError || !profileData) {
          setError('Profile not found');
          setLoading(false);
          return;
        }
        setProfile(profileData);

        // 2. Fetch short link
        const { data: linkData, error: linkError } = await supabase
          .from('short_links')
          .select('id, profile_id, slug, target_url, is_locked, password, is_gated, gated_icon, gated_social_url, gated_description, gated_button_text')
          .eq('profile_id', profileData.id)
          .eq('slug', slug)
          .single();

        if (linkError || !linkData) {
          setError('Link not found');
          setLoading(false);
          return;
        }
        
        // Ensure safe defaults for gated fields
        setShortLink({
          ...linkData,
          is_gated: linkData.is_gated ?? false,
          gated_icon: linkData.gated_icon ?? 'Users',
          gated_social_url: linkData.gated_social_url ?? '',
          gated_description: linkData.gated_description ?? '',
          gated_button_text: linkData.gated_button_text ?? 'FOLLOW & UNLOCK'
        });
        setLoading(false);

        // 3. Check for Gated Status
        const followed = await checkFollowStatus(profileData.id);
        
        if (linkData.is_gated) {
          setIsGated(true);
          setLoading(false);
          // Don't auto-redirect, show popup instead
          setTimeout(() => setShowFollowPopup(true), 1200);
          return;
        }

        // 4. Redirect if not locked (will handle gated follow check implicitly by reaching here)
        if (!linkData.is_locked) {
          setIsUnlocked(true);
          startRedirect(linkData.target_url);
        }

      } catch (err) {
        console.error('Redirect error:', err);
        setError('An unexpected error occurred');
        setLoading(false);
      }
    };

    if (username && slug) {
      fetchData();
    }
  }, [username, slug]);

  useEffect(() => {
    if (!loading && profile && !error && isUnlocked) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      let lw = canvas.width = window.innerWidth;
      let lh = canvas.height = window.innerHeight;
      let lcx = lw / 2;
      let lcy = lh / 2;
      
      const particleCount = window.innerWidth < 768 ? 40 : 80;
      const lparticles: any[] = [];
      
      class LParticle {
          index: number;
          angle: number = 0;
          distance: number = 0;
          speed: number = 0;
          size: number = 0;
          opacity: number = 0;
      
          constructor(index: number) {
              this.index = index;
              this.reset();
          }
          reset() {
              const angle = (Math.PI * 2 / particleCount) * this.index;
              this.angle = angle + (Math.random() - 0.5) * 0.5;
              this.distance = 20;
              this.speed = 2 + Math.random() * 5;
              this.size = Math.random() * 2 + 1;
              this.opacity = 1;
          }
          update() {
              this.distance += this.speed;
              this.opacity -= 0.015;
              if (this.distance > Math.max(lw, lh) || this.opacity <= 0) this.reset();
          }
          draw() {
              const x = lcx + Math.cos(this.angle) * this.distance;
              const y = lcy + Math.sin(this.angle) * this.distance;
              ctx!.beginPath();
              ctx!.arc(x, y, this.size, 0, Math.PI * 2);
              ctx!.fillStyle = `rgba(168, 85, 247, ${this.opacity})`;
              ctx!.fill();
          }
      }
      
      for (let i = 0; i < particleCount; i++) {
          lparticles.push(new LParticle(i));
      }
      
      let animationFrameId: number;
      const animate = () => {
          ctx!.fillStyle = '#030014';
          ctx!.fillRect(0, 0, lw, lh);
          lparticles.forEach(p => { p.update(); p.draw(); });
          animationFrameId = requestAnimationFrame(animate);
      }
      animate();
      
      const handleResize = () => {
          lw = canvas.width = window.innerWidth;
          lh = canvas.height = window.innerHeight;
          lcx = lw / 2;
          lcy = lh / 2;
      };
      window.addEventListener('resize', handleResize);
      
      return () => {
          cancelAnimationFrame(animationFrameId);
          window.removeEventListener('resize', handleResize);
      };
    }
  }, [loading, profile, error, isUnlocked]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center space-y-6">
         <Activity className="w-12 h-12 text-purple-500 animate-spin" />
         <p className="text-zinc-500 tracking-[0.2em] font-medium text-xs animate-pulse">INITIATING TUNNEL...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center text-zinc-300 font-sans space-y-6 px-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center shrink-0">
          <Shield className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 uppercase tracking-tighter">LINK ERROR</h1>
        <p className="text-zinc-500 max-w-xs text-sm">{error}</p>
        <button onClick={() => window.history.back()} className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all font-bold text-sm">Go Back</button>
      </div>
    );
  }

  if (!isUnlocked && !loading && !error) {
    if (shortLink.is_locked && !isPasswordUnlocked) {
      return (
        <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-indigo-900/10"></div>
            
            <div className="relative z-10 w-full max-w-md p-8 md:p-10 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_0_100px_rgba(168,85,247,0.1)] flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center mb-6 shadow-pill">
                <Lock className="w-10 h-10 text-amber-500" />
              </div>
              
              <h1 className="text-2xl md:text-3xl font-black mb-2 tracking-tight text-white">LOCKED LINK</h1>
              <p className="text-zinc-500 text-sm mb-8 leading-relaxed">This secure link is protected. Enter the password provided by <span className="text-purple-400 font-bold">@{profile?.username}</span>.</p>
              
              <form onSubmit={handleUnlock} className="w-full space-y-4">
                 <div className="relative group">
                    <input 
                      type="password" 
                      placeholder="Enter link password..." 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full bg-black/40 border ${passwordError ? 'border-red-500' : 'border-white/10'} group-hover:border-purple-500/50 text-white rounded-2xl px-6 py-4 outline-none focus:border-purple-500 transition-all text-center font-bold tracking-[0.2em] placeholder:tracking-normal placeholder:font-medium placeholder:text-zinc-600`}
                      autoFocus
                    />
                    {passwordError && (
                      <p className="text-red-400 text-[10px] font-bold uppercase mt-2 tracking-widest animate-bounce">Access Denied</p>
                    )}
                 </div>
                 
                 <button 
                   type="submit" 
                   className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-black tracking-widest text-sm hover:from-purple-500 hover:to-indigo-500 transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] active:scale-95"
                 >
                   DECRYPT & ACCESS
                 </button>
              </form>
              
              <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold">Encrypted Tunnel Protocol v2.0</p>
            </div>
        </div>
      );
    }

    if (shortLink.is_gated) {
        console.log("Rendering gated popup. ShortLink:", shortLink);
        return (
            <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center p-6">
                <canvas ref={canvasRef} className="absolute inset-0 opacity-20" />
                
                {showFollowPopup && (
                    <div className="relative z-10 w-full max-w-md p-8 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_0_100px_rgba(236,72,153,0.1)] flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-pink-500/10 border border-pink-500/20 rounded-3xl flex items-center justify-center mb-6">
                            <RenderSocialIcon platform={shortLink.gated_icon || 'Users'} size={40} className="text-pink-500" />
                        </div>
                        
                        <h1 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{hasClickedFollow ? (isRedirecting ? 'Redirecting...' : 'Thanks for following!') : 'Follow to Unlock'}</h1>
                        <p className="text-zinc-400 text-sm mb-8">{shortLink.gated_description || `To access this premium link, you first need to follow @${profile?.username} on social media.`}</p>
                        
                        <button 
                            onClick={hasClickedFollow ? () => { setShowFollowPopup(false); startRedirect(shortLink.target_url); } : handleFollowClick}
                            disabled={isRedirecting}
                            className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl font-black tracking-widest text-sm shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isRedirecting ? (
                                <Activity className="w-5 h-5 animate-spin" />
                            ) : (
                                <RenderSocialIcon platform={shortLink.gated_icon || 'Users'} size={20} className="text-white" />
                            )}
                            {hasClickedFollow ? (isRedirecting ? '...' : (shortLink.gated_button_text || 'PROCEED TO LINK')) : (shortLink.gated_button_text || 'FOLLOW & UNLOCK')}
                        </button>
                        
                        <div className="mt-6 flex flex-col items-center gap-1">
                            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-bold">Social Guard Protection Active</span>
                            <div className="flex gap-1">
                                {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-pink-500/20"></div>)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center text-white overflow-hidden font-sans">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      <div className="relative z-10 flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-1000 px-6 box-border">
        <div className="relative">
          <div className="absolute -inset-4 bg-purple-500/30 blur-2xl rounded-full animate-pulse"></div>
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.username} 
              className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-white/20 object-cover shadow-2xl" 
            />
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-white/20 bg-white/5 flex items-center justify-center shadow-2xl">
              <RenderSocialIcon platform={shortLink?.gated_icon || 'Activity'} size={40} className="text-purple-400" />
            </div>
          )}
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-[10px] md:text-sm font-bold uppercase tracking-[0.3em] text-purple-400 animate-pulse">Welcome to</h2>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">{profile?.username || 'Elite Space'}</h1>
          <div className="flex items-center justify-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-[10px] md:text-xs font-medium">
             <LinkIcon className="w-3 h-3" />
             <span>Redirecting to: <span className="text-purple-400 font-bold">{slug}</span></span>
             <ExternalLink className="w-3 h-3 animate-bounce" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-40 md:w-48 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 animate-[loading-bar_1.5s_linear_infinite]" style={{ width: '100%' }}></div>
          </div>
          <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-zinc-600 font-bold">Secure Tunnel Established</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
