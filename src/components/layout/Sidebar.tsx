import type { FC } from 'react';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  sections: Array<{ id: string; label: string }>;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  getSectionHref: (sectionId: string) => string;
}

const SIDEBAR_BASE_CLASSES =
  'fixed inset-y-0 left-0 z-40 w-72 transform bg-slate-950/75 text-slate-100 shadow-[0_0_40px_rgba(56,189,248,0.18)] ring-1 ring-white/10 backdrop-blur-2xl transition-transform duration-300 lg:border-r lg:border-white/10 lg:bg-slate-950/80';

export const Sidebar: FC<SidebarProps> = ({
  isOpen,
  sections,
  activeSection,
  onNavigate,
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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 opacity-40" />

        <a
          href={getSectionHref('overview')}
          onClick={(event) => {
            event.preventDefault();
            onNavigate('overview');
          }}
          className="relative flex items-center gap-3 border-b border-white/10 px-6 py-6"
        >
          <img
            src={`${import.meta.env.BASE_URL}images/vikram-solar-logo.png`}
            alt="Vikram Solar Logo"
            className="h-11 w-11 rounded-lg border border-white/10 bg-white/10 p-2 backdrop-blur"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-300">
              Falta EMS
            </p>
            <p className="mt-1 text-base font-semibold text-white">Dashboard Prototype</p>
          </div>
        </a>

        <nav className="relative flex-1 space-y-1 px-4 py-6">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <a
                key={section.id}
                href={getSectionHref(section.id)}
                className={clsx(
                  'group flex items-center justify-between rounded-xl border border-transparent px-4 py-3 text-sm font-semibold uppercase tracking-wide transition',
                  isActive
                    ? 'bg-gradient-to-r from-brand-500/40 via-brand-400/30 to-transparent text-white shadow-[0_0_20px_rgba(14,165,233,0.45)] ring-1 ring-brand-300/70'
                    : 'text-slate-300 hover:border-brand-400/40 hover:bg-white/10 hover:text-white'
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
                    isActive ? 'bg-brand-300 shadow-[0_0_10px_rgba(56,189,248,0.9)]' : 'bg-white/30 group-hover:bg-brand-200'
                  )}
                  aria-hidden
                />
              </a>
            );
          })}
        </nav>

        <footer className="relative border-t border-white/10 px-6 py-5 text-[11px] leading-5 text-slate-300/80">
          <p className="font-semibold tracking-wider text-brand-200/90">Prototype using local data</p>
          <p className="mt-2 text-slate-400">
            React + Tailwind + Chart.js - future ready for your EMS API.
          </p>
        </footer>
      </div>
    </aside>
  );
};
