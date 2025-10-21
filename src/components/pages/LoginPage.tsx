import type { FC } from 'react';
import { useState } from 'react';
import clsx from 'clsx';

interface LoginPageProps {
  onLogin: (credentials: { email: string; password: string }) => Promise<boolean>;
  loading?: boolean;
  error?: string | null;
}

const formFields = [
  {
    id: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'you@example.com'
  },
  {
    id: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password'
  }
] as const;

export const LoginPage: FC<LoginPageProps> = ({ onLogin, loading = false, error }) => {
  const [formState, setFormState] = useState({
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState(false);

  const handleChange = (field: 'email' | 'password', value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setTouched(true);
    if (!formState.email || !formState.password) {
      return;
    }
    await onLogin(formState);
  };

  const isInvalid = touched && (!formState.email || !formState.password);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(16,185,129,0.12),_transparent_50%)] opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-[conic-gradient(from_90deg_at_50%_50%,_rgba(56,189,248,0.08),_transparent_45%)] blur-[120px]" />
      <div className="relative mx-4 w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/10 p-10 text-slate-100 shadow-[0_30px_80px_rgba(14,116,144,0.25)] backdrop-blur-xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-300">
            Falta EMS
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white lg:text-3xl">
            Access the Energy Meter Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-300/80">
            Sign in with the credentials shared by your administrator.
          </p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {formFields.map((field) => (
            <label key={field.id} className="block text-left">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                {field.label}
              </span>
              <input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                autoComplete={field.id === 'password' ? 'current-password' : 'email'}
                value={formState[field.id]}
                onChange={(event) => handleChange(field.id, event.target.value)}
                className={clsx(
                  'mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium tracking-[0.1em] text-white shadow-[0_18px_45px_rgba(14,165,233,0.2)] outline-none transition focus:border-brand-300 focus:bg-white/15 focus:ring-2 focus:ring-brand-300/60',
                  'placeholder:text-slate-400'
                )}
                required
              />
            </label>
          ))}

          {error && (
            <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">
              {error}
            </div>
          )}

          {isInvalid && !error && (
            <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Please enter both email and password.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-[0_20px_50px_rgba(14,165,233,0.45)] transition focus:outline-none focus:ring-2 focus:ring-brand-200 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <span className="absolute inset-0 h-full w-full translate-x-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition group-hover:translate-x-[0] group-hover:opacity-100" />
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-400">
          Need access? Contact your system administrator.
        </p>
      </div>
    </div>
  );
};
