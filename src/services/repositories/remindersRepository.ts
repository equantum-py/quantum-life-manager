import { supabase } from '../../lib/supabaseClient';
import { Reminder } from '../../types/reminder';

export const remindersRepository = {
  async listReminders(): Promise<Reminder[]> {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('remind_at', { ascending: true });

    if (error) {
      // Return empty array gracefully if table doesn't exist yet
      if (error.code === '42P01' || error.message.includes('relation "public.reminders" does not exist')) {
        return [];
      }
      throw error;
    }
    return data || [];
  },

  async listUpcomingReminders(): Promise<Reminder[]> {
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
    const { data, error } = await supabase
      .from('reminders')
      .insert(reminder)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<Reminder> {
    const { data, error } = await supabase
      .from('reminders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async cancelReminder(id: string): Promise<void> {
    const { error } = await supabase
      .from('reminders')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (error) throw error;
  },

  async deleteReminder(id: string): Promise<void> {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
