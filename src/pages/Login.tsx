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
  // State must start empty - no storage values
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    // Reset to empty - no stored values
    setFormState({ email: '', password: '' });
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      {/* Animated Background Grid with Multiple Layers */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0ea5e920_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e920_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] motion-safe:animate-[grid-flow_20s_linear_infinite]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d420_1px,transparent_1px),linear-gradient(to_bottom,#06b6d420_1px,transparent_1px)] bg-[size:8rem_8rem] [mask-image:radial-gradient(ellipse_60%_40%_at_50%_50%,#000_60%,transparent_100%)] motion-safe:animate-[grid-flow_30s_linear_infinite_reverse]" />
      </div>

      {/* Scan Lines Effect */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(14,165,233,0.03)_50%)] bg-[size:100%_4px] opacity-40" />

      {/* Radial Pulse from Center */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-96 w-96 animate-[pulse-ring_4s_ease-out_infinite] rounded-full border-2 border-brand-500/30" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-[pulse-ring_4s_ease-out_infinite_1s] rounded-full border-2 border-cyan-500/20" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 animate-[pulse-ring_4s_ease-out_infinite_2s] rounded-full border-2 border-purple-500/20" />
      </div>

      {/* Rotating Rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] animate-[spin_40s_linear_infinite] rounded-full border border-brand-500/10" />
        <div className="absolute h-[700px] w-[700px] animate-[spin_50s_linear_infinite_reverse] rounded-full border border-cyan-500/10" />
        <div className="absolute h-[800px] w-[800px] animate-[spin_60s_linear_infinite] rounded-full border border-purple-500/10" />
      </div>
      
      {/* Enhanced Floating Orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-1/4 h-72 w-72 animate-float rounded-full bg-gradient-to-r from-brand-500/30 to-purple-500/30 opacity-20 blur-[100px] motion-safe:animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute right-1/4 top-1/3 h-96 w-96 animate-float rounded-full bg-gradient-to-r from-cyan-500/30 to-blue-500/30 opacity-20 blur-[120px] motion-safe:animate-[float_10s_ease-in-out_infinite_2s]" />
        <div className="absolute bottom-1/4 left-1/3 h-80 w-80 animate-float rounded-full bg-gradient-to-r from-violet-500/30 to-pink-500/30 opacity-20 blur-[100px] motion-safe:animate-[float_12s_ease-in-out_infinite_4s]" />
        <div className="absolute right-1/3 bottom-1/3 h-64 w-64 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-20 blur-[90px] motion-safe:animate-[float_14s_ease-in-out_infinite_1s]" />
        <div className="absolute left-1/2 top-1/2 h-56 w-56 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 opacity-20 blur-[80px] motion-safe:animate-[float_16s_ease-in-out_infinite_3s]" />
      </div>

      {/* Enhanced Particle Effect with Different Sizes */}
      <div className="pointer-events-none absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float rounded-full bg-brand-300/40"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 12}s`,
              boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(14, 165, 233, 0.5)`
            }}
          />
        ))}
      </div>

      {/* Floating Light Beams */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-1/4 top-0 h-full w-1 bg-gradient-to-b from-transparent via-brand-500/20 to-transparent opacity-50 motion-safe:animate-[float_15s_ease-in-out_infinite]" />
        <div className="absolute left-1/3 top-0 h-full w-1 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent opacity-50 motion-safe:animate-[float_18s_ease-in-out_infinite_2s]" />
        <div className="absolute right-1/4 top-0 h-full w-1 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent opacity-50 motion-safe:animate-[float_20s_ease-in-out_infinite_4s]" />
      </div>

      <div className="relative w-full max-w-md motion-safe:animate-fade-in-up">
        {/* Animated Glow effect behind card */}
        <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-500/50 via-cyan-500/50 to-purple-500/50 opacity-75 blur-2xl motion-safe:animate-pulse-slow" />
        <div className="pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-brand-500/30 opacity-50 blur-3xl motion-safe:animate-[pulse-slow_6s_ease-in-out_infinite_1s]" />
        
        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 p-8 text-white shadow-[0_0_50px_rgba(14,165,233,0.3),0_0_100px_rgba(168,85,247,0.2)] backdrop-blur-xl sm:p-10">
          {/* Multiple Animated shine effects */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent motion-safe:animate-shine" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tl from-transparent via-cyan-500/5 to-transparent motion-safe:animate-[shine_10s_ease-in-out_infinite_2s]" />
          
          {/* Corner Accents */}
          <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 bg-gradient-to-br from-brand-500/20 to-transparent blur-2xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 bg-gradient-to-tl from-purple-500/20 to-transparent blur-2xl" />
          
          {/* Inner glow */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-500/10 via-transparent to-purple-500/10" />
          
          {/* Animated Border Effect */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-r from-brand-500/0 via-brand-500/20 to-brand-500/0 motion-safe:animate-[shimmer_4s_linear_infinite]" style={{ backgroundSize: '200% 100%' }} />

          <div className="relative mb-8 text-center">
            {/* Vikram Solar Logo with animation */}
            <div className="relative mb-6 inline-block">
              <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-r from-brand-500/40 via-cyan-500/40 to-purple-500/40 opacity-75 blur-3xl motion-safe:animate-pulse-slow" />
              <div className="relative overflow-hidden rounded-2xl border-2 border-brand-300/30 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-4 shadow-[0_0_40px_rgba(14,165,233,0.5)] backdrop-blur-sm motion-safe:animate-float">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                <img
                  src={`${import.meta.env.BASE_URL}images/vikram-solar-logo.png`}
                  alt="Vikram Solar"
                  className="relative h-16 w-16 object-contain"
                />
              </div>
            </div>
            
            <p className="bg-gradient-to-r from-brand-300 via-cyan-300 to-brand-300 bg-clip-text bg-[length:200%_auto] text-xs font-bold uppercase tracking-[0.4em] text-transparent motion-safe:animate-shimmer">Falta EMS</p>
            <h1 className="mt-3 bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-3xl font-extrabold tracking-tight text-transparent drop-shadow-[0_0_30px_rgba(14,165,233,0.5)]">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-300/80">
              Choose your access type and sign in to continue.
            </p>
          </div>

          <div className="relative mb-6 flex gap-2 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-800/50 to-slate-900/50 p-1.5 text-sm font-bold uppercase tracking-[0.2em] backdrop-blur-sm">
            {modes.map((option) => {
              const isActive = option.id === mode;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleModeChange(option.id)}
                  className={`group relative flex-1 overflow-hidden rounded-xl px-4 py-3 transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-brand-500 via-cyan-500 to-brand-500 text-white shadow-[0_0_25px_rgba(14,165,233,0.6)]' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  {isActive && (
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent motion-safe:animate-shimmer" />
                  )}
                  <span className="relative z-10">{option.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative mb-8 overflow-hidden rounded-xl border border-brand-500/20 bg-gradient-to-r from-slate-800/30 via-slate-700/30 to-slate-800/30 p-4 text-center backdrop-blur-sm">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/10 to-transparent motion-safe:animate-shimmer" />
            <div className="relative flex items-center justify-center gap-2">
              <span className="text-2xl motion-safe:animate-pulse-slow">
                {mode === 'admin' ? '⚡' : '🔋'}
              </span>
              <span className="bg-gradient-to-r from-brand-300 via-cyan-300 to-brand-300 bg-clip-text bg-[length:200%_auto] text-base font-extrabold uppercase tracking-[0.3em] text-transparent motion-safe:animate-shimmer">
                {mode === 'admin' ? 'Admin Portal' : 'User Portal'}
              </span>
            </div>
          </div>

          <form className="relative space-y-6" onSubmit={handleSubmit} noValidate autoComplete="off">
            {/* Hidden decoy inputs to trap aggressive autofill */}
            <input 
              type="text" 
              name="username" 
              autoComplete="username" 
              className="hidden h-0 w-0 opacity-0 pointer-events-none absolute" 
              tabIndex={-1}
              aria-hidden="true"
            />
            <input 
              type="password" 
              name="current-password" 
              autoComplete="current-password" 
              className="hidden h-0 w-0 opacity-0 pointer-events-none absolute" 
              tabIndex={-1}
              aria-hidden="true"
            />

            <div className="group relative">
              <label className="mb-2 block text-left text-xs font-bold uppercase tracking-[0.3em] text-brand-300/90">
                Email / Username
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="h-5 w-5 text-brand-400/60 transition-colors group-focus-within:text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="username"
                  id={`email-${mode}`}
                  autoComplete="username"
                  inputMode="email"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, email: event.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 py-3.5 pl-12 pr-4 text-sm font-medium tracking-wide text-white outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-slate-500 focus:border-brand-400/50 focus:bg-slate-800/70 focus:shadow-[0_0_20px_rgba(14,165,233,0.3)] focus:ring-2 focus:ring-brand-400/30"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="group relative">
              <label className="mb-2 block text-left text-xs font-bold uppercase tracking-[0.3em] text-brand-300/90">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <svg className="h-5 w-5 text-brand-400/60 transition-colors group-focus-within:text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id={`password-${mode}`}
                  autoComplete="current-password"
                  value={formState.password}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, password: event.target.value }))
                  }
                  className="w-full rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 py-3.5 pl-12 pr-12 text-sm font-medium tracking-wide text-white outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-slate-500 focus:border-brand-400/50 focus:bg-slate-800/70 focus:shadow-[0_0_20px_rgba(14,165,233,0.3)] focus:ring-2 focus:ring-brand-400/30"
                  placeholder="••••••••"
                  required
                />
                {formState.password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-brand-400/60 transition-all duration-200 hover:text-brand-300 focus:outline-none animate-in fade-in zoom-in-50"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="relative overflow-hidden rounded-xl border border-rose-400/50 bg-gradient-to-r from-rose-900/40 to-red-900/40 p-4 shadow-[0_0_20px_rgba(244,63,94,0.3)] backdrop-blur-sm motion-safe:animate-shake">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-rose-500/10 to-transparent motion-safe:animate-shimmer" />
                <div className="relative flex items-center gap-3">
                  <svg className="h-5 w-5 flex-shrink-0 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm font-semibold text-rose-200">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-brand-500 via-cyan-500 to-brand-500 px-6 py-4 text-sm font-bold uppercase tracking-[0.3em] text-white shadow-[0_0_40px_rgba(14,165,233,0.5)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(14,165,233,0.8)] focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]"
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent motion-safe:animate-shimmer" />
              <div className="relative flex items-center justify-center gap-3">
                {isSubmitting ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Login</span>
                  </>
                )}
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
