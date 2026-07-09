import { useState, useEffect, useCallback } from 'react';
import { SectionCard } from '../components/cards/SectionCard';
import { authService } from '../services/authService';
import { sectionRepository } from '../services/repositories';
import { Link } from 'react-router-dom';
import { Section } from '../types';

export function SectionsPage() {
  const user = authService.current()!;
  
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sectionRepository.listSections();
      setSections(data.filter((s) => s && s.id && user.sections.includes(s.id)));
    } catch (err: any) {
      setError(err.message || 'Error al cargar secciones');
    } finally {
      setLoading(false);
    }
  }, [user.sections]);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  return (
    <div className="space-y-5">
      <h2 className="text-[32px] font-black tracking-[-0.04em] text-slate-950">
        Más
      </h2>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm font-semibold text-slate-400">
          Cargando secciones...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((s) => (
            <SectionCard key={s.id} section={s} />
          ))}
        </div>
      )}

      <Link
        to="/notes"
        className="block rounded-[2rem] bg-white p-6 text-[18px] font-black tracking-tight shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md"
      >
        Notas
      </Link>

      <Link
        to="/settings"
        className="block rounded-[2rem] bg-white p-6 text-[18px] font-black tracking-tight shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md"
      >
        Configuración
      </Link>
    </div>
  );
}
