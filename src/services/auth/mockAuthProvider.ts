import { mockUsers } from '../../data/mockUsers';
import { User } from '../../types';
import { storageService } from '../storageService';
import { AuthProvider } from './types';

const KEY = 'qlm_session';

let currentUser: User | null = null;

export const mockAuthProvider: AuthProvider = {
  async initialize() {
    currentUser = storageService.get<User | null>(KEY, null);
    return currentUser;
  },
  
  async login(email, password) {
    const user = mockUsers.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error('Credenciales inválidas');
    const safe = { ...user, password: '' } as User;
    storageService.set(KEY, safe);
    currentUser = safe;
    return safe;
  },
  
  async logout() {
    storageService.remove(KEY);
    currentUser = null;
  },
  
  current() {
    return currentUser;
  }
};
