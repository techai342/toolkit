import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { TikTokDownloader } from './admin-dashboard/types';
import { Download, Video, Music, Film, Loader2, Play, UserCircle, RotateCcw, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function TikTokDownloaderView() {
  const { admin_username } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<TikTokDownloader | null>(null);
  
  const [videoUrl, setVideoUrl] = useState('');
  const [fetching, setFetching] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const { data, error: sbError } = await supabase
          .from('tiktok_downloaders')
          .select('*')
          .eq('admin_username', admin_username)
          .limit(1)
          .maybeSingle();

        if (sbError || !data) {
          console.error("Supabase Error:", sbError);
          setError('TikTok Downloader not found.');
        } else {
          setConfig(data);
          // Increment views
          await supabase.rpc('increment_tiktok_downloader_views', { downloader_id: data.id });
        }
      } catch (err) {
        setError('An error occurred while loading the tool.');
      } finally {
        setLoading(false);
      }
    }

    if (admin_username) {
      fetchConfig();
    }
  }, [admin_username]);

  const handleFetch = async () => {
    if (!videoUrl) return;
    setFetching(true);
    setVideoData(null);
    setError(null);

    try {
      const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`);
      const result = await response.json();

      if (result.code === 0 && result.data) {
        setVideoData(result.data);
      } else {
        setError(result.msg || "Video not found. Please check the link.");
      }
    } catch (err) {
      setError("Network error! Could not connect to API.");
    } finally {
      setFetching(false);
    }
  };

  const handleDownload = async (type: string, url: string) => {
    if (!url) return;
    setDownloadingType(type);

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      
      const ext = type === 'music' ? 'mp3' : 'mp4';
      const fileName = (videoData?.title || 'tiktok_video').substring(0, 30).replace(/[^a-z0-9]/gi, '_');
      a.download = `${fileName}_${type}.${ext}`;
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (e) {
      console.error("Download failed", e);
      window.open(url, '_blank');
    } finally {
      setDownloadingType(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  const themeColor = config?.theme_color || '#4facfe';

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center py-12 px-4 selection:bg-blue-500/30">
      <div 
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: config?.bg_image_url ? `url(${config.bg_image_url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(100px)'
        }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black mb-3 tracking-tight"
          >
            TikTok <span style={{ color: themeColor }}>Downloader</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400"
          >
            Download TikTok videos without watermark in HD
          </motion.p>
        </div>

        {/* Input Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] shadow-2xl mb-8"
        >
          <div className="flex flex-col md:flex-row gap-3">
            <input 
              type="text" 
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste TikTok video link here..." 
              className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 transition-all text-white placeholder-zinc-600"
              style={{ '--tw-ring-color': themeColor } as React.CSSProperties}
            />
            <button 
              onClick={handleFetch}
              disabled={fetching || !videoUrl}
              className="px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
              style={{ backgroundColor: themeColor }}
            >
              {fetching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Get Video</>
              )}
            </button>
          </div>

          {error && videoUrl && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm text-center flex items-center justify-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </motion.div>

        {/* Results Container */}
        <AnimatePresence>
          {videoData && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] shadow-2xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Thumbnail */}
                <div className="relative group overflow-hidden rounded-2xl aspect-[9/16] bg-black/20">
                  <img 
                    src={videoData.cover} 
                    alt="Thumbnail" 
                    className="w-full h-full object-cover transform transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                     <Play className="w-12 h-12 text-white fill-current" />
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold line-clamp-3 mb-3 leading-tight">{videoData.title || "No title provided"}</h2>
                    <div className="flex items-center gap-2 text-zinc-400 group">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 border border-white/10">
                         {videoData.author?.avatar ? (
                           <img src={videoData.author.avatar} alt="" className="w-full h-full object-cover" />
                         ) : (
                           <UserCircle className="w-full h-full" />
                         )}
                      </div>
                      <span className="font-medium">@{videoData.author?.unique_id || "tiktok_user"}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mt-auto">
                    <button 
                      onClick={() => handleDownload('hd', videoData.hdplay || videoData.play)}
                      disabled={!!downloadingType}
                      className="group flex items-center justify-between w-full bg-emerald-500 hover:bg-emerald-600 px-5 py-4 rounded-2xl transition-all font-bold active:scale-95 disabled:opacity-50"
                    >
                      <span className="flex items-center gap-3">
                        {downloadingType === 'hd' ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                        HD Video (No Watermark)
                      </span>
                      <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                    </button>

                    <button 
                      onClick={() => handleDownload('sd', videoData.play)}
                      disabled={!!downloadingType}
                      className="group flex items-center justify-between w-full bg-blue-500 hover:bg-blue-600 px-5 py-4 rounded-2xl transition-all font-bold active:scale-95 disabled:opacity-50"
                    >
                      <span className="flex items-center gap-3">
                        {downloadingType === 'sd' ? <Loader2 size={20} className="animate-spin" /> : <Film size={20} />}
                        Standard Video
                      </span>
                      <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                    </button>

                    <button 
                      onClick={() => handleDownload('music', videoData.music)}
                      disabled={!!downloadingType}
                      className="group flex items-center justify-between w-full bg-slate-800 hover:bg-slate-700 px-5 py-4 rounded-2xl transition-all font-bold active:scale-95 disabled:opacity-50"
                    >
                      <span className="flex items-center gap-3">
                        {downloadingType === 'music' ? <Loader2 size={20} className="animate-spin" /> : <Music size={20} />}
                        Download MP3
                      </span>
                      <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => {
                  setVideoData(null);
                  setVideoUrl('');
                }}
                className="w-full mt-8 text-zinc-500 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <RotateCcw size={14} />
                Download Another Video
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info */}
        <footer className="mt-16 text-center">
          <p className="text-zinc-600 text-xs font-medium uppercase tracking-[0.2em] mb-4">
            {config?.admin_name ? `Powered by ${config.admin_name}` : 'Powered by TikTok Downloader'}
          </p>
          <div className="flex items-center justify-center gap-4 text-zinc-500">
            <span className="text-xs">Security Verified</span>
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span className="text-xs">HD Quality</span>
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span className="text-xs">Unlimited Usage</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
