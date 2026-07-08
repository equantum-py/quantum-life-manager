import { Task } from '../../types';
import { TaskRepository } from './types';
import { mockTasks as initialMockTasks } from '../../data/mockTasks';

const STORAGE_KEY = 'quantum_mock_tasks';

function getStoredTasks(): Task[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : initialMockTasks;
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export const mockTaskRepository: TaskRepository = {
  async listTasks(): Promise<Task[]> {
    return getStoredTasks();
  },

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const tasks = getStoredTasks();
    const today = new Date().toISOString().split('T')[0];
    const newTask: Task = {
      ...task,
      id: `t_${Date.now()}`,
      createdAt: today,
      updatedAt: today,
    };
    saveTasks([...tasks, newTask]);
    return newTask;
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const tasks = getStoredTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error(`Task ${id} not found`);
    
    const updatedTask = { ...tasks[index], ...updates, updatedAt: new Date().toISOString().split('T')[0] };
    tasks[index] = updatedTask;
    saveTasks(tasks);
    return updatedTask;
  },

  async deleteTask(id: string): Promise<void> {
    const tasks = getStoredTasks();
    saveTasks(tasks.filter(t => t.id !== id));
  },

  async markTaskDone(id: string): Promise<Task> {
    return this.updateTask(id, { status: 'Terminada' });
  }
};
