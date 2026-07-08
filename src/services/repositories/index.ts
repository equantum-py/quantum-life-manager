import { dataModeService } from '../dataModeService';

import { mockTaskRepository } from './mockTaskRepository';
import { mockMeetingRepository } from './mockMeetingRepository';
import { mockNoteRepository } from './mockNoteRepository';
import { mockProjectRepository } from './mockProjectRepository';
import { mockSectionRepository } from './mockSectionRepository';

import { supabaseTaskRepository } from './supabaseTaskRepository';
import { supabaseMeetingRepository } from './supabaseMeetingRepository';
import { supabaseNoteRepository } from './supabaseNoteRepository';
import { supabaseProjectRepository } from './supabaseProjectRepository';
import { supabaseSectionRepository } from './supabaseSectionRepository';

import { TaskRepository, MeetingRepository, NoteRepository, ProjectRepository, SectionRepository } from './types';

export const taskRepository: TaskRepository = new Proxy({} as TaskRepository, {
  get(_, prop: keyof TaskRepository) {
    const repo = dataModeService.isSupabaseMode() ? supabaseTaskRepository : mockTaskRepository;
    return repo[prop];
  }
});

export const meetingRepository: MeetingRepository = new Proxy({} as MeetingRepository, {
  get(_, prop: keyof MeetingRepository) {
    const repo = dataModeService.isSupabaseMode() ? supabaseMeetingRepository : mockMeetingRepository;
    return repo[prop];
  }
});

export const noteRepository: NoteRepository = new Proxy({} as NoteRepository, {
  get(_, prop: keyof NoteRepository) {
    const repo = dataModeService.isSupabaseMode() ? supabaseNoteRepository : mockNoteRepository;
    return repo[prop];
  }
});

export const projectRepository: ProjectRepository = new Proxy({} as ProjectRepository, {
  get(_, prop: keyof ProjectRepository) {
    const repo = dataModeService.isSupabaseMode() ? supabaseProjectRepository : mockProjectRepository;
    return repo[prop];
  }
});

export const sectionRepository: SectionRepository = new Proxy({} as SectionRepository, {
  get(_, prop: keyof SectionRepository) {
    const repo = dataModeService.isSupabaseMode() ? supabaseSectionRepository : mockSectionRepository;
    return repo[prop];
  }
});

export * from './types';
