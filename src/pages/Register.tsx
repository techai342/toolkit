import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);
  
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    if (username.length < 3) {
      setMessage({ text: 'Username must be at least 3 characters.', type: 'error' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    // 1. Check if username is taken first
    const { data: existingUser } = await supabase.from('profiles').select('id').eq('username', username).single();
    if (existingUser) {
        setMessage({ text: 'Username already taken.', type: 'error' });
        setLoading(false);
        return;
    }

    // 2. Sign Up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setMessage({ text: signUpError.message, type: 'error' });
      setLoading(false);
      return;
    }

    if (signUpData.user) {
      // 3. Insert Profile
      const { error: profileError } = await supabase.from('profiles').insert([
        { id: signUpData.user.id, username }
      ]);

      if (profileError) {
        setMessage({ text: profileError.message || 'Could not create profile.', type: 'error' });
        setLoading(false);
        return;
      }
      
      await refreshProfile();
      navigate(`/admin/${username}`);
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white/[0.03] backdrop-blur-[40px] border border-white/20 rounded-3xl p-8 shadow-[0_0_40px_rgba(168,85,247,0.15)] shrink-0 animate-in fade-in zoom-in duration-500 my-auto relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/30 blur-[60px] rounded-full pointer-events-none"></div>

      <div className="mb-8 text-center relative z-10">
         <h2 className="text-3xl font-medium tracking-tight text-white mb-2">Create Account</h2>
         <p className="text-sm font-light text-purple-200/60">Join the space to build your dashboard</p>
      </div>

       {message && (
          <div className={`p-4 rounded-xl mb-6 text-sm text-center border backdrop-blur-md relative z-10 ${message.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-200' : 'bg-green-500/10 border-green-500/30 text-green-200'}`}>
            {message.text}
          </div>
        )}

      <form className="space-y-5 relative z-10" onSubmit={handleSignUp}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-light text-zinc-300 block ml-1">Username</label>
            <div className="relative group">
               <input 
                 type="text" 
                 required
                 value={username}
                 onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                 className="w-full bg-white/[0.05] border border-white/10 rounded-xl focus:border-purple-400 focus:bg-white/10 focus:ring-4 focus:ring-purple-500/20 text-white px-5 py-3 text-sm outline-none transition-all placeholder-white/30 backdrop-blur-sm shadow-inner"
                 placeholder="unique_id"
               />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-light text-zinc-300 block ml-1">Email address</label>
            <div className="relative group">
               <input 
                 type="email" 
                 required
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 className="w-full bg-white/[0.05] border border-white/10 rounded-xl focus:border-purple-400 focus:bg-white/10 focus:ring-4 focus:ring-purple-500/20 text-white px-5 py-3 text-sm outline-none transition-all placeholder-white/30 backdrop-blur-sm shadow-inner"
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
                 className="w-full bg-white/[0.05] border border-white/10 rounded-xl focus:border-purple-400 focus:bg-white/10 focus:ring-4 focus:ring-purple-500/20 text-white px-5 py-3 text-sm outline-none transition-all placeholder-white/30 backdrop-blur-sm shadow-inner"
                 placeholder="••••••••••••"
               />
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-light text-zinc-300 block ml-1">Confirm Password</label>
             <div className="relative group">
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/[0.05] border border-white/10 rounded-xl focus:border-purple-400 focus:bg-white/10 focus:ring-4 focus:ring-purple-500/20 text-white px-5 py-3 text-sm outline-none transition-all placeholder-white/30 backdrop-blur-sm shadow-inner"
                  placeholder="••••••••••••"
                />
             </div>
          </div>
        </div>

        <div className="pt-6 mt-4">
            <button
                type="submit"
                disabled={loading || !email || !password || !username}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border border-purple-400/50 rounded-xl text-white font-medium text-lg py-4 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {loading ? 'Creating...' : 'Sign Up'}
            </button>
        </div>
        <p className="text-center text-sm text-zinc-400 mt-6">
          Already a Member ? <Link to="/login" className="text-white font-medium hover:text-purple-300 transition-colors">Login Here</Link>
        </p>
      </form>
    </div>
  );
}
