import { Project } from '../../types';
import { ProjectRepository } from './types';
import { supabase } from '../../lib/supabaseClient';
import { dataModeService } from '../dataModeService';

export const supabaseProjectRepository: ProjectRepository = {
  async listProjects(): Promise<Project[]> {
    dataModeService.assertSupabaseReady();
    const { data, error } = await supabase!.from('projects').select('*').order('start_date', { ascending: false });
    if (error) throw error;
    
    return data.map(d => ({
      ...d,
      sectionId: d.section_id,
      startDate: d.start_date,
      dueDate: d.due_date,
      pendingTasks: d.pending_tasks,
      paymentStatus: d.payment_status,
    })) as Project[];
  },

  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    dataModeService.assertSupabaseReady();
    const dbProject = {
      name: project.name,
      client: project.client,
      status: project.status,
      priority: project.priority,
      start_date: project.startDate,
      due_date: project.dueDate,
      pending_tasks: project.pendingTasks,
      notes: project.notes,
      links: project.links,
      payment_status: project.paymentStatus,
      section_id: project.sectionId,
    };

    const { data, error } = await supabase!.from('projects').insert(dbProject).select().single();
    if (error) throw error;
    
    return { ...data, sectionId: data.section_id, startDate: data.start_date, dueDate: data.due_date, pendingTasks: data.pending_tasks, paymentStatus: data.payment_status } as Project;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    dataModeService.assertSupabaseReady();
    
    const dbUpdates: any = { ...updates };
    if (updates.startDate) dbUpdates.start_date = updates.startDate;
    if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
    if (updates.pendingTasks !== undefined) dbUpdates.pending_tasks = updates.pendingTasks;
    if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
    if (updates.sectionId) dbUpdates.section_id = updates.sectionId;

    delete dbUpdates.startDate;
    delete dbUpdates.dueDate;
    delete dbUpdates.pendingTasks;
    delete dbUpdates.paymentStatus;
    delete dbUpdates.sectionId;

    const { data, error } = await supabase!.from('projects').update(dbUpdates).eq('id', id).select().single();
    if (error) throw error;

    return { ...data, sectionId: data.section_id, startDate: data.start_date, dueDate: data.due_date, pendingTasks: data.pending_tasks, paymentStatus: data.payment_status } as Project;
  },

  async deleteProject(id: string): Promise<void> {
    dataModeService.assertSupabaseReady();
    const { error } = await supabase!.from('projects').delete().eq('id', id);
    if (error) throw error;
  }
};
