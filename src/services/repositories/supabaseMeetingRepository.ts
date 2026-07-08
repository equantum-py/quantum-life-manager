import { Meeting } from '../../types';
import { MeetingRepository } from './types';
import { supabase } from '../../lib/supabaseClient';
import { dataModeService } from '../dataModeService';

export const supabaseMeetingRepository: MeetingRepository = {
  async listMeetings(): Promise<Meeting[]> {
    dataModeService.assertSupabaseReady();
    const { data, error } = await supabase!.from('meetings').select('*').order('date', { ascending: true });
    if (error) throw error;
    
    return data.map(d => ({
      ...d,
      sectionId: d.section_id,
      startTime: d.start_time,
      endTime: d.end_time,
    })) as Meeting[];
  },

  async createMeeting(meeting: Omit<Meeting, 'id'>): Promise<Meeting> {
    dataModeService.assertSupabaseReady();
    const dbMeeting = {
      title: meeting.title,
      description: meeting.description,
      section_id: meeting.sectionId,
      date: meeting.date,
      start_time: meeting.startTime,
      end_time: meeting.endTime,
      location: meeting.location,
      type: meeting.type,
      reminder: meeting.reminder,
      participants: meeting.participants,
      status: meeting.status,
    };

    const { data, error } = await supabase!.from('meetings').insert(dbMeeting).select().single();
    if (error) throw error;
    
    return { ...data, sectionId: data.section_id, startTime: data.start_time, endTime: data.end_time } as Meeting;
  },

  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting> {
    dataModeService.assertSupabaseReady();
    
    const dbUpdates: any = { ...updates };
    if (updates.sectionId) dbUpdates.section_id = updates.sectionId;
    if (updates.startTime) dbUpdates.start_time = updates.startTime;
    if (updates.endTime) dbUpdates.end_time = updates.endTime;

    delete dbUpdates.sectionId;
    delete dbUpdates.startTime;
    delete dbUpdates.endTime;

    const { data, error } = await supabase!.from('meetings').update(dbUpdates).eq('id', id).select().single();
    if (error) throw error;

    return { ...data, sectionId: data.section_id, startTime: data.start_time, endTime: data.end_time } as Meeting;
  },

  async deleteMeeting(id: string): Promise<void> {
    dataModeService.assertSupabaseReady();
    const { error } = await supabase!.from('meetings').delete().eq('id', id);
    if (error) throw error;
  }
};
