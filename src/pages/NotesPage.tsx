import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { Note } from '../types';
import { NoteCard } from '../components/cards/NoteCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { mockSections } from '../data/mockSections';
import { noteRepository } from '../services/repositories';
import { authService } from '../services/authService';

export function NotesPage() {
  const user = authService.current()!;
  
  const [items, setItems] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState('');
  const [section, setSection] = useState('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Note | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await noteRepository.listNotes();
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar notas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const allowed = mockSections.filter((s) => user.sections.includes(s.id));
  
  const visible = items.filter(
    (n) =>
      user.sections.includes(n.sectionId) &&
      (section === 'all' || n.sectionId === section) &&
      `${n.title} ${n.content}`.toLowerCase().includes(q.toLowerCase())
  );

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = {
      title: f.get('title') as string,
      content: f.get('content') as string,
      sectionId: f.get('sectionId') as any,
      category: f.get('category') as string,
    };

    try {
      if (editing) {
        await noteRepository.updateNote(editing.id, payload);
      } else {
        await noteRepository.createNote(payload);
      }
      await loadNotes();
      setOpen(false);
      setEditing(null);
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar nota?')) return;
    try {
      await noteRepository.deleteNote(id);
      await loadNotes();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="app-mobile-title">
          Notas
        </h2>
        <Button
          onClick={() => setOpen(true)}
          className="min-h-12 rounded-[var(--qlm-radius-md)] px-5"
        >
          Nueva
        </Button>
      </div>

      <div className="space-y-4">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar notas..."
          className="min-h-14 rounded-[var(--qlm-radius-md)] text-[16px] shadow-sm border-white/60"
        />

        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:-mx-8 md:px-8">
          <div className="flex gap-2 pb-2">
            <button
              onClick={() => setSection('all')}
              className={`app-pill shrink-0 ${section === 'all' ? '!bg-[var(--qlm-primary)] !text-white !border-none' : ''}`}
            >
              Todas las áreas
            </button>
            {allowed.map((s) => (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={`app-pill shrink-0 ${section === s.id ? '!bg-[var(--qlm-primary)] !text-white !border-none' : ''}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-[var(--qlm-radius-md)] bg-red-50 p-4 text-[14px] font-bold text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-[15px] font-semibold text-slate-400">
          Cargando notas...
        </div>
      ) : (
        <div className="space-y-4">
          {visible.length > 0 ? (
            visible.map((n) => (
              <NoteCard
                key={n.id}
                note={n}
                onEdit={() => {
                  setEditing(n);
                  setOpen(true);
                }}
                onDelete={() => handleDelete(n.id)}
              />
            ))
          ) : (
            <div className="app-card-soft p-8 text-center text-slate-500 font-medium">
              Todavía no hay notas guardadas.
            </div>
          )}
        </div>
      )}

      <Modal
        open={open}
        title={editing ? 'Editar nota' : 'Nueva nota'}
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
            name="content"
            defaultValue={editing?.content}
            placeholder="Contenido"
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
            name="category"
            defaultValue={editing?.category || 'General'}
            placeholder="Categoría"
          />
          <Button className="min-h-[56px] w-full text-[16px]">Guardar</Button>
        </form>
      </Modal>
    </div>
  );
}
