import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage({ text: error.message, type: 'error' });
      setLoading(false);
    } else {
      const { data: profile } = await supabase.from('profiles').select('username').eq('id', data.user.id).single();
      if (profile && profile.username) {
        navigate(`/admin/${profile.username}`);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/[0.03] backdrop-blur-[40px] border border-white/20 rounded-3xl p-8 shadow-[0_0_40px_rgba(168,85,247,0.15)] shrink-0 animate-in fade-in zoom-in duration-500 my-auto relative overflow-hidden">
      {/* Internal Glow Overlay */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/30 blur-[60px] rounded-full pointer-events-none"></div>
      
      <div className="mb-8 text-center relative z-10">
         <h2 className="text-3xl font-medium tracking-tight text-white mb-2">Welcome Back</h2>
         <p className="text-sm font-light text-purple-200/60">Log in to access your space</p>
      </div>

       {message && (
          <div className={`p-4 rounded-xl mb-6 text-xs text-center border backdrop-blur-md relative z-10 ${message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-200' : 'bg-green-500/10 border-green-500/30 text-green-200'}`}>
            {message.text}
          </div>
        )}

      <form className="space-y-6 relative z-10" onSubmit={handleSignIn}>
        <div className="space-y-2">
          <label className="text-sm font-light text-zinc-300 block ml-1">Email address</label>
          <div className="relative group">
             <input 
               type="email" 
               required
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="w-full bg-white/[0.05] border border-white/10 rounded-xl focus:border-purple-400 focus:bg-white/10 focus:ring-4 focus:ring-purple-500/20 text-white px-5 py-4 text-sm outline-none transition-all placeholder-white/30 backdrop-blur-sm shadow-inner"
               placeholder="example@gmail.com"
             />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-light text-zinc-300 block ml-1">Password</label>
          <div className="relative group">
             <input 
               type="password" 
               required
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="w-full bg-white/[0.05] border border-white/10 rounded-xl focus:border-purple-400 focus:bg-white/10 focus:ring-4 focus:ring-purple-500/20 text-white px-5 py-4 text-sm outline-none transition-all placeholder-white/30 backdrop-blur-sm shadow-inner"
               placeholder="••••••••••••"
             />
          </div>
        </div>

        <div className="flex justify-end pt-1">
            <a href="#" className="text-sm text-purple-300 hover:text-white transition-colors">Forget Password ?</a>
        </div>

        <div className="pt-2">
            <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/50 rounded-xl text-white font-medium text-lg py-4 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {loading ? 'Authenticating...' : 'Login'}
            </button>
        </div>
        <p className="text-center text-sm text-zinc-400 mt-6 pt-4">
          Are You New Member ? <Link to="/register" className="text-white font-medium hover:text-purple-300 transition-colors">Sign UP</Link>
        </p>
      </form>
    </div>
  );
}
