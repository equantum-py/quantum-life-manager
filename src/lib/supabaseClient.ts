export const dataMode = import.meta.env.VITE_DATA_MODE ?? 'mock';
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL ?? '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
};
export const isSupabaseConfigured = Boolean(supabaseConfig.url && supabaseConfig.anonKey);
export const supabase = null as null | unknown;
