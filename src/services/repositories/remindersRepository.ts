import { supabase } from '../../lib/supabaseClient';
import { Reminder } from '../../types/reminder';

function getSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase no está configurado");
  }
  return supabase;
}

export const remindersRepository = {
  async listReminders(): Promise<Reminder[]> {
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('remind_at', { ascending: true });

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "public.reminders" does not exist')) {
        return [];
      }
      throw error;
    }
    return data || [];
  },

  async listUpcomingReminders(): Promise<Reminder[]> {
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('status', 'pending')
      .order('remind_at', { ascending: true });

    if (error) {
      if (error.code === '42P01' || error.message.includes('relation "public.reminders" does not exist')) {
        return [];
      }
      throw error;
    }
    return data || [];
  },

  async createReminder(reminder: Omit<Reminder, 'id' | 'created_at' | 'updated_at'>): Promise<Reminder> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reminders')
      .insert(reminder)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder> {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async cancelReminder(id: string): Promise<void> {
    const client = getSupabaseClient();
    const { error } = await client
      .from('reminders')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteReminder(id: string): Promise<void> {
    const client = getSupabaseClient();
    const { error } = await client
      .from('reminders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
