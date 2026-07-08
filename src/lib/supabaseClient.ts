import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const rawDataMode = import.meta.env.VITE_DATA_MODE || 'mock';

// Evaluamos si las variables necesarias existen
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Definimos el modo de datos con un fallback seguro
export const dataMode: 'mock' | 'supabase' = 
  (rawDataMode === 'supabase' && isSupabaseConfigured) ? 'supabase' : 'mock';

export const shouldUseSupabase = dataMode === 'supabase';

// Solo instanciamos el cliente si las variables existen para evitar errores en modo mock
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Aviso en consola si se pidió supabase pero faltan credenciales
if (rawDataMode === 'supabase' && !isSupabaseConfigured) {
  console.warn(
    '⚠️ VITE_DATA_MODE is set to "supabase" but Supabase credentials are missing. Falling back to "mock" mode.'
  );
}
