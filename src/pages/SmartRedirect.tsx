import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Activity, Shield, AlertTriangle } from 'lucide-react';

export default function SmartRedirect() {
  const { username, slug } = useParams();
  const location = window.location.pathname;
  const isDirectView = location.includes(`/${username}/v/`);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveSlug = async () => {
      try {
        // 1. Find profile
        const { data: profile, error: pError } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('username', username)
          .single();

        if (pError || !profile) {
          setError('Profile not found');
          setLoading(false);
          return;
        }

        // 2. Check if it's a Tool slug
        const { data: tool } = await supabase
          .from('tools')
          .select('id, slug, name, is_media')
          .or(`slug.eq."${slug}",name.ilike."${slug}"`)
          .eq('user_id', profile.id)
          .maybeSingle();

        if (tool) {
          if (tool.is_media) {
            const query = isDirectView ? '?direct=true' : '';
            navigate(`/${username}/media/${tool.id}${query}`, { replace: true });
          } else {
            navigate(`/${username}/media/${tool.id}`, { replace: true });
          }
          return;
        }

        // 3. Check if it's a Short Link slug (Legacy or fallback)
        const { data: link } = await supabase
          .from('short_links')
          .select('id, slug')
          .eq('profile_id', profile.id)
          .eq('slug', slug)
          .maybeSingle();

        if (link) {
          navigate(`/${username}/link/${link.slug}`, { replace: true });
          return;
        }

        setError('Resource not found');
      } catch (err) {
        console.error(err);
        setError('Unexpected error');
      } finally {
        setLoading(false);
      }
    };

    if (username && slug) {
      resolveSlug();
    }
  }, [username, slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center text-[#F0F0F0]">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border border-zinc-800 flex items-center justify-center relative before:absolute before:inset-0 before:border before:border-purple-500 before:rotate-45 before:animate-spin">
              <Activity className="w-6 h-6 text-purple-400 animate-pulse" />
           </div>
           <div className="text-[10px] font-mono text-purple-400 uppercase tracking-[0.3em] animate-pulse italic">Resolving Multi-Link Subsystem...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center text-[#F0F0F0] p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl border border-red-500/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 mb-2 uppercase tracking-tighter">Target Not Found</h1>
        <p className="text-zinc-500 max-w-md mx-auto font-light leading-relaxed mb-8 italic">The resource you requested could not be located in this coordinate space. It may have been moved or deleted.</p>
        <button 
          onClick={() => navigate(`/${username}`)} 
          className="px-8 py-3.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-zinc-300 font-bold tracking-widest uppercase transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
        >
          Return to Profile
        </button>
      </div>
    );
  }

  return null;
}
