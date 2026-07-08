import { FormEvent, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LockKeyhole, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { authService } from '../services/authService';

export function LoginPage() {
  const [email, setEmail] = useState('derlis@quantum.local');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  if (authService.current()) {
    return <Navigate to="/dashboard" />;
  }

  function submit(event: FormEvent) {
    event.preventDefault();

    try {
      authService.login(email, password);
      location.href = '/dashboard';
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <main className="flex min-h-screen items-center bg-[#F8FAFC] p-5">
      <section className="mx-auto w-full max-w-md">
        <div className="mb-6 rounded-[2.5rem] bg-slate-950 p-6 text-white shadow-soft">
          <div className="grid h-14 w-14 place-items-center rounded-3xl bg-blue-600">
            <Sparkles size={27} />
          </div>

          <p className="mt-7 text-sm font-black uppercase tracking-wide text-blue-200">
            App privada
          </p>

          <h1 className="mt-2 text-4xl font-black leading-none tracking-[-0.05em]">
            Quantum Life Manager
          </h1>

          <p className="mt-4 text-[16px] leading-relaxed text-slate-300">
            Tu vida, tareas, agenda y proyectos en una experiencia móvil simple
            y premium.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="rounded-[2.25rem] border border-slate-100 bg-white p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">
              <LockKeyhole size={23} />
            </span>

            <div>
              <h2 className="text-xl font-black tracking-[-0.03em] text-slate-950">
                Ingresar
              </h2>

              <p className="text-sm font-semibold text-slate-500">
                Modo mock/localStorage
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
            />

            <Input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              type="password"
            />

            {error && (
              <p className="rounded-2xl bg-red-50 p-3 text-sm font-bold text-red-700">
                {error}
              </p>
            )}

            <Button className="min-h-14 w-full text-base">Entrar</Button>
          </div>

          <div className="mt-5 rounded-3xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
            <b>Credenciales:</b>
            <br />
            derlis@quantum.local · daniel@quantum.local ·
            gabriela@quantum.local
            <br />
            Password: 123456
          </div>
        </form>
      </section>
    </main>
  );
}