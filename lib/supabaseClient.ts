import { createClient } from '@supabase/supabase-js';

// Only create client if environment variables exist and we're not in build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = (typeof window !== 'undefined' || supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl || '', supabaseAnonKey || '')
  : null;
