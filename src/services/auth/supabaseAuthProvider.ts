import { User } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { AuthProvider } from './types';

let currentUser: User | null = null;

export const supabaseAuthProvider: AuthProvider = {
  async initialize() {
    if (!supabase) {
      console.warn('Supabase no configurado o inactivo.');
      currentUser = null;
      return null;
    }
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session?.user) {
        currentUser = null;
        return null;
      }
      
      currentUser = await fetchUserProfile(session.user.id, session.user.email!);
      return currentUser;
    } catch (err) {
      console.error('Error inicializando sesión Supabase', err);
      currentUser = null;
      return null;
    }
  },

  async login(email, password) {
    if (!supabase) throw new Error('Supabase no está configurado.');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password || '',
    });
    
    if (error || !data.user) {
      throw new Error(error?.message || 'Error al iniciar sesión');
    }
    
    currentUser = await fetchUserProfile(data.user.id, data.user.email!);
    return currentUser;
  },

  async logout() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    currentUser = null;
  },

  current() {
    return currentUser;
  }
};

async function fetchUserProfile(userId: string, email: string): Promise<User> {
  if (!supabase) throw new Error('Supabase no configurado');
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  const { data: sections } = await supabase
    .from('section_members')
    .select('section_id')
    .eq('user_id', userId);
  
  return {
    id: userId,
    email: email,
    name: profile?.name || email.split('@')[0],
    role: profile?.role || 'collaborator',
    sections: (sections || []).map(s => s.section_id),
  };
}
