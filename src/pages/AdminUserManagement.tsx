import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import clsx from 'clsx';
import {
  adminLogin,
  adminRegister,
  createUser,
  deleteUser,
  deleteAdmin,
  listUsers,
  listAdmins,
  resetUserPassword,
  resetAdminPassword,
  updateUser,
  updateAdmin,
  type AdminUser
} from '../lib/adminApi';
import { STORAGE_KEYS } from '../lib/config';
import { getSession } from '../auth/session';

interface AdminUserManagementProps {
  onDashboardLogout?: () => void;
  onBackToDashboard?: () => void;
}

type AccountRole = 'user' | 'admin';
type ViewMode = 'landing' | 'create' | 'existing';

const readStoredToken = () => {
  try {
    const session = getSession();
    if (session?.role === 'admin' && session.token) {
      sessionStorage.setItem(STORAGE_KEYS.adminToken, session.token);
      return session.token;
    }
  } catch {
    // ignore
  }
  try {
    return sessionStorage.getItem(STORAGE_KEYS.adminToken) ?? '';
  } catch {
    return '';
  }
};

const readStoredEmail = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.adminEmail) ?? '';
  } catch {
    return '';
  }
};

const persistAdminSession = (token: string, email: string) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.adminToken, token);
    sessionStorage.setItem(STORAGE_KEYS.adminEmail, email);
  } catch {
    // ignore
  }
};

const clearAdminSession = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.adminToken);
    sessionStorage.removeItem(STORAGE_KEYS.adminEmail);
  } catch {
    // ignore
  }
};

const STATUS_BADGES: Record<'ACTIVE' | 'DISABLED', string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-300/40',
  DISABLED: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-300/40'
};

