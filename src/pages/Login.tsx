import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { adminClient } from '../api/adminClient';
import { userClient } from '../api/userClient';
import { getSession, setSession, type UserRole } from '../auth/session';
import { STORAGE_KEYS } from '../lib/config';

type LoginMode = UserRole;

interface LoginResponse {
  token: string;
  admin?: { email?: string };
  user?: { email?: string };
  [key: string]: unknown;
}

const modes: Array<{ id: LoginMode; label: string }> = [
  { id: 'user', label: 'User Login' },
  { id: 'admin', label: 'Admin Login' }
];

export const Login = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<LoginMode>('user');
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextPath = useMemo(() => {
    const raw = params.get('next');
    if (!raw) {
      return null;
    }
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }, [params]);

  useEffect(() => {
    const session = getSession();
    if (!session || !session.token) {
      return;
    }
    const defaultRoute = session.role === 'admin' ? '/admin' : '/app';
    const isNextAllowed =
      nextPath != null &&
      ((session.role === 'admin' && nextPath.startsWith('/admin')) ||
        (session.role === 'user' && nextPath.startsWith('/app')));
    navigate(isNextAllowed ? nextPath : defaultRoute, { replace: true });
  }, [navigate, nextPath]);

  const handleModeChange = (nextMode: LoginMode) => {
    setMode(nextMode);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.email || !formState.password) {
      setError('Please provide both email and password.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const client = mode === 'admin' ? adminClient : userClient;
    try {
      const endpoint = mode === 'admin' ? '/api/admin/login' : '/api/login';
      const response = await client.post<LoginResponse>(endpoint, {
        email: formState.email,
        password: formState.password
      });
      if (!response.data?.token) {
        throw new Error('Missing token in response');
      }
      const token = response.data.token;
      setSession({ role: mode, token });
      if (mode === 'admin') {
        const adminEmail =
          (response.data.admin?.email as string | undefined)?.trim() || formState.email.trim();
        try {
          localStorage.setItem(STORAGE_KEYS.adminToken, token);
          localStorage.setItem(STORAGE_KEYS.adminEmail, adminEmail);
        } catch {
          // ignore localStorage write issues
        }
      } else {
        try {
          localStorage.removeItem(STORAGE_KEYS.adminToken);
          localStorage.removeItem(STORAGE_KEYS.adminEmail);
        } catch {
          // ignore
        }
      }
      const destination = nextPath ?? (mode === 'admin' ? '/admin' : '/app');
      navigate(destination, { replace: true });
    } catch (err) {
      if (isAxiosError(err)) {
        const message =
          (err.response?.data as { message?: string; error?: string })?.message ??
          (err.response?.data as { error?: string })?.error ??
          err.response?.status === 401
            ? 'Invalid credentials.'
            : 'Unable to login. Please try again.';
        setError(message);
      } else {
        setError(err instanceof Error ? err.message : 'Unexpected error. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-white shadow-xl backdrop-blur sm:p-10">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-300">Falta EMS</p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-300/80">
            Choose your access type and sign in to continue.
          </p>
        </div>

        <div className="mb-6 flex rounded-full bg-white/10 p-1 text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">
          {modes.map((option) => {
            const isActive = option.id === mode;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleModeChange(option.id)}
                className={`flex-1 rounded-full px-4 py-2 transition ${
                  isActive ? 'bg-brand-400 text-slate-950 shadow-lg' : 'hover:bg-white/10'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <h2 className="mb-6 text-center text-lg font-semibold uppercase tracking-[0.3em] text-slate-200">
          {mode === 'admin' ? 'Admin Portal' : 'User Portal'}
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <label className="block text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
            Email / Username
            <input
              type="email"
              autoComplete="email"
              value={formState.email}
              onChange={(event) =>
                setFormState((current) => ({ ...current, email: event.target.value }))
              }
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium tracking-[0.1em] text-white outline-none transition focus:border-brand-300 focus:bg-white/15 focus:ring-2 focus:ring-brand-300/60 placeholder:text-slate-400"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block text-left text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={formState.password}
              onChange={(event) =>
                setFormState((current) => ({ ...current, password: event.target.value }))
              }
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium tracking-[0.1em] text-white outline-none transition focus:border-brand-300 focus:bg-white/15 focus:ring-2 focus:ring-brand-300/60 placeholder:text-slate-400"
              placeholder="********"
              required
            />
          </label>

          {error && (
            <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-[0_20px_50px_rgba(14,165,233,0.45)] transition focus:outline-none focus:ring-2 focus:ring-brand-200 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{isSubmitting ? 'Logging in...' : 'Login'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
