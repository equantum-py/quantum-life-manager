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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[32px] font-black tracking-[-0.04em] text-slate-950">
          Notas
        </h2>
        <Button
          onClick={() => setOpen(true)}
          className="min-h-[48px] rounded-2xl px-5"
        >
          Nueva
        </Button>
      </div>

      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar notas..."
        className="min-h-[56px] text-[16px]"
      />

      <Select
        value={section}
        onChange={(e) => setSection(e.target.value)}
        className="min-h-[56px] text-[16px]"
      >
        <option value="all">Todas las áreas</option>
        {allowed.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm font-semibold text-slate-400">
          Cargando notas...
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((n) => (
            <NoteCard
              key={n.id}
              note={n}
              onEdit={() => {
                setEditing(n);
                setOpen(true);
              }}
              onDelete={() => handleDelete(n.id)}
            />
          ))}
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
