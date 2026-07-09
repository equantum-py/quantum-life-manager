import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectCard } from '../components/cards/ProjectCard';
import { TaskCard } from '../components/cards/TaskCard';
import { MeetingCard } from '../components/cards/MeetingCard';
import { Section, Task, Meeting, Project } from '../types';
import {
  sectionRepository,
  taskRepository,
  meetingRepository,
  projectRepository,
} from '../services/repositories';

export function SectionDetailPage() {
  const { sectionId } = useParams();
  
  const [section, setSection] = useState<Section | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!sectionId) return;
    try {
      setLoading(true);
      setError(null);
      
      const [allSections, allTasks, allMeetings, allProjects] = await Promise.all([
        sectionRepository.listSections(),
        taskRepository.listTasks(),
        meetingRepository.listMeetings(),
        projectRepository.listProjects(),
      ]);

      setSection(allSections.find((s) => s && s.id === sectionId) || null);
      setTasks(allTasks.filter((t) => t && t.sectionId === sectionId));
      setMeetings(allMeetings.filter((m) => m && m.sectionId === sectionId));
      
      if (sectionId === 'equantum') {
        setProjects(allProjects.filter((p) => p && p.sectionId === sectionId));
      }

    } catch (err: any) {
      setError(err.message || 'Error al cargar detalles de la sección');
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="py-12 text-center text-sm font-semibold text-slate-400">
        Cargando área...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-600">
        {error}
      </div>
    );
  }

  if (!section) {
    return (
      <div className="py-12 text-center text-sm font-semibold text-slate-400">
        Área no encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[2rem] bg-white p-5 shadow-sm">
        <h2 className="text-2xl font-extrabold">{section.name}</h2>
        <p className="mt-2 text-slate-500">{section.description}</p>
      </section>

      <h3 className="font-bold">Tareas</h3>
      {tasks.length === 0 ? (
        <p className="text-sm text-slate-400">Sin tareas en esta área.</p>
      ) : (
        tasks.map((t) => <TaskCard key={t.id} task={t} />)
      )}

      <h3 className="font-bold">Agenda</h3>
      {meetings.length === 0 ? (
        <p className="text-sm text-slate-400">Sin eventos en esta área.</p>
      ) : (
        meetings.map((m) => <MeetingCard key={m.id} meeting={m} />)
      )}

      {sectionId === 'equantum' && (
        <>
          <h3 className="font-bold">Proyectos eQuantum</h3>
          {projects.length === 0 ? (
            <p className="text-sm text-slate-400">Sin proyectos.</p>
          ) : (
            projects.map((p) => <ProjectCard key={p.id} project={p} />)
          )}
        </>
      )}
    </div>
  );
}
