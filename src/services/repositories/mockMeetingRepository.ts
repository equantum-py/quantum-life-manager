import { Meeting } from '../../types';
import { MeetingRepository } from './types';
import { mockMeetings as initialMockMeetings } from '../../data/mockMeetings';

const STORAGE_KEY = 'quantum_mock_meetings';

function getStoredMeetings(): Meeting[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : initialMockMeetings;
}

function saveMeetings(meetings: Meeting[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
}

export const mockMeetingRepository: MeetingRepository = {
  async listMeetings(): Promise<Meeting[]> {
    return getStoredMeetings();
  },

  async createMeeting(meeting: Omit<Meeting, 'id'>): Promise<Meeting> {
    const meetings = getStoredMeetings();
    const newMeeting: Meeting = {
      ...meeting,
      id: `m_${Date.now()}`,
    };
    saveMeetings([...meetings, newMeeting]);
    return newMeeting;
  },

  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting> {
    const meetings = getStoredMeetings();
    const index = meetings.findIndex(m => m.id === id);
    if (index === -1) throw new Error(`Meeting ${id} not found`);
    
    const updatedMeeting = { ...meetings[index], ...updates };
    meetings[index] = updatedMeeting;
    saveMeetings(meetings);
    return updatedMeeting;
  },

  async deleteMeeting(id: string): Promise<void> {
    const meetings = getStoredMeetings();
    saveMeetings(meetings.filter(m => m.id !== id));
  }
};
