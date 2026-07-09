import { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { telegramRepository, TelegramLog, TelegramPendingAction } from '../services/repositories/telegramRepository';
import { prettyDate } from '../utils/dates';
import { MessageSquare, ListTodo, CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';

// Helpers
function isBotMessage(text: string): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return lowerText.includes("✅ detecté una tarea") ||
         lowerText.includes("✅ mensaje clasificado") ||
         lowerText.includes("respondé crear") ||
         lowerText.includes("sección:") ||
         lowerText.includes("título:") ||
         lowerText.includes("prioridad:");
}

function isDirtyTitle(title: string): boolean {
  if (!title) return false;
  const lower = title.toLowerCase();
  return lower.includes("✅") || lower.includes("detecté una tarea") || lower.includes("respondé crear");
}

export function TelegramPage() {
  const [loadingUser, setLoadingUser] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [logs, setLogs] = useState<TelegramLog[]>([]);
  const [pendingActions, setPendingActions] = useState<TelegramPendingAction[]>([]);
  
  const [logFilter, setLogFilter] = useState<'all' | 'classified' | 'unclassified' | 'bot'>('all');
  const [actionFilter, setActionFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');

  useEffect(() => {
    authService.initialize().then((u) => {
      setUser(u);
      setIsAdmin(String(u?.role).toLowerCase() === 'admin');
      setLoadingUser(false);
    });
  }, []);

  useEffect(() => {
    if (!loadingUser && isAdmin) {
      loadData();
    }
  }, [loadingUser, isAdmin]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [fetchedLogs, fetchedActions] = await Promise.all([
        telegramRepository.getLogs(),
        telegramRepository.getPendingActions()
      ]);
      setLogs(fetchedLogs);
      setPendingActions(fetchedActions);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los datos de Telegram.');
    } finally {
      setLoadingData(false);
    }
  };

  if (loadingUser || (isAdmin && loadingData)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="app-muted font-semibold text-[15px]">Cargando datos de Telegram...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[var(--qlm-radius-md)] bg-red-50 p-6 text-[15px] font-bold text-red-600">
        {error}
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="app-muted font-semibold text-[15px]">No tenés permiso para ver este panel.</p>
      </div>
    );
  }

  // Métricas
  const botLogs = logs.filter(l => isBotMessage(l.message_text));
  const totalReceived = logs.length;
  const totalClassified = logs.filter(l => !isBotMessage(l.message_text) && l.ai_raw_response?.section?.sectionId).length;
  const totalIgnored = botLogs.length;

  const totalPending = pendingActions.filter(a => a.status === 'pending').length;
  const totalConfirmed = pendingActions.filter(a => a.status === 'confirmed').length;
  const totalCancelled = pendingActions.filter(a => a.status === 'cancelled').length;

  // Filtros
  const filteredLogs = logs.filter(l => {
    const isBot = isBotMessage(l.message_text);
    const isClassified = !!l.ai_raw_response?.section?.sectionId;
    
    if (logFilter === 'all') return true;
    if (logFilter === 'bot') return isBot;
    if (logFilter === 'classified') return !isBot && isClassified;
    if (logFilter === 'unclassified') return !isBot && !isClassified;
    return true;
  });

  const filteredActions = pendingActions.filter(a => {
    if (actionFilter === 'all') return true;
    return a.status === actionFilter;
  });

  // Helpers defensivos
  const safeStr = (val: any) => (typeof val === 'string' && val.trim() !== '' ? val : 'Sin dato');

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="mb-2">
        <h1 className="app-mobile-title">
          Telegram
        </h1>
        <p className="mt-1 text-[15px] font-semibold text-slate-500">
          Actividad y acciones del asistente
        </p>
      </header>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="app-card-soft flex flex-col p-4 text-center items-center justify-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-[var(--qlm-radius-md)] bg-blue-100 text-blue-600 shadow-sm">
            <MessageSquare size={20} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Recibidos</p>
          <p className="text-[22px] font-black text-slate-900">{totalReceived}</p>
        </div>
        
        <div className="app-card-soft flex flex-col p-4 text-center items-center justify-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-[var(--qlm-radius-md)] bg-emerald-100 text-emerald-600 shadow-sm">
            <ListTodo size={20} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Clasificados</p>
          <p className="text-[22px] font-black text-slate-900">{totalClassified}</p>
        </div>

        <div className="app-card-soft flex flex-col p-4 text-center items-center justify-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-[var(--qlm-radius-md)] bg-slate-200 text-slate-600 shadow-sm">
            <XCircle size={20} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Ignorados</p>
          <p className="text-[22px] font-black text-slate-900">{totalIgnored}</p>
        </div>

        <div className="app-card-soft flex flex-col p-4 text-center items-center justify-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-[var(--qlm-radius-md)] bg-amber-100 text-amber-600 shadow-sm">
            <Clock size={20} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pendientes</p>
          <p className="text-[22px] font-black text-slate-900">{totalPending}</p>
        </div>

        <div className="app-card-soft flex flex-col p-4 text-center items-center justify-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-[var(--qlm-radius-md)] bg-purple-100 text-purple-600 shadow-sm">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tareas</p>
          <p className="text-[22px] font-black text-slate-900">{totalConfirmed}</p>
        </div>

        <div className="app-card-soft flex flex-col p-4 text-center items-center justify-center">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-[var(--qlm-radius-md)] bg-red-100 text-red-600 shadow-sm">
            <XCircle size={20} />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Canceladas</p>
          <p className="text-[22px] font-black text-slate-900">{totalCancelled}</p>
        </div>
      </div>

      {/* Logs Recientes */}
      <section className="pt-4">
        <h2 className="app-section-title">Mensajes Recientes</h2>
        
        <div className="-mx-4 overflow-x-auto px-4 mb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:-mx-8 md:px-8">
          <div className="flex gap-2 pb-2">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'classified', label: 'Clasificados' },
              { id: 'unclassified', label: 'Sin clasificar' },
              { id: 'bot', label: 'Ignorados' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setLogFilter(f.id as any)}
                className={`app-pill shrink-0 ${
                  logFilter === f.id
                    ? '!bg-[var(--qlm-primary)] !text-white !border-none'
                    : ''
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLogs.slice(0, 12).map((log) => {
            const isBot = isBotMessage(log.message_text);
            const isClassified = !!log.ai_raw_response?.section?.sectionId;
            const section = safeStr(log.ai_raw_response?.section?.sectionId);
            const itemType = safeStr(log.ai_raw_response?.itemType);
            const title = safeStr(log.ai_raw_response?.extractedData?.title);

            return (
              <div key={log.id} className={`app-card flex flex-col p-5 ${isBot ? 'opacity-75' : ''}`}>
                <div className="mb-3 flex items-center justify-between text-[12px]">
                  <span className="font-bold text-slate-400">{prettyDate(log.created_at)}</span>
                  <span className="font-semibold text-slate-500">@{safeStr(log.telegram_username)}</span>
                </div>
                
                {isBot && (
                  <span className="mb-2 w-max rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Mensaje del bot
                  </span>
                )}
                
                <p className="mb-4 flex-1 text-[15px] font-medium leading-relaxed text-slate-700 italic">"{safeStr(log.message_text)}"</p>
                
                <div className="mt-auto space-y-2 rounded-[var(--qlm-radius-md)] bg-slate-50 p-4 text-[13px]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-400">Estado</span>
                    <span className={`rounded-full px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider ${isBot ? 'bg-slate-200 text-slate-600' : isClassified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {isBot ? 'Ignorado' : isClassified ? 'Clasificado' : 'Sin clasificar'}
                    </span>
                  </div>
                  {isClassified && !isBot && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-400">Sección</span>
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 font-bold capitalize text-blue-700">{section}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-400">Tipo</span>
                        <span className="font-bold capitalize text-slate-700">{itemType}</span>
                      </div>
                      <div className="flex flex-col mt-3 pt-3 border-t border-slate-200">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Título detectado</span>
                        <span className="font-semibold text-slate-800 line-clamp-3">{title}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {filteredLogs.length === 0 && (
            <div className="col-span-full app-card-soft py-12 text-center">
              <p className="app-muted font-semibold">Todavía no hay mensajes recibidos.</p>
            </div>
          )}
        </div>
      </section>

      {/* Acciones Pendientes */}
      <section className="pt-4">
        <h2 className="app-section-title">Acciones</h2>
        
        <div className="-mx-4 overflow-x-auto px-4 mb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:-mx-8 md:px-8">
          <div className="flex gap-2 pb-2">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'pending', label: 'Pendientes' },
              { id: 'confirmed', label: 'Confirmadas' },
              { id: 'cancelled', label: 'Canceladas' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActionFilter(f.id as any)}
                className={`app-pill shrink-0 ${
                  actionFilter === f.id
                    ? '!bg-[var(--qlm-primary)] !text-white !border-none'
                    : ''
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredActions.map((action) => {
            const title = safeStr(action.payload?.title);
            const section = safeStr(action.payload?.section_id);
            const priority = safeStr(action.payload?.priority);
            const due = safeStr(action.payload?.due_date);
            const dirty = isDirtyTitle(title);

            return (
              <div key={action.id} className="app-card flex flex-col p-5 relative">
                <div className="mb-3 flex items-center justify-between text-[12px]">
                  <span className="font-bold text-slate-400">{prettyDate(action.created_at)}</span>
                  <span className={`rounded-full px-2 py-0.5 font-bold text-[10px] uppercase tracking-wider ${
                    action.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    action.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {action.status}
                  </span>
                </div>
                
                {dirty && (
                  <div className="mb-3 flex items-center gap-1.5 rounded-[var(--qlm-radius-sm)] bg-red-50 p-2 text-[11px] font-bold uppercase tracking-wider text-red-600 border border-red-100">
                    <AlertTriangle size={14} />
                    Registro viejo / sucio
                  </div>
                )}
                
                <h3 className="mb-1 text-[18px] font-bold text-slate-900 leading-snug line-clamp-3">{title}</h3>
                <p className="mb-4 text-[11px] font-bold uppercase tracking-wider text-[var(--qlm-primary)]">{action.action_type}</p>

                <div className="mt-auto space-y-2 rounded-[var(--qlm-radius-md)] bg-slate-50 p-4 text-[13px]">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-400">Sección</span>
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 font-bold capitalize text-blue-700">{section}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-400">Prioridad</span>
                    <span className="font-semibold text-slate-700">{priority}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-400">Fecha</span>
                    <span className="font-semibold text-slate-700">{due !== 'Sin dato' ? prettyDate(due) : due}</span>
                  </div>
                </div>
                
                {(action.confirmed_at || action.cancelled_at) && (
                  <div className="mt-3 text-right text-[11px] font-bold text-slate-400">
                    Resuelto: {prettyDate(action.confirmed_at || action.cancelled_at)}
                  </div>
                )}
              </div>
            );
          })}
          {filteredActions.length === 0 && (
            <div className="col-span-full app-card-soft py-12 text-center">
              <p className="app-muted font-semibold">Sin acciones pendientes por ahora.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
