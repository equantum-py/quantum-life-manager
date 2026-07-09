import { Navigate, Outlet, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { useEffect, useState } from 'react';
import { User } from '../types';

export function ProtectedRoute() {
  const { sectionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    authService.initialize().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm font-semibold text-slate-400">Verificando sesión...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (sectionId && !user.sections.includes(sectionId as never)) {
    return <Navigate to="/sections" replace />;
  }

  return <Outlet />;
}
