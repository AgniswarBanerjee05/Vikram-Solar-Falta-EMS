import { useEffect, useMemo, useState } from 'react';
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

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [role, setRole] = useState<AccountRole>('user');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'DISABLED'>('ACTIVE');
  const [registrationKey, setRegistrationKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchAccounts = async () => {
      if (!adminToken) {
        setUsers([]);
        setAdmins([]);
        return;
      }
      setLoadingUsers(true);
      setLoadError(null);
      try {
        const [userData, adminData] = await Promise.all([
          listUsers(adminToken),
          listAdmins(adminToken)
        ]);
        if (!cancelled) {
          setUsers(userData);
          setAdmins(adminData);
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'Failed to load accounts.';
          setLoadError(message);
          if (message.toLowerCase().includes('unauthor')) {
            clearAdminSession();
            setAdminToken('');
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingUsers(false);
        }
      }
    };

    void fetchAccounts();

    return () => {
      cancelled = true;
    };
  }, [adminToken]);

  const sortedUsers = useMemo(() => {
    // Combine users and admins with a role tag
    const usersWithRole = users.map(u => ({ ...u, accountRole: 'user' as const }));
    const adminsWithRole = admins.map(a => ({ ...a, accountRole: 'admin' as const, status: 'ACTIVE' as const }));
    return [...usersWithRole, ...adminsWithRole].sort((a, b) => a.email.localeCompare(b.email));
  }, [users, admins]);

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
    setStatus('ACTIVE');
    setRegistrationKey('');
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
        await adminRegister(
          {
            email: email.trim(),
            password: password.trim(),
            fullName: fullName.trim()
          },
          registrationKey.trim() || undefined
        );
        setFeedback('Admin account created. Share the credentials securely.');
      } else {
        const result = await createUser(adminToken, {
          email: email.trim(),
          fullName: fullName.trim(),
          password: password.trim() || undefined,
          status
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
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(17,94,89,0.25),_transparent_55%)] opacity-80" />
      <div className="pointer-events-none fixed inset-0 bg-[conic-gradient(from_90deg_at_20%_20%,_rgba(56,189,248,0.15),_transparent_45%)] blur-[120px]" />
      
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Admin Account Management</h1>
            <p className="mt-2 text-sm text-slate-300/80">
              Create, update, and remove dashboard user or admin accounts. Changes are applied instantly.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {onBackToDashboard && (
              <button
                type="button"
                onClick={onBackToDashboard}
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-200 transition hover:border-brand-300 hover:text-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Back to dashboard
              </button>
            )}
            {showManagementUi && (
              <button
                type="button"
                onClick={handleAdminLogout}
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-rose-200 transition hover:border-rose-300 hover:text-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                Sign out of dashboard
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-32 sm:px-6 lg:px-10">
        {!showManagementUi && (
          <section className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Authenticate as Admin</h2>
            <p className="mt-1 text-sm text-slate-300/80">
              Enter an admin email and password to manage accounts. This is separate from the dashboard login.
            </p>
            <form onSubmit={handleAdminLogin} className="mt-6 space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                Admin Email
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-slate-100 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-300/60"
                  required
                />
              </label>
              <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
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
                <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-rose-200">
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

        {showManagementUi && (
          <section className="grid gap-10 lg:grid-cols-[420px_1fr]">
            <form
              onSubmit={handleCreateAccount}
              className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-semibold text-white">Create New Account</h2>
                <div className="inline-flex rounded-full border border-white/15 bg-white/10 p-1 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={clsx(
                      'rounded-full px-3 py-1 transition',
                      role === 'user' ? 'bg-brand-400 text-slate-900 shadow' : 'hover:bg-white/10'
                    )}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('admin')}
                    className={clsx(
                      'rounded-full px-3 py-1 transition',
                      role === 'admin' ? 'bg-brand-400 text-slate-900 shadow' : 'hover:bg-white/10'
                    )}
                  >
                    Admin
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                Admin accounts require a password. User passwords are optional and will be auto-generated when omitted.
              </p>
              <div className="mt-4 space-y-4">
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-slate-100 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-300/60"
                    required
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                  Full Name
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-slate-100 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-300/60"
                    required
                  />
                </label>
                {role === 'user' && (
                  <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                    Status
                    <select
                      value={status}
                      onChange={(event) => setStatus(event.target.value as 'ACTIVE' | 'DISABLED')}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-slate-100 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-300/60"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="DISABLED">Disabled</option>
                    </select>
                  </label>
                )}
                <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                  {role === 'admin' ? 'Password (required for admins)' : 'Password (optional)'}
                  <input
                    type="text"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-slate-100 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-300/60"
                    placeholder={
                      role === 'admin' ? 'Required for admin accounts' : 'Leave blank to auto-generate'
                    }
                    required={role === 'admin'}
                  />
                </label>
                {role === 'admin' && (
                  <label className="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                    Registration Key (optional)
                    <input
                      type="text"
                      value={registrationKey}
                      onChange={(event) => setRegistrationKey(event.target.value)}
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium text-slate-100 outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-300/60"
                      placeholder="Only needed if the server enforces it"
                    />
                  </label>
                )}
              </div>
              <button
                type="submit"
                disabled={saving}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-sky-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-[0_20px_50px_rgba(14,165,233,0.45)] transition focus:outline-none focus:ring-2 focus:ring-brand-200 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : role === 'admin' ? 'Create Admin' : 'Create User'}
              </button>
            </form>

            <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Existing Accounts</h2>
                  <p className="text-xs text-slate-300/80">
                    View all user and admin accounts. Toggle status, reset passwords, or remove user accounts as needed.
                  </p>
                </div>
                {loadError && (
                  <span className="rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-rose-200">
                    {loadError}
                  </span>
                )}
              </div>
              <div className="overflow-hidden rounded-2xl border border-white/10">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-white/10 text-xs uppercase tracking-[0.2em] text-slate-300">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Email</th>
                        <th className="px-4 py-3 font-semibold">Name</th>
                        <th className="px-4 py-3 font-semibold">Role</th>
                        <th className="px-4 py-3 font-semibold">Password</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Created</th>
                        <th className="px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loadingUsers && (
                        <tr>
                          <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                            Loading accounts...
                          </td>
                        </tr>
                      )}
                      {!loadingUsers && sortedUsers.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                            No accounts found yet.
                          </td>
                        </tr>
                      )}
                      {sortedUsers.map((user) => (
                        <tr key={`${user.accountRole}-${user.id}`} className="transition hover:bg-white/10">
                          <td className="px-4 py-4 text-sm font-semibold text-slate-100">{user.email}</td>
                          <td className="px-4 py-4 text-sm text-slate-300">{user.full_name ?? '--'}</td>
                          <td className="px-4 py-4">
                            <span
                              className={clsx(
                                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
                                user.accountRole === 'admin' 
                                  ? 'bg-purple-500/15 text-purple-300 ring-1 ring-purple-300/40'
                                  : 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-300/40'
                              )}
                            >
                              {user.accountRole}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {user.plain_password ? (
                              <div className="flex items-center gap-2">
                                <code className="rounded bg-white/10 px-2 py-1 text-xs font-mono text-brand-200">
                                  {user.plain_password}
                                </code>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(user.plain_password || '');
                                    alert('Password copied to clipboard!');
                                  }}
                                  className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-200 transition hover:border-brand-200"
                                  title="Copy password"
                                >
                                  Copy
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-500">Not available</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={clsx(
                                'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
                                STATUS_BADGES[user.status]
                              )}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-xs text-slate-400">
                            {user.created_at ? new Date(user.created_at).toLocaleString() : '--'}
                          </td>
                          <td className="px-4 py-4 text-xs">
                            <div className="flex flex-wrap gap-2">
                              {user.accountRole === 'user' && (
                                <button
                                  type="button"
                                  onClick={() => handleStatusToggle(user)}
                                  className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-200 transition hover:border-brand-300 hover:text-brand-100"
                                >
                                  {user.status === 'ACTIVE' ? 'Disable' : 'Activate'}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleResetPassword(user)}
                                className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-200 transition hover:border-brand-200 hover:text-brand-100"
                              >
                                Reset
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAccount(user)}
                                className="rounded-full border border-rose-400/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-rose-200 transition hover:border-rose-300 hover:text-rose-100"
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

        {feedback && (
          <div className="rounded-3xl border border-white/10 bg-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200 backdrop-blur">
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManagement;
