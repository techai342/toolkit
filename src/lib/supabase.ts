import { createClient } from '@supabase/supabase-js';

// Fallback to the provided keys if the environment variables are not set
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://bcwggckpklfnerypxrrb.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_byNPPDKQ8F9IG9HdgyEptQ_KXFiX8yl';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
