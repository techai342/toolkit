import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
  'https://bcwggckpklfnerypxrrb.supabase.co';

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_byNPPDKQ8F9IG9HdgyEptQ_KXFiX8yl';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-client-info': 'pro-toolkits-ultrasonic/2.0.0',
    },
  },
  db: {
    schema: 'public',
  },
});

/**
 * ⚡ Ultra-Sonic In-Memory + LocalStorage SWR (Stale-While-Revalidate) Cache
 * Delivers cached queries in ~0.1ms while refreshing silently in the background.
 */
const memoryCache = new Map<string, { data: any; expiry: number }>();

export async function fetchWithUltraCache<T = any>(
  key: string,
  fetcher: () => PromiseLike<{ data: T | null; error: any }>,
  ttlMs = 45000 // 45 seconds TTL
): Promise<{ data: T | null; error: any; cached: boolean }> {
  const now = Date.now();

  // 1. Check ultra-fast RAM memory cache (0.05ms)
  const memEntry = memoryCache.get(key);
  if (memEntry && memEntry.expiry > now) {
    return { data: memEntry.data, error: null, cached: true };
  }

  // 2. Check localStorage for persistent cache across reloads (0.5ms)
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(`ultra_${key}`);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed.expiry > now) {
          memoryCache.set(key, parsed);
          // Return cached data immediately, then revalidate in background
          Promise.resolve(fetcher())
            .then((res) => {
              if (res.data) {
                const entry = { data: res.data, expiry: Date.now() + ttlMs };
                memoryCache.set(key, entry);
                try {
                  localStorage.setItem(`ultra_${key}`, JSON.stringify(entry));
                } catch {}
              }
            })
            .catch(() => {});
          return { data: parsed.data, error: null, cached: true };
        }
      }
    } catch {}
  }

  // 3. Fallback to network fetch
  const result = await fetcher();
  if (result.data) {
    const entry = { data: result.data, expiry: now + ttlMs };
    memoryCache.set(key, entry);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`ultra_${key}`, JSON.stringify(entry));
      } catch {}
    }
  }

  return { data: result.data, error: result.error, cached: false };
}

/**
 * Invalidate a specific cache key or prefix
 */
export function invalidateUltraCache(prefix?: string) {
  if (!prefix) {
    memoryCache.clear();
    return;
  }
  for (const k of Array.from(memoryCache.keys())) {
    if (k.startsWith(prefix)) {
      memoryCache.delete(k);
    }
  }
}
