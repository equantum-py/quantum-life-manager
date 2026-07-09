import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Meeting } from '../types';
import { MeetingCard } from '../components/cards/MeetingCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { mockSections } from '../data/mockSections';
import { authService } from '../services/authService';
import { meetingRepository } from '../services/repositories';
import { todayISO } from '../utils/dates';

export function AgendaPage() {
  const user = authService.current()!;
  
  const [items, setItems] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Meeting | null>(null);

  const loadMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await meetingRepository.listMeetings();
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar agenda');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const allowed = mockSections.filter((s) => user.sections.includes(s.id));
  const visible = items
    .filter((m) => user.sections.includes(m.sectionId))
    .sort((a, b) => `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`));

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      title: f.get('title') as string,
      description: f.get('description') as string,
      sectionId: f.get('sectionId') as any,
      date: f.get('date') as string,
      startTime: f.get('startTime') as string,
      endTime: f.get('endTime') as string,
      location: f.get('location') as string,
      type: f.get('type') as any,
      participants: String(f.get('participants'))
        .split(',')
        .map((x) => x.trim()),
      status: 'Programada',
    };

    try {
      if (editing) {
        await meetingRepository.updateMeeting(editing.id, payload);
      } else {
        await meetingRepository.createMeeting(payload);
      }
      await loadMeetings();
      setOpen(false);
      setEditing(null);
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar evento?')) return;
    try {
      await meetingRepository.deleteMeeting(id);
      await loadMeetings();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="app-mobile-title">
          Agenda
        </h2>
        <Button
          onClick={() => setOpen(true)}
          className="min-h-12 rounded-[var(--qlm-radius-md)] px-5"
        >
          Nuevo
        </Button>
      </div>

      <div className="app-card-soft p-5">
        <p className="text-[15px] font-medium text-slate-600">
          <strong className="text-slate-900 font-bold">Hoy:</strong> {visible.filter((m) => m.date === todayISO()).length}{' '}
          eventos · <strong className="text-slate-900 font-bold">Próximos:</strong>{' '}
          {visible.filter((m) => m.date >= todayISO()).length}
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm font-semibold text-slate-400">
          Cargando agenda...
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((m) => (
            <MeetingCard
              key={m.id}
              meeting={m}
              onEdit={() => {
                setEditing(m);
                setOpen(true);
              }}
              onDelete={() => handleDelete(m.id)}
            />
          ))}
        </div>
      )}

      <Modal
        open={open}
        title={editing ? 'Editar evento' : 'Nuevo evento'}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
      >
        <form onSubmit={save} className="space-y-4">
          <Input
            name="title"
            defaultValue={editing?.title}
            placeholder="Título"
            required
          />
          <Textarea
            name="description"
            defaultValue={editing?.description}
            placeholder="Descripción"
          />
          <Select
            name="sectionId"
            defaultValue={editing?.sectionId || allowed[0]?.id}
          >
            {allowed.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Input
            name="date"
            type="date"
            defaultValue={editing?.date || todayISO()}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              name="startTime"
              type="time"
              defaultValue={editing?.startTime || '09:00'}
            />
            <Input
              name="endTime"
              type="time"
              defaultValue={editing?.endTime || '10:00'}
            />
          </div>
          <Input
            name="location"
            defaultValue={editing?.location}
            placeholder="Ubicación o link"
          />
          <Select name="type" defaultValue={editing?.type || 'Reunión'}>
            {[
              'Reunión',
              'Entrega',
              'Evento',
              'Recordatorio',
              'Actividad',
              'Clase',
              'Llamada',
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>
          <Input
            name="participants"
            defaultValue={editing?.participants.join(', ') || user.name}
            placeholder="Participantes"
          />
          <Button className="min-h-[56px] w-full text-[16px]">Guardar</Button>
        </form>
      </Modal>
    </div>
  );
}
