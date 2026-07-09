import { dataModeService } from './dataModeService';
import { mockAuthProvider } from './auth/mockAuthProvider';
import { supabaseAuthProvider } from './auth/supabaseAuthProvider';
import { AuthProvider } from './auth/types';

export const authService: AuthProvider & {
  canAccess(sectionId: string): boolean;
} = new Proxy({} as any, {
  get(_, prop: keyof AuthProvider | 'canAccess') {
    const provider = dataModeService.isSupabaseMode() 
      ? supabaseAuthProvider 
      : mockAuthProvider;
      
    if (prop === 'canAccess') {
      return (sectionId: string) => {
        const u = provider.current();
        return !!u?.sections.includes(sectionId as never);
      };
    }
    
    return provider[prop as keyof AuthProvider];
  }
});
