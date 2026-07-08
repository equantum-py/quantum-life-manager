import { Note } from '../../types';
import { NoteRepository } from './types';
import { supabase } from '../../lib/supabaseClient';
import { dataModeService } from '../dataModeService';

export const supabaseNoteRepository: NoteRepository = {
  async listNotes(): Promise<Note[]> {
    dataModeService.assertSupabaseReady();
    const { data, error } = await supabase!.from('notes').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    return data.map(d => ({
      ...d,
      sectionId: d.section_id,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    })) as Note[];
  },

  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    dataModeService.assertSupabaseReady();
    const dbNote = {
      title: note.title,
      content: note.content,
      section_id: note.sectionId,
      category: note.category,
      links: note.links,
    };

    const { data, error } = await supabase!.from('notes').insert(dbNote).select().single();
    if (error) throw error;
    
    return { ...data, sectionId: data.section_id, createdAt: data.created_at, updatedAt: data.updated_at } as Note;
  },

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    dataModeService.assertSupabaseReady();
    
    const dbUpdates: any = { ...updates };
    if (updates.sectionId) dbUpdates.section_id = updates.sectionId;
    delete dbUpdates.sectionId;
    delete dbUpdates.createdAt;
    delete dbUpdates.updatedAt;

    const { data, error } = await supabase!.from('notes').update(dbUpdates).eq('id', id).select().single();
    if (error) throw error;

    return { ...data, sectionId: data.section_id, createdAt: data.created_at, updatedAt: data.updated_at } as Note;
  },

  async deleteNote(id: string): Promise<void> {
    dataModeService.assertSupabaseReady();
    const { error } = await supabase!.from('notes').delete().eq('id', id);
    if (error) throw error;
  }
};
