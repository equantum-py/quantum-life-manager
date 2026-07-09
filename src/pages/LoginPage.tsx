import { FormEvent, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { authService } from '../services/authService';

export function LoginPage() {
  const [email, setEmail] = useState('derlis@quantum.local');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authService.initialize().then((u) => {
      if (u) {
        location.href = '/dashboard';
      } else {
        setInitializing(false);
      }
    });
  }, []);

  if (initializing) {
    return (
      <div className="app-shell items-center justify-center">
        <p className="app-muted font-semibold">Cargando...</p>
      </div>
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.login(email, password);
      location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
      setLoading(false);
    }
  }

  return (
    <main className="app-shell flex-col justify-center p-4 md:p-8">
      <section className="mx-auto w-full max-w-sm">
        
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 grid h-[72px] w-[72px] place-items-center rounded-[var(--qlm-radius-xl)] bg-[var(--qlm-primary)] text-white shadow-[var(--qlm-shadow-soft)]">
            <Sparkles size={36} strokeWidth={2.5} />
          </div>

          <h1 className="app-mobile-title mb-3">
            Bienvenido a Quantum
          </h1>

          <p className="app-muted text-[16px] leading-relaxed">
            Tu vida, tareas, agenda y proyectos en una experiencia móvil simple
            y premium.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="md:app-card space-y-5"
        >
          <div className="space-y-4">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              className="app-input"
              disabled={loading}
            />

            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Contraseña"
              type="password"
              className="app-input"
              disabled={loading}
            />

            {error && (
              <p className="rounded-2xl bg-red-50 p-4 text-[15px] font-bold text-red-700">
                {error}
              </p>
            )}

            <button type="submit" className="app-button-primary w-full text-[17px] mt-2" disabled={loading}>
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>
          </div>

          <div className="mt-8 rounded-[var(--qlm-radius-md)] bg-white/40 p-4 text-sm leading-relaxed text-slate-500 text-center border border-slate-200/50">
            <b>Credenciales (Mock):</b>
            <br />
            derlis@quantum.local
            <br />
            Password: 123456
          </div>
        </form>
      </section>
    </main>
  );
}