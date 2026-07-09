import { FormEvent, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LockKeyhole, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
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
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm font-semibold text-slate-400">Cargando...</p>
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
    <main className="flex min-h-screen items-center bg-[#F8FAFC] p-4 md:p-6">
      <section className="mx-auto w-full max-w-md">
        <div className="mb-6 rounded-[2rem] bg-slate-950 p-6 text-white shadow-soft md:rounded-[2.5rem]">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-blue-600">
            <Sparkles size={32} />
          </div>

          <p className="mt-8 text-sm font-black uppercase tracking-wide text-blue-200">
            App privada
          </p>

          <h1 className="mt-2 text-[32px] font-black leading-none tracking-[-0.05em] md:text-4xl">
            Quantum Life Manager
          </h1>

          <p className="mt-4 text-[16px] leading-relaxed text-slate-300">
            Tu vida, tareas, agenda y proyectos en una experiencia móvil simple
            y premium.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm md:rounded-[2.25rem] md:p-6"
        >
          <div className="mb-5 flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-700">
              <LockKeyhole size={28} />
            </span>

            <div>
              <h2 className="text-[22px] font-black tracking-[-0.03em] text-slate-950">
                Ingresar
              </h2>

              <p className="text-[15px] font-semibold text-slate-500">
                Identificación segura
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              className="min-h-[56px] text-[16px]"
              disabled={loading}
            />

            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              type="password"
              className="min-h-[56px] text-[16px]"
              disabled={loading}
            />

            {error && (
              <p className="rounded-2xl bg-red-50 p-4 text-[15px] font-bold text-red-700">
                {error}
              </p>
            )}

            <Button className="min-h-[56px] w-full text-[18px]" disabled={loading}>
              {loading ? 'Ingresando...' : 'Entrar'}
            </Button>
          </div>

          <div className="mt-5 rounded-3xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
            <b>Credenciales (Mock):</b>
            <br />
            derlis@quantum.local · daniel@quantum.local · gabriela@quantum.local
            <br />
            Password: 123456
          </div>
        </form>
      </section>
    </main>
  );
}