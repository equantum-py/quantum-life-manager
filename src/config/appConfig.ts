import { dataMode, isSupabaseConfigured, shouldUseSupabase } from '../lib/supabaseClient';

export const appConfig = {
  appName: 'Quantum Life Manager',
  appVersion: '1.0.0',
  dataMode,             // 'mock' | 'supabase'
  isSupabaseConfigured, // true if URL and ANON_KEY exist
  shouldUseSupabase,    // true if mode is 'supabase' AND isSupabaseConfigured is true
};
