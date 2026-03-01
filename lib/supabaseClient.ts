import { createClient } from '@supabase/supabase-js';

// Simple check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create client only if both variables exist
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
