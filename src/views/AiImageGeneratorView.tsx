import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Sparkles, Download, Loader2, AlertCircle, Eye, User, Rocket } from 'lucide-react';
import { AiImageGenerator } from './admin-dashboard/types';

export default function AiImageGeneratorView() {
  const { admin_username } = useParams();
  const [config, setConfig] = useState<AiImageGenerator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [prompt, setPrompt] = useState('luxury sports car on a rainy street');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error: sbError } = await supabase
          .from('ai_image_generators')
          .select('*')
          .eq('admin_username', admin_username)
          .limit(1)
          .maybeSingle();

        if (sbError || !data) {
          console.error("Supabase Error:", sbError);
          setError('AI Image Generator not found.');
        } else {
          setConfig(data);
          try {
            // We should ensure this RPC exists or handle it gracefully
            await supabase.rpc('increment_ai_image_views', { generator_id: data.id });
          } catch (e) {
            console.error("View increment error:", e);
          }
        }
      } catch (err) {
        setError('Failed to load generator config.');
      } finally {
        setLoading(false);
      }
    };
    if (admin_username) fetchConfig();
  }, [admin_username]);

  const generateImage = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGenError(null);
    setResultImage(null);

    const API_BASE = "https://stable-diffusion.fak-official.workers.dev/text-to-image";
    const url = `${API_BASE}?prompt=${encodeURIComponent(prompt)}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("API failed to generate image.");

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setResultImage(imageUrl);
    } catch (err: any) {
      setGenError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const suggestions = [
    { label: '🌃 Cyberpunk', text: 'a futuristic cyberpunk city at night, neon lights' },
    { label: '🐱 Space Cat', text: 'a cute cat wearing astronaut suit in space' },
    { label: '🌸 Anime', text: 'beautiful anime girl cherry blossom tree' },
    { label: '🏎️ Sports Car', text: 'luxury sports car on a rainy street' },
    { label: '🐉 Dragon', text: 'dragon flying over mountains fantasy art' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center text-[#e2e8f0]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#7c3aed] animate-spin" />
          <h2 className="text-xl font-bold tracking-widest text-[#7c3aed] uppercase font-mono">Initializing AI Image Core...</h2>
        </div>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center text-[#e2e8f0] px-4">
        <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl max-w-md text-center backdrop-blur-xl">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2 uppercase tracking-tighter">Target Not Found</h2>
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">
            The resource you requested could not be located in this coordinate space. It may have been moved or deleted.
          </p>
          <a 
            href="/"
            className="inline-block px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all border border-white/5 uppercase tracking-widest text-xs"
          >
            Return to Profile
          </a>
        </div>
      </div>
    );
  }

  const themeColor = config.theme_color || '#7c3aed';

  return (
    <div className="min-h-screen w-full bg-[#0f0f1a] text-[#e2e8f0] flex items-center justify-center relative overflow-hidden font-sans p-4">
      {/* Background Blobs */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 pointer-events-none top-[-200px] left-[-150px]"
        style={{ background: themeColor }}
      ></div>
      <div 
        className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-20 pointer-events-none bottom-[-150px] right-[-100px]"
        style={{ background: '#06b6d4' }}
      ></div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="bg-white/[0.08] backdrop-blur-[30px] border border-white/15 rounded-[32px] p-6 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.4)] text-center overflow-hidden">
          
          {/* Logo / Header */}
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/40 translate-y-[-5px]"
            style={{ background: `linear-gradient(135deg, ${themeColor}, #06b6d4)` }}
          >
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent uppercase tracking-tight">
            {config.name || 'AI Image Generator'}
          </h1>
          <p className="text-zinc-400 text-sm md:text-base mb-8 max-w-sm mx-auto font-light leading-relaxed">
            {config.description || 'Powered by Stable Diffusion — Describe your vision and create magic instantly.'}
          </p>

          {/* Input Box */}
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex gap-2 flex-col sm:flex-row">
               <input 
                type="text" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want..." 
                className="flex-1 bg-white/[0.05] border-2 border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:border-indigo-500 focus:shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-all placeholder:text-zinc-600 font-medium"
              />
              <button 
                onClick={generateImage}
                disabled={isGenerating || !prompt.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
                {isGenerating ? 'GEN...' : 'GO'}
              </button>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap justify-center gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(s.text)}
                  className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-full px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-all"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {genError && (
             <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-200 text-sm">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                {genError}
             </div>
          )}

          {/* Image Result */}
          {resultImage && (
            <div className="mt-8 animate-in zoom-in-95 duration-500">
               <div className="relative group rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img 
                    src={resultImage} 
                    alt="AI Generated" 
                    className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
                    crossOrigin="anonymous" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button 
                      onClick={handleDownload}
                      className="p-4 bg-white/10 hover:bg-white/20 rounded-full border border-white/20 backdrop-blur-md transition-all scale-75 group-hover:scale-100"
                    >
                      <Download className="w-8 h-8 text-white" />
                    </button>
                  </div>
               </div>
               <button 
                  onClick={handleDownload}
                  className="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white font-bold transition-all text-sm uppercase tracking-widest"
                >
                  <Download className="w-4 h-4 ml-[-5px]" /> Download Asset
                </button>
            </div>
          )}

          {/* Admin Info */}
          <div className="mt-12 flex items-center justify-center gap-6 border-t border-white/5 pt-8">
             {config.admin_name && (
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                  <User className="w-4 h-4" />
                  By {config.admin_name}
                </div>
             )}
             {config.views_count > 0 && (
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                  <Eye className="w-4 h-4" />
                  {config.views_count.toLocaleString()} Views
                </div>
             )}
          </div>

          <p className="mt-8 text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
            🛡️ secure node-api connection active
          </p>
        </div>
      </div>
    </div>
  );
}
