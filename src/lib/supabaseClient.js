import { createClient } from '@supabase/supabase-js';
import { readSupabaseConfig } from './supabaseConfig.js';

export const supabaseConfig = readSupabaseConfig(import.meta.env ?? {});

export const supabase = supabaseConfig.configured
  ? createClient(supabaseConfig.url, supabaseConfig.publishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    })
  : null;
