import type { FC } from 'react';
import clsx from 'clsx';
import { ArrowRightOnRectangleIcon, MoonIcon, SunIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface TopbarProps {
  onToggleSidebar: () => void;
  onDownloadCsv: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
  isSidebarOpen: boolean;
  userEmail?: string;
  userName?: string | null;
  onLogout?: () => void;
  onManageUsers?: () => void;
  onChangePassword?: () => void;
}

export const Topbar: FC<TopbarProps> = ({
  onToggleSidebar,
  onDownloadCsv,
  onToggleTheme,
  isDark,
  isSidebarOpen,
  userEmail,
  userName,
  onLogout,
  onManageUsers,
  onChangePassword
}) => {
  return (
    <header className={clsx(
      "fixed right-0 top-0 z-30 border-b border-white/10 bg-gradient-to-r from-white/80 via-white/50 to-white/80 bg-[length:160%_160%] backdrop-blur-2xl transition-all duration-300 motion-safe:animate-glint-slow dark:border-white/5 dark:from-slate-950/70 dark:via-slate-900/55 dark:to-slate-950/70",
      isSidebarOpen ? "left-0 lg:left-72" : "left-0"
    )}>
      <div className={clsx(
        "mx-auto flex w-full max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:flex-nowrap lg:justify-between lg:px-10 xl:px-14",
        isSidebarOpen ? "lg:mx-0" : ""
      )}>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {!isSidebarOpen && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="inline-flex shrink-0 rounded-lg border-2 border-brand-500 bg-brand-400 p-2 text-white shadow-lg transition hover:bg-brand-500 hover:scale-105 dark:border-brand-300 dark:bg-brand-500 dark:hover:bg-brand-400"
              aria-label="Open navigation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          )}
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-600 dark:text-brand-200">
              Vikram Solar - Falta
            </p>
            <h1 className="truncate text-xl font-bold text-slate-900 drop-shadow-sm dark:text-white sm:text-2xl">
              Energy Meter Dashboard
            </h1>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              Live insights, predictive-ready architecture
            </p>
          </div>
        </div>

        <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2">
          {onManageUsers && (
            <button
              type="button"
              onClick={onManageUsers}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-brand-500 shadow-[0_12px_28px_rgba(56,189,248,0.25)] transition hover:border-brand-300 hover:text-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:ring-offset-2 dark:border-white/10 dark:bg-slate-900/60 dark:text-brand-200 dark:hover:text-brand-100 dark:focus:ring-offset-slate-950 sm:w-auto"
            >
              Manage Users
            </button>
          )}
          {(userEmail || userName) && (
            <div className="hidden min-w-[160px] flex-col items-end rounded-2xl border border-white/10 bg-white/20 px-4 py-2 text-right text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 backdrop-blur sm:flex dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-300">
              <span className="text-[10px] font-medium tracking-[0.32em] text-slate-500 dark:text-slate-400">
                Signed in as
              </span>
              <span className="truncate text-[11px] tracking-[0.2em] text-slate-700 dark:text-slate-100">
                {userName?.trim() || userEmail}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={onDownloadCsv}
            className="w-full rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(14,165,233,0.35)] transition hover:from-brand-300 hover:to-sky-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:ring-offset-2 motion-safe:animate-pulse-ring dark:focus:ring-offset-slate-950 sm:w-auto"
          >
            Download CSV
          </button>
          {onChangePassword && (
            <button
              type="button"
              onClick={onChangePassword}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-400 hover:text-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-brand-300 dark:hover:text-brand-200 dark:focus:ring-offset-slate-950 sm:w-auto"
            >
              <LockClosedIcon className="h-5 w-5" />
              <span>Change Password</span>
            </button>
          )}
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand-400 hover:text-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:ring-offset-2 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-brand-300 dark:hover:text-brand-200 dark:focus:ring-offset-slate-950 sm:w-auto"
          >
            {isDark ? (
              <>
                <SunIcon className="h-5 w-5" />
                <span>Light</span>
              </>
            ) : (
              <>
                <MoonIcon className="h-5 w-5" />
                <span>Dark</span>
              </>
            )}
          </button>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/20 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_12px_28px_rgba(15,23,42,0.18)] transition hover:border-rose-300/60 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:ring-offset-2 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-rose-300/50 dark:hover:text-rose-200 dark:focus:ring-offset-slate-950 sm:w-auto"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
