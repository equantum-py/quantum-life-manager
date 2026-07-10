import { useState, useEffect } from 'react';
import { Calendar, Bell, Smartphone, CheckCircle, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { dataMode } from '../lib/supabaseClient';
import { pushService } from '../services/pushService';

export function SettingsPage() {
  const user = authService.current();
  
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [pushStatus, setPushStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [pushError, setPushError] = useState<string | null>(null);

  useEffect(() => {
    setIsPushSupported(pushService.isPushSupported());
    if (pushService.isPushSupported()) {
      pushService.registerServiceWorker();
    }
  }, []);

  const handleEnablePush = async () => {
    if (!user) return;
    setPushStatus('loading');
    setPushError(null);

    try {
      const permission = await pushService.requestNotificationPermission();
      if (permission !== 'granted') {
        throw new Error('Permiso denegado por el navegador.');
      }

      const subscription = await pushService.subscribeToPush();
      await pushService.savePushSubscription(user.id, subscription);
      
      setPushStatus('success');
    } catch (err: any) {
      console.error('Error enabling push:', err);
      setPushStatus('error');
      setPushError(err.message || 'Error al activar notificaciones');
    }
  };

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

      <div className="app-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-500">
            <Bell size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Recordatorios</h3>
            <p className="text-sm text-slate-500">Avisos de tareas y reuniones</p>
          </div>
        </div>
        
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Estado</span>
            <span className="app-badge bg-amber-100 text-amber-700">En preparación</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">Próximamente vas a recibir avisos de tareas y reuniones importantes directamente en la aplicación.</p>
        </div>
      </div>

      <div className="app-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-500">
            <Smartphone size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Notificaciones Push</h3>
            <p className="text-sm text-slate-500">Avisos directos al teléfono</p>
          </div>
        </div>
        
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Estado</span>
            <span className={`app-badge ${
              !isPushSupported ? 'bg-slate-200 text-slate-600' :
              pushStatus === 'success' ? 'bg-green-100 text-green-700' :
              'bg-slate-200 text-slate-600'
            }`}>
              {!isPushSupported ? 'No Soportado' : pushStatus === 'success' ? 'Activadas' : 'No Activadas'}
            </span>
          </div>
          
          {pushStatus === 'success' && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700">
              <CheckCircle size={16} className="mt-0.5 shrink-0" />
              <p>Este dispositivo ya puede recibir notificaciones.</p>
            </div>
          )}

          {pushStatus === 'error' && (
            <p className="mt-3 text-sm text-red-600">
              {pushError}
            </p>
          )}

          {pushStatus === 'idle' && isPushSupported && (
            <p className="mt-3 text-sm text-slate-600">Recibe avisos de tareas vencidas y reuniones inminentes directamente en tu teléfono.</p>
          )}
        </div>

        {isPushSupported && pushStatus !== 'success' && (
          <button 
            onClick={handleEnablePush}
            disabled={pushStatus === 'loading'}
            className="app-button w-full" 
          >
            {pushStatus === 'loading' ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Activando...
              </span>
            ) : 'Activar notificaciones'}
          </button>
        )}
      </div>
    </div>
  );
}
