import { appConfig } from '../config/appConfig';

/**
 * Servicio para consultar y validar el modo de datos activo (Mock vs Supabase).
 */
export const dataModeService = {
  /**
   * Retorna el modo actual de la aplicación.
   */
  getDataMode(): 'mock' | 'supabase' {
    return appConfig.dataMode;
  },

  /**
   * Verifica si la aplicación está operando en modo Mock.
   */
  isMockMode(): boolean {
    return appConfig.dataMode === 'mock';
  },

  /**
   * Verifica si la aplicación está operando en modo Supabase.
   */
  isSupabaseMode(): boolean {
    return appConfig.shouldUseSupabase;
  },

  /**
   * Lanza un error si se intenta realizar una operación de Supabase 
   * cuando el cliente no está configurado.
   */
  assertSupabaseReady(): void {
    if (!appConfig.shouldUseSupabase) {
      throw new Error('Supabase is not configured or data mode is set to mock.');
    }
  }
};
