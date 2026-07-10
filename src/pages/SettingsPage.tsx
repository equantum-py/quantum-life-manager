import { Calendar } from 'lucide-react';
import { authService } from '../services/authService';
import { dataMode } from '../lib/supabaseClient';

export function SettingsPage() {
  const user = authService.current();
  
  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <h2 className="app-mobile-title">Configuración</h2>
      
      <div className="app-card space-y-2">
        <p className="text-sm"><b className="text-slate-900 font-bold">Usuario:</b> <span className="text-slate-600">{user.name}</span></p>
        <p className="text-sm"><b className="text-slate-900 font-bold">Rol:</b> <span className="text-slate-600">{user.role}</span></p>
        <p className="text-sm"><b className="text-slate-900 font-bold">Modo de datos:</b> <span className="text-slate-600">{dataMode}</span></p>
      </div>

      <div className="app-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Google Calendar</h3>
            <p className="text-sm text-slate-500">Sincroniza el asistente 24/7</p>
          </div>
        </div>
        
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Estado</span>
            <span className="app-badge bg-slate-200 text-slate-600">No conectado</span>
          </div>
        </div>

        <button 
          className="app-button-secondary w-full opacity-50 cursor-not-allowed" 
          disabled
        >
          Conectar calendario (Próximamente)
        </button>
      </div>
    </div>
  );
}
