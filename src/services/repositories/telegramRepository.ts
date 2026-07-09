import { supabase } from '../../lib/supabaseClient';
import { dataModeService } from '../dataModeService';

export interface TelegramLog {
  id: string;
  telegram_username: string | null;
  telegram_chat_id: string;
  message_text: string;
  ai_raw_response: any;
  created_at: string;
}

export interface TelegramPendingAction {
  id: string;
  telegram_chat_id: string;
  action_type: string;
  status: string;
  payload: any;
  created_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
}

export const telegramRepository = {
  async getLogs(): Promise<TelegramLog[]> {
    if (!dataModeService.isSupabaseMode()) {
      return [];
    }

    const { data, error } = await supabase!
      .from('telegram_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching telegram_logs', error);
      throw error;
    }

    return data as TelegramLog[];
  },

  async getPendingActions(): Promise<TelegramPendingAction[]> {
    if (!dataModeService.isSupabaseMode()) {
      return [];
    }

    const { data, error } = await supabase!
      .from('telegram_pending_actions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching telegram_pending_actions', error);
      throw error;
    }

    return data as TelegramPendingAction[];
  }
};
