import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  [key: string]: any;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('auth_user');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });

  const [profile, setProfile] = useState<Profile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('auth_profile');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });

  // If we have cached profile data, we can start with loading = false immediately
  const [loading, setLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('auth_profile');
        if (cached) return false;
      } catch {}
    }
    return true;
  });

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        const prof = data as Profile;
        setProfile(prof);
        try {
          localStorage.setItem('auth_profile', JSON.stringify(prof));
        } catch {}
      } else if (error) {
        // Only clear if genuinely not found
        if (error.code === 'PGRST116') {
          setProfile(null);
          try { localStorage.removeItem('auth_profile'); } catch {}
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Session error on initial fetch:", error);
        supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        try {
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_profile');
        } catch {}
        setLoading(false);
        return;
      }

      const activeUser = session?.user ?? null;
      setUser(activeUser);

      if (activeUser) {
        try {
          localStorage.setItem('auth_user', JSON.stringify(activeUser));
        } catch {}
        fetchProfile(activeUser.id).finally(() => setLoading(false));
      } else {
        try {
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_profile');
        } catch {}
        setProfile(null);
        setLoading(false);
      }
    });

    // Listen to Auth State changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (_event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        try {
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_profile');
        } catch {}
        setLoading(false);
        return;
      }
      
      const activeUser = session?.user ?? null;
      setUser(activeUser);

      if (activeUser) {
        try {
          localStorage.setItem('auth_user', JSON.stringify(activeUser));
        } catch {}
        fetchProfile(activeUser.id).finally(() => setLoading(false));
      } else {
        setProfile(null);
        try {
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_profile');
        } catch {}
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
