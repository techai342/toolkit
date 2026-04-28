import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Download, Share2, Heart, ArrowLeft, Star, Shield, Info, Check, ExternalLink, File, Lock, MessageSquare, CheckCircle, X } from 'lucide-react';
import { SocialButton, RenderSocialIcon, GlassSocialIcon } from '../components/SocialIcons';

export default function MediaDownload() {
  const { username, toolId, filename } = useParams();
  const [tool, setTool] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loaderVisible, setLoaderVisible] = useState(true);
  
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState('');
  
  // Interaction States
  const [hasWishlisted, setHasWishlisted] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Access Control States
  const [gateModalOpen, setGateModalOpen] = useState(false);
  const [isGatingVerified, setIsGatingVerified] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('username', username).single();
        if(profileData) {
           setProfile(profileData);
        }
        
        const { data: toolData } = await supabase.from('tools').select('*').eq('id', toolId).single();
        if (toolData) {
          setTool(toolData);
          setHasWishlisted(localStorage.getItem(`wishlist_${toolData.id}`) === 'true');
          setHasRated(localStorage.getItem(`rated_${toolData.id}`) === 'true');
        }
      } catch (e) {
        console.error("fetchData error:", e);
      } finally {
        setLoading(false);
      }
    };
    if (username && toolId) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [username, toolId]);

  useEffect(() => {
    if (!loading && tool) {
      // Auto-start download if query param 'direct' is present
      const params = new URLSearchParams(window.location.search);
      if (params.get('direct') === 'true') {
        const timer = setTimeout(() => {
          initiateDownload();
        }, 3000); // Wait for loader animation
        return () => clearTimeout(timer);
      }
    }
  }, [loading, tool]);

  useEffect(() => {
    if (!loading && tool) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      let lw = canvas.width = window.innerWidth;
      let lh = canvas.height = window.innerHeight;
      let lcx = lw / 2;
      let lcy = lh / 2;
      
      const particleCount = 100;
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
              this.distance = 50;
              this.speed = 1 + Math.random() * 4;
              this.size = Math.random() * 2 + 0.5;
              this.opacity = 0.2 + Math.random() * 0.6;
          }
          update() {
              this.distance += this.speed;
              this.opacity -= 0.01;
              if (this.distance > Math.max(lw, lh) || this.opacity <= 0) this.reset();
          }
          draw() {
              const x = lcx + Math.cos(this.angle) * this.distance;
              const y = lcy + Math.sin(this.angle) * this.distance;
              ctx!.beginPath();
              ctx!.arc(x, y, this.size, 0, Math.PI * 2);
              ctx!.fillStyle = `rgba(168, 85, 247, ${this.opacity})`; // Purple particles
              ctx!.fill();
          }
      }
      
      for (let i = 0; i < particleCount; i++) {
          lparticles.push(new LParticle(i));
      }
      
      let animationFrameId: number;
      const animateLoader = () => {
          ctx!.fillStyle = '#030014';
          ctx!.fillRect(0, 0, lw, lh);
          lparticles.forEach(p => { p.update(); p.draw(); });
          animationFrameId = requestAnimationFrame(animateLoader);
      }
      animateLoader();
      
      const handleResize = () => {
          lw = canvas.width = window.innerWidth;
          lh = canvas.height = window.innerHeight;
          lcx = lw / 2;
          lcy = lh / 2;
      };
      window.addEventListener('resize', handleResize);
      
      const timer = setTimeout(() => {
          setLoaderVisible(false);
          cancelAnimationFrame(animationFrameId);
      }, 2500);
      
      return () => {
          cancelAnimationFrame(animationFrameId);
          window.removeEventListener('resize', handleResize);
          clearTimeout(timer);
      };
    }
  }, [loading, tool]);

  const initiateDownload = async () => {
     if (!tool) return;
     
     if (!tool.is_media) {
         let targetUrl = tool.link_url.trim();
         if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
             targetUrl = `https://${targetUrl}`;
         }
         window.open(targetUrl, '_blank', 'noopener,noreferrer');
         return;
     }

     setDownloading(true);
     setProgress(0);
     setDownloadStatus('Connecting to secure server...');
     
     // Increment downloads count in BG
     const newCount = (tool.downloads_count || 0) + 1;
     setTool((prev: any) => ({ ...prev, downloads_count: newCount }));
     supabase.from('tools').update({ downloads_count: newCount }).eq('id', tool.id).then();
     
     const mediaUrl = tool.link_url;

     // Detect if it's Cloudinary
     if (mediaUrl.includes('cloudinary.com') || mediaUrl.includes('res.cloudinary.com')) {
         setDownloadStatus('Downloading...');
         try {
             const response = await fetch(mediaUrl);
             const blob = await response.blob();
             const url = window.URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             a.download = filename || tool.name || 'download';
             document.body.appendChild(a);
             a.click();
             window.URL.revokeObjectURL(url);
             document.body.removeChild(a);
             setProgress(100);
             setDownloadStatus('Downloaded');
             setDownloading(false);
         } catch (err) {
             console.error("Cloudinary download error:", err);
             // Fallback to opening in new tab
             window.open(mediaUrl, '_blank', 'noopener,noreferrer');
             setDownloadStatus('Opened in new tab');
             setProgress(100);
             setDownloading(false);
         }
         return;
     }

     // Fallback to Mediafire
     setDownloadStatus('Connecting to Mediafire server...');
     const mediafireUrl = mediaUrl;
     const apiUrl = `https://backend1.tioo.eu.org/api/downloader/mediafire?url=${encodeURIComponent(mediafireUrl)}`;
     
     const fakeLoader = setInterval(() => {
         setProgress(prev => {
             const next = prev + Math.random() * 12;
             return next > 98 ? 98 : next;
         });
     }, 150);
     
     try {
         const response = await fetch(apiUrl);
         
         if (!response.ok) {
             throw new Error(`HTTP error! status: ${response.status}`);
         }
         
         const data = await response.json();
         let downloadUrl = data.status === true && data.data ? data.data.url : data.url;
         
         if (downloadUrl) {
             clearInterval(fakeLoader);
             setProgress(100);
             setDownloadStatus('Ready!');
             setTimeout(() => {
                 window.location.href = downloadUrl;
                 setDownloadStatus('Downloaded');
                 setDownloading(false);
             }, 800);
         } else {
             console.error("Mediafire data:", data);
             if (window.confirm("Mediafire link error or API down. Try opening it directly in a new tab?")) {
                window.open(mediafireUrl, '_blank', 'noopener,noreferrer');
             }
             setDownloading(false);
             clearInterval(fakeLoader);
         }
     } catch (err) {
         console.error("Download fetch error:", err);
         if (window.confirm("Network error or MediaFire link issue. Try opening directly in a new tab?")) {
             window.open(mediafireUrl, '_blank', 'noopener,noreferrer');
         }
         setDownloading(false);
         clearInterval(fakeLoader);
     }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: tool.name,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWishlist = async () => {
    if (hasWishlisted || !tool) return;
    const newCount = (tool.wishlist_count || 0) + 1;
    setTool((prev: any) => ({ ...prev, wishlist_count: newCount }));
    setHasWishlisted(true);
    localStorage.setItem(`wishlist_${tool.id}`, 'true');
    await supabase.from('tools').update({ wishlist_count: newCount }).eq('id', tool.id);
  };

  const handleRate = async (stars: number) => {
    if (hasRated || !tool) return;
    const newScore = (tool.total_rating_score || 0) + stars;
    const newCount = (tool.ratings_count || 0) + 1;
    setTool((prev: any) => ({ ...prev, total_rating_score: newScore, ratings_count: newCount }));
    setHasRated(true);
    setShowRating(false);
    localStorage.setItem(`rated_${tool.id}`, 'true');
    await supabase.from('tools').update({ total_rating_score: newScore, ratings_count: newCount }).eq('id', tool.id);
  };

  const handleActionClick = () => {
    if (tool.is_gated) {
        setGateModalOpen(true);
        setIsGatingVerified(false);
    } else {
        initiateDownload();
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
  }, [isGatingVerified, gateModalOpen, tool]);

  const handleGateAction = () => {
    if (!tool?.gate_url) return;
    
    let target = tool.gate_url.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://${target}`;
    }

    // Open verification link in new tab
    window.open(target, '_blank', 'noopener,noreferrer');

    setIsGatingVerified(true);
  };

  const finishGateAction = () => {
    if (tool) {
      setGateModalOpen(false);
      initiateDownload();
    }
  };

  if (loading) {
      return (
        <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center text-zinc-300 font-sans space-y-4">
           <div className="w-16 h-16 border-t-2 border-purple-500 rounded-full animate-spin"></div>
           <p className="text-zinc-500">Loading media details...</p>
        </div>
      );
  }
  
  if (!tool) {
     return <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center text-zinc-300 font-sans space-y-4">
        <h1 className="text-4xl font-black text-purple-400">404 RESOURCE NOT FOUND</h1>
        <p className="text-zinc-500">This media item does not exist.</p>
        <Link to={`/${username}`} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">Go Back</Link>
     </div>;
  }
  
  const averageRating = tool.ratings_count > 0 
      ? (tool.total_rating_score / tool.ratings_count).toFixed(1) 
      : '0.0';

  return (
    <div className="bg-[#030014] min-h-[100dvh] text-[#F0F0F0] font-sans relative pb-20 w-full">
      
      {/* Background Animated Gradients / Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-700/20 blur-[120px] -z-10 animate-pulse mix-blend-screen pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[30%] h-[30%] rounded-full bg-indigo-600/20 blur-[100px] -z-10 mix-blend-screen pointer-events-none"></div>
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-[-5]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      
      <div className="relative z-10 max-w-2xl mx-auto flex flex-col min-h-screen">
          
          <nav className="p-4 sm:p-6 flex items-center justify-between relative z-20">
              <Link to={`/${username}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 group-hover:border-purple-400/50 transition-all shadow-sm group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                     <ArrowLeft className="w-5 h-5" />
                  </div>
              </Link>
          </nav>
          
          <main className="flex-1 flex flex-col px-6 py-6 sm:py-10">
              <div className="flex flex-col items-center flex-1">
                  {/* Hero Section */}
                  <div className="relative group mb-8">
                      <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-indigo-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full"></div>
                      {tool.image_url && tool.image_url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
                         <img src={tool.image_url} alt={tool.name} className="relative w-40 h-40 sm:w-48 sm:h-48 object-cover rounded-3xl border border-white/10 shadow-2xl" />
                      ) : tool.image_url && tool.image_url.match(/\.(mp4|webm|mov)$/i) ? (
                         <video src={tool.image_url} controls className="relative w-40 h-40 sm:w-48 sm:h-48 object-cover rounded-3xl border border-white/10 shadow-2xl" />
                      ) : (
                         <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-3xl border border-white/10 shadow-2xl flex items-center justify-center bg-white/5">
                            <File className="w-16 h-16 text-zinc-600" />
                         </div>
                      )}
                  </div>
                  
                  <div className="text-center space-y-3 mb-10 w-full relative">
                      <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400 tracking-tight">{tool.name}</h1>
                      <p className="text-purple-300 font-medium tracking-wide flex items-center justify-center gap-2">
                         <Shield className="w-4 h-4 text-indigo-400" />
                         {profile?.username ? `@${profile.username}` : 'Elite Space'}
                      </p>

                      {profile && (
                          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                             {profile.social_facebook && <SocialButton platform="facebook" url={profile.social_facebook} />}
                             {profile.social_youtube && <SocialButton platform="youtube" url={profile.social_youtube} />}
                             {profile.social_whatsapp && <SocialButton platform="whatsapp" url={profile.social_whatsapp} />}
                             {profile.social_github && <SocialButton platform="github" url={profile.social_github} />}
                             {profile.social_telegram && <SocialButton platform="telegram" url={profile.social_telegram} />}
                             {profile.social_instagram && <SocialButton platform="instagram" url={profile.social_instagram} />}
                             {profile.social_twitter && <SocialButton platform="twitter" url={profile.social_twitter} />}
                             {profile.social_tiktok && <SocialButton platform="tiktok" url={profile.social_tiktok} />}
                          </div>
                      )}
                      
                      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 opacity-80">
                          <button onClick={() => !hasRated && setShowRating(!showRating)} className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:bg-white/10 transition-colors">
                             <Star className={`w-4 h-4 ${hasRated ? 'text-amber-400 fill-amber-400' : 'text-amber-400'}`} />
                             <span>{averageRating}</span>
                          </button>
                          {tool.is_media && (
                             <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                <Download className="w-4 h-4 text-purple-400" />
                                <span>{tool.downloads_count > 0 ? tool.downloads_count.toLocaleString() : 'New'} Downloads</span>
                             </div>
                          )}
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                             <Info className="w-4 h-4 text-indigo-400" />
                             <span className="capitalize">{tool.category || 'Media'}</span>
                          </div>
                      </div>

                      {/* Interactive Rating Popup */}
                      {showRating && !hasRated && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-[#0a0a0a] border border-white/10 p-4 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.2)] z-30 flex flex-col items-center animate-in slide-in-from-top-2">
                              <p className="text-xs text-zinc-400 mb-3">Rate this tool</p>
                              <div className="flex items-center gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                      <button key={star} onClick={() => handleRate(star)} className="p-1 hover:scale-125 transition-transform group/star">
                                          <Star className="w-6 h-6 text-zinc-600 group-hover/star:text-amber-400 group-hover/star:fill-amber-400 transition-colors" />
                                      </button>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
                  
                  {/* Action Section */}
                  <div className="w-full max-w-sm space-y-4">
                      {downloading ? (
                          <div className="bg-white/[0.03] backdrop-blur-md p-5 rounded-2xl border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col gap-4">
                              <div className="flex justify-between items-center text-sm font-medium px-1">
                                  <span className="text-zinc-300 animate-pulse">{downloadStatus}</span>
                                  <span className="text-purple-300">{Math.floor(progress)}%</span>
                              </div>
                              <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-200 relative overflow-hidden" style={{ width: `${progress}%` }}>
                                      <div className="absolute inset-0 bg-white/20 animate-[shimmer_1s_infinite] w-full" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <button onClick={handleActionClick} className="w-full relative group overflow-hidden rounded-2xl p-0.5 bg-gradient-to-b from-purple-500/50 to-indigo-600/50 hover:from-purple-400 hover:to-indigo-500 transition-all shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.5)]">
                              <div className="relative bg-black/40 backdrop-blur-sm rounded-[14px] px-6 py-4 flex items-center justify-center gap-3">
                                  {tool.is_media ? <Download className="w-5 h-5 text-white" /> : <ExternalLink className="w-5 h-5 text-white" />}
                                  <span className="font-bold text-base tracking-wide text-white">{tool.is_media ? "Download Media" : "Open Tool"}</span>
                              </div>
                          </button>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3 pt-2">
                          <button 
                            onClick={handleWishlist}
                            disabled={hasWishlisted}
                            className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                                hasWishlisted 
                                ? 'border-pink-500/30 bg-pink-500/10 text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                                : 'border-white/10 hover:border-pink-500/30 bg-white/[0.02] hover:bg-pink-500/10 text-zinc-400 hover:text-white'
                            }`}
                          >
                             <Heart className={`w-4 h-4 ${hasWishlisted ? 'fill-pink-500 text-pink-500' : ''}`} />
                             {hasWishlisted ? 'Added to Wishlist' : 'Wishlist'} 
                             {tool.wishlist_count > 0 && <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded-full">{tool.wishlist_count}</span>}
                          </button>
                          <button 
                             onClick={handleShare}
                             className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                                 copied
                                 ? 'border-green-500/30 bg-green-500/10 text-green-400'
                                 : 'border-white/10 hover:border-indigo-500/30 bg-white/[0.02] hover:bg-indigo-500/10 text-zinc-400 hover:text-white'
                             }`}
                          >
                             {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                             {copied ? 'Copied Link!' : 'Share'}
                          </button>
                      </div>
                  </div>
              </div>
          </main>
      </div>
    </div>
  );
}

