import type { FC } from 'react';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  sections: Array<{ id: string; label: string }>;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onToggleSidebar: () => void;
  getSectionHref: (sectionId: string) => string;
}

const SIDEBAR_BASE_CLASSES =
  'fixed inset-y-0 left-0 z-40 w-72 transform bg-gradient-to-b from-white/95 via-white/80 to-white/70 text-slate-800 shadow-[0_0_40px_rgba(56,189,248,0.18)] ring-1 ring-slate-900/10 backdrop-blur-2xl transition-colors transition-transform duration-300 lg:border-r lg:border-slate-900/10 dark:from-slate-950/95 dark:via-slate-950/85 dark:to-slate-950/80 dark:text-slate-100 dark:ring-white/10 dark:lg:border-white/10';

export const Sidebar: FC<SidebarProps> = ({
  isOpen,
  sections,
  activeSection,
  onNavigate,
  onToggleSidebar,
  getSectionHref
}) => {
  const containerClass = clsx(SIDEBAR_BASE_CLASSES, {
    '-translate-x-full': !isOpen,
    'translate-x-0': isOpen
  });

  return (
    <aside
      id="dashboard-sidebar"
      className={containerClass}
      aria-label="Primary navigation"
      aria-hidden={!isOpen}
    >
      <div className="relative flex h-full flex-col overflow-y-auto">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-white/20 opacity-60 mix-blend-screen motion-safe:animate-aurora-reverse dark:from-white/10 dark:via-transparent dark:to-white/5 dark:mix-blend-normal" />

        <div className="relative flex items-center justify-between border-b border-slate-900/5 px-6 py-6 transition-colors dark:border-white/10">
          <a
            href={getSectionHref('overview')}
            onClick={(event) => {
              event.preventDefault();
              // Scroll to the very top of the page - let handleNavigate manage smooth scroll
              onNavigate('overview');
            }}
            className="flex flex-1 items-center gap-3 cursor-pointer transition-transform hover:scale-105"
          >
            <img
              src={`${import.meta.env.BASE_URL}images/vikram-solar-logo.png`}
              alt="Vikram Solar Logo"
              className="h-11 w-11 rounded-lg border border-white/10 bg-white/10 p-2 backdrop-blur"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-500 dark:text-brand-300">
                Falta EMS
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900 transition-colors dark:text-white">
                Dashboard Prototype
              </p>
            </div>
          </a>
        </div>
        
        <button
          type="button"
          onClick={onToggleSidebar}
          className="mx-4 mt-4 inline-flex w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-lg border-2 border-brand-500 bg-brand-400 p-3 text-white shadow-lg transition hover:bg-brand-500 dark:border-brand-300 dark:bg-brand-500 dark:hover:bg-brand-400"
          aria-label="Toggle sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
          <span className="font-semibold text-sm">Close Sidebar</span>
        </button>

        <nav className="relative flex-1 space-y-1 px-4 py-6">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <a
                key={section.id}
                href={getSectionHref(section.id)}
                className={clsx(
                  'group flex items-center justify-between rounded-xl border border-transparent px-4 py-3 text-sm font-semibold uppercase tracking-wide transition-colors transition-transform',
                  isActive
                    ? 'bg-gradient-to-r from-brand-300/55 via-brand-400/40 to-white/40 text-slate-900 shadow-[0_0_20px_rgba(14,165,233,0.45)] ring-1 ring-brand-300/70 dark:from-brand-500/40 dark:via-brand-400/35 dark:to-transparent dark:text-white'
                    : 'text-slate-600 hover:border-brand-300/50 hover:bg-white/75 hover:text-slate-900 dark:text-slate-300 dark:hover:border-brand-300/40 dark:hover:bg-white/10 dark:hover:text-white'
                )}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(section.id);
                }}
              >
                <span>{section.label}</span>
                <span
                  className={clsx(
                    'h-2 w-2 rounded-full transition',
                    isActive
                      ? 'bg-brand-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]'
                      : 'bg-slate-400/50 group-hover:bg-brand-300 dark:bg-white/30'
                  )}
                  aria-hidden
                />
              </a>
            );
          })}
        </nav>

        <footer className="relative border-t border-slate-900/5 px-6 py-5 text-[11px] leading-5 text-slate-500 transition-colors dark:border-white/10 dark:text-slate-300/80">
          <p className="font-semibold tracking-wider text-brand-400 dark:text-brand-200">Prototype using local data</p>
          <p className="mt-2 text-slate-400 transition-colors dark:text-slate-400">
            React + Tailwind + Chart.js - future ready for your EMS API.
          </p>
        </footer>
      </div>
    </aside>
  );
};
