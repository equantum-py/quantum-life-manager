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
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <p className="text-sm font-semibold text-slate-400">Cargando datos de Telegram...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <p className="text-sm font-semibold text-red-500">{error}</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-full min-h-[50vh] items-center justify-center">
        <p className="text-sm font-semibold text-slate-400">No tenés permiso para ver este panel.</p>
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
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Telegram <span className="text-blue-600">Admin</span>
        </h1>
        <p className="mt-2 text-slate-500">
          Auditoría de mensajes y acciones del bot.
        </p>
      </header>

      {/* Resumen */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <MessageSquare size={16} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Recibidos</p>
          <p className="text-xl font-bold text-slate-900">{totalReceived}</p>
        </div>
        
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ListTodo size={16} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Clasificados</p>
          <p className="text-xl font-bold text-slate-900">{totalClassified}</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <XCircle size={16} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Ignorados</p>
          <p className="text-xl font-bold text-slate-900">{totalIgnored}</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock size={16} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Pendientes</p>
          <p className="text-xl font-bold text-slate-900">{totalPending}</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <CheckCircle2 size={16} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Tareas</p>
          <p className="text-xl font-bold text-slate-900">{totalConfirmed}</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <XCircle size={16} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Canceladas</p>
          <p className="text-xl font-bold text-slate-900">{totalCancelled}</p>
        </div>
      </div>

      {/* Logs Recientes */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-slate-900">Mensajes Recientes</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'classified', label: 'Clasificados' },
              { id: 'unclassified', label: 'Sin clasificar' },
              { id: 'bot', label: 'Ignorados / bot' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setLogFilter(f.id as any)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  logFilter === f.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
              <div key={log.id} className={`flex flex-col rounded-2xl border border-slate-100 p-4 shadow-sm ${isBot ? 'bg-slate-50 opacity-75' : 'bg-white'}`}>
                <div className="mb-3 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">{prettyDate(log.created_at)}</span>
                  <span className="font-medium text-slate-400">@{safeStr(log.telegram_username)}</span>
                </div>
                
                {isBot && (
                  <span className="mb-2 w-max rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                    Mensaje del bot / ignorado
                  </span>
                )}
                
                <p className="mb-3 flex-1 text-sm text-slate-700 italic">"{safeStr(log.message_text)}"</p>
                
                <div className="mt-auto space-y-1.5 rounded-xl bg-slate-50/50 border border-slate-100 p-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Estado:</span>
                    <span className={`rounded-full px-2 py-0.5 font-semibold text-[10px] uppercase tracking-wider ${isBot ? 'bg-slate-200 text-slate-600' : isClassified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {isBot ? 'Ignorado' : isClassified ? 'Clasificado' : 'Sin clasificar'}
                    </span>
                  </div>
                  {isClassified && !isBot && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Sección:</span>
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 font-medium capitalize text-blue-700">{section}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Tipo:</span>
                        <span className="font-medium capitalize text-slate-700">{itemType}</span>
                      </div>
                      <div className="flex flex-col mt-2 pt-2 border-t border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Título detectado</span>
                        <span className="font-medium text-slate-800 line-clamp-3">{title}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {filteredLogs.length === 0 && (
            <div className="col-span-full rounded-2xl border border-slate-100 bg-white py-12 text-center text-sm font-medium text-slate-400 shadow-sm">
              No hay logs en esta categoría.
            </div>
          )}
        </div>
      </section>

      {/* Acciones Pendientes */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-slate-900">Acciones</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Todas' },
              { id: 'pending', label: 'Pendientes' },
              { id: 'confirmed', label: 'Confirmadas' },
              { id: 'cancelled', label: 'Canceladas' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActionFilter(f.id as any)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  actionFilter === f.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
              <div key={action.id} className="flex flex-col rounded-2xl border border-slate-100 bg-white p-4 shadow-sm relative">
                <div className="mb-3 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">{prettyDate(action.created_at)}</span>
                  <span className={`rounded-full px-2 py-0.5 font-bold uppercase tracking-wider ${
                    action.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    action.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {action.status}
                  </span>
                </div>
                
                {dirty && (
                  <div className="mb-2 flex items-center gap-1.5 rounded-lg bg-red-50 p-2 text-[10px] font-bold uppercase text-red-600 border border-red-100">
                    <AlertTriangle size={14} />
                    Registro viejo de prueba
                  </div>
                )}
                
                <h3 className="mb-1 text-sm font-bold text-slate-900 leading-snug line-clamp-3">{title}</h3>
                <p className="mb-4 text-xs font-medium uppercase tracking-wider text-slate-500">{action.action_type}</p>

                <div className="mt-auto space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Sección:</span>
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 font-medium capitalize text-blue-700">{section}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Prioridad:</span>
                    <span className="font-medium text-slate-700">{priority}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Fecha:</span>
                    <span className="font-medium text-slate-700">{due !== 'Sin dato' ? prettyDate(due) : due}</span>
                  </div>
                </div>
                
                {(action.confirmed_at || action.cancelled_at) && (
                  <div className="mt-2 text-right text-[10px] font-medium text-slate-400">
                    Resuelto: {prettyDate(action.confirmed_at || action.cancelled_at)}
                  </div>
                )}
              </div>
            );
          })}
          {filteredActions.length === 0 && (
            <div className="col-span-full rounded-2xl border border-slate-100 bg-white py-12 text-center text-sm font-medium text-slate-400 shadow-sm">
              No hay acciones en esta categoría.
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
