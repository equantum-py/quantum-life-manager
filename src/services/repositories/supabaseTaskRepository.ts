import { Task } from '../../types';
import { TaskRepository } from './types';
import { supabase } from '../../lib/supabaseClient';
import { dataModeService } from '../dataModeService';

export const supabaseTaskRepository: TaskRepository = {
  async listTasks(): Promise<Task[]> {
    dataModeService.assertSupabaseReady();
    const { data, error } = await supabase!.from('tasks').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    // Convert snake_case to camelCase for the frontend
    return data.map(d => ({
      ...d,
      sectionId: d.section_id,
      projectId: d.project_id,
      dueDate: d.due_date,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    })) as Task[];
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

    const { data, error } = await supabase!.from('tasks').insert(dbTask).select().single();
    if (error) throw error;
    
    return {
      ...data,
      sectionId: data.section_id,
      projectId: data.project_id,
      dueDate: data.due_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as Task;
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

    const { data, error } = await supabase!.from('tasks').update(dbUpdates).eq('id', id).select().single();
    if (error) throw error;

    return {
      ...data,
      sectionId: data.section_id,
      projectId: data.project_id,
      dueDate: data.due_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as Task;
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
