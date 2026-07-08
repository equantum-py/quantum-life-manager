import { Note } from '../../types';
import { NoteRepository } from './types';
import { mockNotes as initialMockNotes } from '../../data/mockNotes';

const STORAGE_KEY = 'quantum_mock_notes';

function getStoredNotes(): Note[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : initialMockNotes;
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export const mockNoteRepository: NoteRepository = {
  async listNotes(): Promise<Note[]> {
    return getStoredNotes();
  },

  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const notes = getStoredNotes();
    const today = new Date().toISOString().split('T')[0];
    const newNote: Note = {
      ...note,
      id: `n_${Date.now()}`,
      createdAt: today,
      updatedAt: today,
    };
    saveNotes([...notes, newNote]);
    return newNote;
  },

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const notes = getStoredNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) throw new Error(`Note ${id} not found`);
    
    const updatedNote = { ...notes[index], ...updates, updatedAt: new Date().toISOString().split('T')[0] };
    notes[index] = updatedNote;
    saveNotes(notes);
    return updatedNote;
  },

  async deleteNote(id: string): Promise<void> {
    const notes = getStoredNotes();
    saveNotes(notes.filter(n => n.id !== id));
  }
};
