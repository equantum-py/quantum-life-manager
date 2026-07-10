export type ReminderSourceType = 'task' | 'meeting' | 'custom';
export type ReminderChannel = 'app' | 'telegram' | 'push';
export type ReminderStatus = 'pending' | 'sent' | 'cancelled' | 'failed';

export interface Reminder {
  id: string;
  user_id: string;
  source_type: ReminderSourceType;
  source_id?: string | null;
  title: string;
  remind_at: string; // ISO DateTime
  channel: ReminderChannel;
  status: ReminderStatus;
  sent_at?: string | null;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}
