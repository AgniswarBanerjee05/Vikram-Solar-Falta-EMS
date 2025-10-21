import type { FC } from 'react';
import { Bars3Icon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';

interface TopbarProps {
  onToggleSidebar: () => void;
  onDownloadCsv: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
  isSidebarOpen: boolean;
}

export const Topbar: FC<TopbarProps> = ({
  onToggleSidebar,
  onDownloadCsv,
  onToggleTheme,
  isDark,
  isSidebarOpen
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-white/70 backdrop-blur-2xl transition dark:border-white/5 dark:bg-slate-950/40">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6 lg:mx-0 lg:flex-nowrap lg:justify-between lg:px-10 xl:px-12">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            className="inline-flex shrink-0 rounded-xl border border-white/20 bg-white/80 p-2 text-slate-700 shadow-lg shadow-brand-500/10 transition hover:border-brand-400 hover:text-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-brand-300 dark:hover:text-brand-200 dark:focus:ring-offset-slate-950"
            aria-label={isSidebarOpen ? 'Collapse navigation' : 'Expand navigation'}
            aria-controls="dashboard-sidebar"
            aria-expanded={isSidebarOpen}
            onClick={onToggleSidebar}
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
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
          <button
            type="button"
            onClick={onDownloadCsv}
            className="w-full rounded-full bg-gradient-to-r from-brand-400 via-brand-500 to-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(14,165,233,0.35)] transition hover:from-brand-300 hover:to-sky-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:ring-offset-2 dark:focus:ring-offset-slate-950 sm:w-auto"
          >
            Download CSV
          </button>
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
        </div>
      </div>
    </header>
  );
};