export const AdminUserManagement = ({
  onDashboardLogout,
  onBackToDashboard
}: AdminUserManagementProps) => {
  const [adminToken, setAdminToken] = useState(() => readStoredToken());
  const [adminEmail, setAdminEmail] = useState(() => readStoredEmail());
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const mode = searchParams.get('mode');
    if (mode === 'create' || mode === 'existing') return mode;
    return 'landing';
  });

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [role, setRole] = useState<AccountRole>('user');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Separate fetch function that can be called manually
  const fetchAccounts = async () => {
    if (!adminToken || viewMode !== 'existing') {
      return;
    }
    setLoadingUsers(true);
    setLoadError(null);
    try {
      const [userData, adminData] = await Promise.all([
        listUsers(adminToken),
        listAdmins(adminToken)
      ]);
      setUsers(userData);
      setAdmins(adminData);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Failed to load accounts.';
      setLoadError(message);
      if (message.toLowerCase().includes('unauthor')) {
        clearAdminSession();
        setAdminToken('');
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    void fetchAccounts();
  }, [adminToken, viewMode]);

  // Sync viewMode with URL params
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'create' || mode === 'existing') {
      setViewMode(mode);
    } else {
      setViewMode('landing');
    }
  }, [searchParams]);

  // Auto-dismiss feedback after 10 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => {
        setFeedback(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const sortedUsers = useMemo(() => {
    const usersWithRole = users.map(u => ({ ...u, accountRole: 'user' as const }));
    const adminsWithRole = admins.map(a => ({ ...a, accountRole: 'admin' as const, status: 'ACTIVE' as const }));
    return [...usersWithRole, ...adminsWithRole].sort((a, b) => a.email.localeCompare(b.email));
  }, [users, admins]);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'landing') {
      setSearchParams({});
    } else {
      setSearchParams({ mode });
    }
  };

  const handleAdminLogin: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const result = await adminLogin({
        email: adminEmail.trim(),
        password: adminPassword
      });
      setAdminToken(result.token);
      persistAdminSession(result.token, adminEmail.trim());
      setAdminPassword('');
      setFeedback('Admin authenticated. You can now manage accounts.');
    } catch (error) {
      console.error(error);
      setAuthError(error instanceof Error ? error.message : 'Failed to authenticate admin.');
    } finally {
      setAuthLoading(false);
    }
  };

  const resetDraft = () => {
    setEmail('');
    setFullName('');
    setPassword('');
    setRole('user');
  };

  const handleCreateAccount: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!adminToken) {
      setFeedback('Authenticate as an admin before managing users.');
      return;
    }
    if (!email.trim() || !fullName.trim()) {
      setFeedback('Please provide both email and name.');
      return;
    }
    setSaving(true);
    setFeedback(null);
    try {
      if (role === 'admin') {
        if (!password.trim()) {
          setFeedback('Password is required for admin accounts.');
          setSaving(false);
          return;
        }
        await adminRegister({
          email: email.trim(),
          password: password.trim(),
          fullName: fullName.trim()
        });
        setFeedback('Admin account created. Share the credentials securely.');
      } else {
        const result = await createUser(adminToken, {
          email: email.trim(),
          fullName: fullName.trim(),
          password: password.trim() || undefined
        });
        setUsers((current) => [result.user, ...current]);
        setFeedback(
          result.credentials.temporary
            ? `User created. Temporary password: ${result.credentials.password}`
            : 'User created successfully.'
        );
      }
      resetDraft();
    } catch (error) {
      console.error(error);
      setFeedback(error instanceof Error ? error.message : 'Failed to create account.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (user: AdminUser & { accountRole?: 'user' | 'admin' }) => {
    if (!adminToken) return;
    
    // Admin accounts don't have status toggle (they're always active)
    if (user.accountRole === 'admin') {
      setFeedback('Admin accounts are always active and cannot be disabled.');
      return;
    }
    
    const nextStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    try {
      const response = await updateUser(adminToken, user.id, { status: nextStatus });
      setUsers((current) =>
        current.map((existing) => (existing.id === user.id ? response.user : existing))
      );
      setFeedback(`Updated status for ${user.email} to ${nextStatus}.`);
    } catch (error) {
      console.error(error);
      setFeedback(error instanceof Error ? error.message : 'Failed to update user status.');
    }
  };

  const handleResetPassword = async (user: AdminUser & { accountRole?: 'user' | 'admin' }) => {
    if (!adminToken) return;
    
    // Prompt for custom password
    const customPassword = window.prompt(
      `Enter a new password for ${user.email}:\n\n` +
      'Leave empty to auto-generate a temporary password.\n' +
      'Password must be at least 8 characters.'
    );
    
    // User cancelled the prompt
    if (customPassword === null) {
      return;
    }
    
    // Validate custom password if provided
    if (customPassword.trim() && customPassword.trim().length < 8) {
      setFeedback('Password must be at least 8 characters long.');
      return;
    }
    
    try {
      const isAdmin = user.accountRole === 'admin';
      const passwordToUse = customPassword.trim() || undefined;
      
      if (isAdmin) {
        const result = await resetAdminPassword(adminToken, user.id, passwordToUse);
        setFeedback(
          `New password for ${result.admin.email}: ${result.credentials.password} (${
            result.credentials.temporary ? 'auto-generated' : 'custom'
          }).`
        );
      } else {
        const result = await resetUserPassword(adminToken, user.id, passwordToUse);
        setFeedback(
          `New password for ${result.user.email}: ${result.credentials.password} (${
            result.credentials.temporary ? 'auto-generated' : 'custom'
          }).`
        );
      }
      // Refresh the accounts list to show updated password
      await fetchAccounts();
    } catch (error) {
      console.error(error);
      setFeedback(error instanceof Error ? error.message : 'Failed to reset password.');
    }
  };

  const handleDeleteAccount = async (user: AdminUser & { accountRole?: 'user' | 'admin' }) => {
    if (!adminToken) return;
    
    const isAdmin = user.accountRole === 'admin';
    const accountType = isAdmin ? 'admin' : 'user';
    const confirmed = window.confirm(`Delete ${accountType} account ${user.email}? This cannot be undone.`);
    
    if (!confirmed) {
      return;
    }
    
    try {
      if (isAdmin) {
        await deleteAdmin(adminToken, user.id);
        setAdmins((current) => current.filter((existing) => existing.id !== user.id));
      } else {
        await deleteUser(adminToken, user.id);
        setUsers((current) => current.filter((existing) => existing.id !== user.id));
      }
      setFeedback(`Removed ${accountType} ${user.email}.`);
    } catch (error) {
      console.error(error);
      setFeedback(error instanceof Error ? error.message : `Failed to delete ${accountType}.`);
    }
  };

  const handleAdminLogout = () => {
    clearAdminSession();
    setAdminToken('');
    setAdminPassword('');
    setUsers([]);
    setFeedback(null);
    if (onDashboardLogout) {
      onDashboardLogout();
    }
  };

  const showManagementUi = Boolean(adminToken);

  return (
    <div className="relative min-h-screen overflow-y-auto bg-slate-950 text-slate-100">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(17,94,89,0.25),_transparent_55%)] opacity-80" />
      <div className="pointer-events-none fixed inset-0 bg-[conic-gradient(from_90deg_at_20%_20%,_rgba(56,189,248,0.15),_transparent_45%)] blur-[120px]" />
      
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 sm:py-5 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl">
              Admin Account Management
            </h1>
            <p className="mt-1 text-xs text-slate-300/80 sm:text-sm">
              {viewMode === 'landing' && 'Choose an action to manage user accounts'}
              {viewMode === 'create' && 'Create new user or admin accounts'}
              {viewMode === 'existing' && 'View and manage existing accounts'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-200 transition hover:border-brand-300 hover:text-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:ring-offset-2 focus:ring-offset-slate-900 sm:flex-initial sm:px-4 sm:text-xs"
              >
                Dashboard
              </button>
            )}
            {showManagementUi && viewMode !== 'landing' && (
              <button
                type="button"
                onClick={() => handleViewModeChange('landing')}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-white/30 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-slate-900 sm:flex-initial sm:px-4 sm:text-xs"
              >
                ← Menu
              </button>
            )}
            {showManagementUi && (
              <button
                type="button"
                onClick={handleAdminLogout}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-200 transition hover:border-rose-300 hover:text-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:ring-offset-2 focus:ring-offset-slate-900 sm:flex-initial sm:px-4 sm:text-xs"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Feedback Message - Fixed at top */}
      {feedback && (
        <div className="fixed left-1/2 top-20 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 transform animate-in fade-in slide-in-from-top-4 duration-300 sm:top-24 sm:w-auto">
          <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/20 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100 shadow-xl backdrop-blur sm:rounded-3xl sm:px-6 sm:py-4 sm:text-xs sm:tracking-[0.25em]">
            <div className="flex items-center gap-3">
              <svg className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="flex-1">{feedback}</span>
              <button
                type="button"
                onClick={() => setFeedback(null)}
                className="flex-shrink-0 opacity-70 transition hover:opacity-100"
              >
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-12 pt-24 sm:gap-8 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8 lg:pb-20">
        
        {/* Authentication Screen */}
        {!showManagementUi && (
          <section className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur sm:p-8">
            <h2 className="text-base font-semibold text-white sm:text-lg">Authenticate as Admin</h2>
            <p className="mt-1 text-xs text-slate-300/80 sm:text-sm">
              Enter an admin email and password to manage accounts.
            </p>
            <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-300 sm:tracking-[0.3em]">
                Admin Email
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-slate-100 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-300/60"
                  required
                />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-[0.25em] text-slate-300 sm:tracking-[0.3em]">
                Password
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-slate-100 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-300/60"
                  required
                />
              </label>
              {authError && (
                <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-rose-200">
                  {authError}
                </div>
              )}
              <button
                type="submit"
                disabled={authLoading}
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-[0_20px_50px_rgba(14,165,233,0.45)] transition focus:outline-none focus:ring-2 focus:ring-brand-200 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {authLoading ? 'Authenticating...' : 'Authenticate'}
              </button>
            </form>
          </section>
        )}

        {/* Landing Screen - Two Large Buttons */}
        {showManagementUi && viewMode === 'landing' && (
          <section className="flex min-h-[60vh] items-center justify-center py-8 sm:py-12">
            <div className="w-full max-w-5xl space-y-8 sm:space-y-12">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
                  Account Management
                </h2>
                <p className="mt-3 text-sm text-slate-300 sm:mt-4 sm:text-base">
                  Choose an action to get started
                </p>
              </div>
              
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
                {/* Create Accounts Button */}
                <button
                  onClick={() => handleViewModeChange('create')}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-500/20 to-sky-500/20 p-8 backdrop-blur transition-all hover:scale-[1.02] hover:border-brand-400/50 hover:shadow-[0_20px_60px_rgba(14,165,233,0.4)] active:scale-[0.98] sm:p-10 lg:p-12"
                >
                  <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-sky-500 shadow-lg transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
                      <svg className="h-8 w-8 text-white sm:h-10 sm:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white sm:text-2xl">Create Accounts</h3>
                      <p className="mt-2 text-xs text-slate-300 sm:text-sm">
                        Add new user or admin accounts to the system
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-400/0 to-sky-500/0 transition-all group-hover:from-brand-400/10 group-hover:to-sky-500/10" />
                </button>

                {/* Existing Accounts Button */}
                <button
                  onClick={() => handleViewModeChange('existing')}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-8 backdrop-blur transition-all hover:scale-[1.02] hover:border-purple-400/50 hover:shadow-[0_20px_60px_rgba(168,85,247,0.4)] active:scale-[0.98] sm:p-10 lg:p-12"
                >
                  <div className="relative z-10 flex flex-col items-center gap-5 sm:gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg transition-transform group-hover:scale-110 sm:h-20 sm:w-20">
                      <svg className="h-8 w-8 text-white sm:h-10 sm:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white sm:text-2xl">Existing Accounts</h3>
                      <p className="mt-2 text-xs text-slate-300 sm:text-sm">
                        View and manage all user and admin accounts
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/0 to-pink-500/0 transition-all group-hover:from-purple-400/10 group-hover:to-pink-500/10" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Create Account View */}
        {showManagementUi && viewMode === 'create' && (
          <section className="mx-auto w-full max-w-2xl">
            <form
              onSubmit={handleCreateAccount}
              className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur sm:p-6 md:p-8"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-base font-semibold text-white sm:text-lg">Create New Account</h2>
                <div className="inline-flex w-full rounded-full border border-white/15 bg-white/10 p-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-200 sm:w-auto sm:text-xs">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={clsx(
                      'flex-1 rounded-full px-3 py-1.5 transition sm:flex-initial',
                      role === 'user' ? 'bg-brand-400 text-slate-900 shadow' : 'hover:bg-white/10'
                    )}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={clsx(
                      'flex-1 rounded-full px-3 py-1.5 transition sm:flex-initial',
                      role === 'admin' ? 'bg-brand-400 text-slate-900 shadow' : 'hover:bg-white/10'
                    )}
                  >
                    Admin
                  </button>
                </div>
              </div>
              <p className="mt-2 text-[10px] text-slate-300 sm:text-xs">
                Admin accounts require a password. User passwords are optional and will be auto-generated when omitted.
              </p>
              <div className="mt-5 space-y-4 sm:mt-6">
                <label className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-300 sm:text-xs sm:tracking-[0.3em]">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-xs font-medium text-slate-100 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-300/60 sm:mt-2 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
                    required
                  />
                </label>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-300 sm:text-xs sm:tracking-[0.3em]">
                  Full Name
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-xs font-medium text-slate-100 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-300/60 sm:mt-2 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
                    required
                  />
                </label>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-300 sm:text-xs sm:tracking-[0.3em]">
                  {role === 'admin' ? 'Password (required for admins)' : 'Password (optional)'}
                  <input
                    type="text"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-xs font-medium text-slate-100 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-300/60 sm:mt-2 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
                    placeholder={
                      role === 'admin' ? 'Required for admin accounts' : 'Leave blank to auto-generate'
                    }
                    required={role === 'admin'}
                  />
                </label>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-sky-500 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white shadow-[0_20px_50px_rgba(14,165,233,0.45)] transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-brand-200 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-6 sm:px-6 sm:py-3 sm:text-sm sm:tracking-[0.3em]"
              >
                {saving ? 'Saving...' : role === 'admin' ? 'Create Admin' : 'Create User'}
              </button>
            </form>
          </section>
        )}

        {/* Existing Accounts View */}
        {showManagementUi && viewMode === 'existing' && (
          <section className="mx-auto w-full max-w-6xl">
            <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur sm:p-6 lg:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-semibold text-white sm:text-lg">Existing Accounts</h2>
                    <button
                      type="button"
                      onClick={() => fetchAccounts()}
                      disabled={loadingUsers}
                      className="rounded-full border border-brand-400/40 bg-brand-500/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-200 transition hover:border-brand-300 hover:bg-brand-500/30 disabled:opacity-50 sm:text-xs"
                    >
                      {loadingUsers ? 'Refreshing...' : '🔄 Refresh'}
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-300/80 sm:text-xs">
                    View all user and admin accounts. Toggle status, reset passwords, or remove user accounts as needed.
                  </p>
                </div>
                {loadError && (
                  <span className="rounded-full border border-rose-400/40 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-200 sm:px-3 sm:text-xs sm:tracking-[0.25em]">
                    {loadError}
                  </span>
                )}
              </div>
              
              <div className="overflow-hidden rounded-xl border border-white/10 sm:rounded-2xl">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs sm:text-sm">
                    <thead className="bg-white/10 text-[10px] uppercase tracking-[0.15em] text-slate-300 sm:text-xs sm:tracking-[0.2em]">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold sm:px-4 sm:py-3">Email</th>
                        <th className="hidden px-3 py-2.5 font-semibold sm:table-cell sm:px-4 sm:py-3">Name</th>
                        <th className="px-3 py-2.5 font-semibold sm:px-4 sm:py-3">Role</th>
                        <th className="hidden px-3 py-2.5 font-semibold md:table-cell sm:px-4 sm:py-3">Password</th>
                        <th className="px-3 py-2.5 font-semibold sm:px-4 sm:py-3">Status</th>
                        <th className="hidden px-3 py-2.5 font-semibold lg:table-cell sm:px-4 sm:py-3">Created</th>
                        <th className="px-3 py-2.5 font-semibold sm:px-4 sm:py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loadingUsers && (
                        <tr>
                          <td colSpan={7} className="px-3 py-5 text-center text-xs text-slate-400 sm:px-4 sm:py-6 sm:text-sm">
                            Loading accounts...
                          </td>
                        </tr>
                      )}
                      {!loadingUsers && sortedUsers.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-3 py-5 text-center text-xs text-slate-400 sm:px-4 sm:py-6 sm:text-sm">
                            No accounts found yet.
                          </td>
                        </tr>
                      )}
                      {sortedUsers.map((user) => (
                        <tr key={`${user.accountRole}-${user.id}`} className="transition hover:bg-white/10">
                          <td className="px-3 py-3 text-xs font-semibold text-slate-100 sm:px-4 sm:py-4 sm:text-sm">
                            <div className="max-w-[120px] truncate sm:max-w-none">{user.email}</div>
                          </td>
                          <td className="hidden px-3 py-3 text-xs text-slate-300 sm:table-cell sm:px-4 sm:py-4 sm:text-sm">
                            {user.full_name ?? '--'}
                          </td>
                          <td className="px-3 py-3 sm:px-4 sm:py-4">
                            <span
                              className={clsx(
                                'inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] sm:px-3 sm:py-1 sm:text-xs sm:tracking-[0.2em]',
                                user.accountRole === 'admin' 
                                  ? 'bg-purple-500/15 text-purple-300 ring-1 ring-purple-300/40'
                                  : 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-300/40'
                              )}
                            >
                              {user.accountRole}
                            </span>
                          </td>
                          <td className="hidden px-3 py-3 md:table-cell sm:px-4 sm:py-4">
                            {user.plain_password ? (
                              <div className="flex items-center gap-2">
                                <code className="rounded bg-white/10 px-2 py-1 text-[10px] font-mono text-brand-200 sm:text-xs">
                                  {user.plain_password}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(user.plain_password || '');
                                    alert('Password copied to clipboard!');
                                  }}
                                  className="rounded-full border border-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-brand-200 transition hover:border-brand-200 sm:text-[10px] sm:tracking-[0.2em]"
                                  title="Copy password"
                                >
                                  Copy
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 sm:text-xs">Not available</span>
                            )}
                          </td>
                          <td className="px-3 py-3 sm:px-4 sm:py-4">
                            <span
                              className={clsx(
                                'inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] sm:px-3 sm:py-1 sm:text-xs sm:tracking-[0.2em]',
                                STATUS_BADGES[user.status]
                              )}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="hidden px-3 py-3 text-[10px] text-slate-400 lg:table-cell sm:px-4 sm:py-4 sm:text-xs">
                            {user.created_at ? (() => {
                              // Parse UTC timestamp from SQLite and convert to IST
                              const utcDate = new Date(user.created_at + 'Z'); // Add Z to parse as UTC
                              
                              // Add 5 hours 30 minutes for IST
                              const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));
                              
                              const day = String(istDate.getUTCDate()).padStart(2, '0');
                              const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
                              const year = istDate.getUTCFullYear();
                              let hours = istDate.getUTCHours();
                              const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
                              const seconds = String(istDate.getUTCSeconds()).padStart(2, '0');
                              const ampm = hours >= 12 ? 'pm' : 'am';
                              hours = hours % 12 || 12;
                              
                              return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds} ${ampm}`;
                            })() : '--'}
                          </td>
                          <td className="px-3 py-3 text-xs sm:px-4 sm:py-4">
                            <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:gap-2">
                              {user.accountRole === 'user' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusToggle(user)}
                                  className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-brand-300 hover:text-brand-100 sm:px-3 sm:text-[10px] sm:tracking-[0.25em]"
                                >
                                  {user.status === 'ACTIVE' ? 'Disable' : 'Activate'}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleResetPassword(user)}
                                className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-brand-200 transition hover:border-brand-200 hover:text-brand-100 sm:px-3 sm:text-[10px] sm:tracking-[0.25em]"
                              >
                                Reset
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAccount(user)}
                                className="rounded-full border border-rose-400/40 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-rose-200 transition hover:border-rose-300 hover:text-rose-100 sm:px-3 sm:text-[10px] sm:tracking-[0.25em]"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;
