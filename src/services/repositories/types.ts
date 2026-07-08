import { Task, Meeting, Note, Project, Section } from '../../types';

export interface TaskRepository {
  listTasks(): Promise<Task[]>;
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
  markTaskDone(id: string): Promise<Task>;
}

export interface MeetingRepository {
  listMeetings(): Promise<Meeting[]>;
  createMeeting(meeting: Omit<Meeting, 'id'>): Promise<Meeting>;
  updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting>;
  deleteMeeting(id: string): Promise<void>;
}

export interface NoteRepository {
  listNotes(): Promise<Note[]>;
  createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note>;
  updateNote(id: string, updates: Partial<Note>): Promise<Note>;
  deleteNote(id: string): Promise<void>;
}

export interface ProjectRepository {
  listProjects(): Promise<Project[]>;
  createProject(project: Omit<Project, 'id'>): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
}

export interface SectionRepository {
  listSections(): Promise<Section[]>;
}
