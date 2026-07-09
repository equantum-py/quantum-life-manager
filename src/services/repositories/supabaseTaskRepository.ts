import { Task } from '../../types';
import { TaskRepository } from './types';
import { supabase } from '../../lib/supabaseClient';
import { dataModeService } from '../dataModeService';
import { safeDateString } from '../../utils/dates';

function normalizeTaskFromSupabase(d: any): Task {
  const safeDueDate = safeDateString(d.due_date);
  if (!d.due_date || safeDueDate !== d.due_date) {
    console.warn('Invalid task date normalized', d);
  }

  return {
    ...d,
    id: d.id || '',
    title: d.title || 'Sin título',
    description: d.description || '',
    sectionId: d.section_id || 'equantum',
    projectId: d.project_id || undefined,
    dueDate: safeDueDate,
    createdAt: safeDateString(d.created_at),
    updatedAt: safeDateString(d.updated_at || d.created_at),
    priority: d.priority || 'Media',
    status: d.status || 'Pendiente',
    assignee: d.assignee || 'Sin asignar'
  } as Task;
}

export const supabaseTaskRepository: TaskRepository = {
  async listTasks(): Promise<Task[]> {
    dataModeService.assertSupabaseReady();
    try {
      const { data, error } = await supabase!.from('tasks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      
      return (data || []).map(normalizeTaskFromSupabase);
    } catch (e) {
      console.error('Error in supabaseTaskRepository.listTasks:', e);
      throw e;
    }
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    dataModeService.assertSupabaseReady();
    const dbTask = {
      title: task.title,
      description: task.description,
      section_id: task.sectionId,
      project_id: task.projectId,
      client: task.client,
      priority: task.priority,
      status: task.status,
      due_date: task.dueDate,
      assignee: task.assignee,
      reminder: task.reminder,
    };

    try {
      const { data, error } = await supabase!.from('tasks').insert(dbTask).select().single();
      if (error) throw error;
      
      return normalizeTaskFromSupabase(data);
    } catch (e) {
      console.error('Error in supabaseTaskRepository.createTask:', e);
      throw e;
    }
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    dataModeService.assertSupabaseReady();
    
    const dbUpdates: any = { ...updates };
    if (updates.sectionId) dbUpdates.section_id = updates.sectionId;
    if (updates.projectId) dbUpdates.project_id = updates.projectId;
    if (updates.dueDate) dbUpdates.due_date = updates.dueDate;

    delete dbUpdates.sectionId;
    delete dbUpdates.projectId;
    delete dbUpdates.dueDate;
    delete dbUpdates.createdAt;
    delete dbUpdates.updatedAt;

    try {
      const { data, error } = await supabase!.from('tasks').update(dbUpdates).eq('id', id).select().single();
      if (error) throw error;

      return normalizeTaskFromSupabase(data);
    } catch (e) {
      console.error('Error in supabaseTaskRepository.updateTask:', e);
      throw e;
    }
  },

  async deleteTask(id: string): Promise<void> {
    dataModeService.assertSupabaseReady();
    const { error } = await supabase!.from('tasks').delete().eq('id', id);
    if (error) throw error;
  },

  async markTaskDone(id: string): Promise<Task> {
    return this.updateTask(id, { status: 'Terminada' });
  }
};
