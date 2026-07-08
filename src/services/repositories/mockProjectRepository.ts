import { Project } from '../../types';
import { ProjectRepository } from './types';
import { mockProjects as initialMockProjects } from '../../data/mockProjects';

const STORAGE_KEY = 'quantum_mock_projects';

function getStoredProjects(): Project[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : initialMockProjects;
}

function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export const mockProjectRepository: ProjectRepository = {
  async listProjects(): Promise<Project[]> {
    return getStoredProjects();
  },

  async createProject(project: Omit<Project, 'id'>): Promise<Project> {
    const projects = getStoredProjects();
    const newProject: Project = {
      ...project,
      id: `p_${Date.now()}`,
    };
    saveProjects([...projects, newProject]);
    return newProject;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const projects = getStoredProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) throw new Error(`Project ${id} not found`);
    
    const updatedProject = { ...projects[index], ...updates };
    projects[index] = updatedProject;
    saveProjects(projects);
    return updatedProject;
  },

  async deleteProject(id: string): Promise<void> {
    const projects = getStoredProjects();
    saveProjects(projects.filter(p => p.id !== id));
  }
};
