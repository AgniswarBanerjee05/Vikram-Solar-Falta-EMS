import type { FC, ReactNode } from 'react';
import clsx from 'clsx';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  accent?: 'brand' | 'emerald' | 'amber' | 'rose';
}

const ACCENT_GRADIENT: Record<NonNullable<KpiCardProps['accent']>, string> = {
  brand: 'from-brand-400/35 via-brand-500/10 to-slate-100/10 dark:via-brand-500/15 dark:to-slate-900/60',
  emerald: 'from-emerald-400/30 via-emerald-500/10 to-slate-100/10 dark:via-emerald-500/15 dark:to-slate-900/60',
  amber: 'from-amber-400/30 via-amber-500/10 to-slate-100/10 dark:via-amber-500/15 dark:to-slate-900/60',
  rose: 'from-rose-400/30 via-rose-500/10 to-slate-100/10 dark:via-rose-500/15 dark:to-slate-900/60'
};

const ACCENT_SHADOW: Record<NonNullable<KpiCardProps['accent']>, string> = {
  brand: 'border-brand-400/40 shadow-[0_18px_55px_rgba(14,165,233,0.25)]',
  emerald: 'border-emerald-400/35 shadow-[0_18px_55px_rgba(16,185,129,0.25)]',
  amber: 'border-amber-400/40 shadow-[0_18px_55px_rgba(245,158,11,0.22)]',
  rose: 'border-rose-400/35 shadow-[0_18px_55px_rgba(244,114,182,0.25)]'
};

const ACCENT_DOT: Record<NonNullable<KpiCardProps['accent']>, string> = {
  brand: 'bg-brand-300 shadow-[0_0_18px_rgba(56,189,248,0.7)]',
  emerald: 'bg-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.65)]',
  amber: 'bg-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.6)]',
  rose: 'bg-rose-300 shadow-[0_0_18px_rgba(244,114,182,0.7)]'
};

export const KpiCard: FC<KpiCardProps> = ({ label, value, accent = 'brand' }) => {
  return (
    <div
      className={clsx(
        'group relative overflow-hidden rounded-3xl border bg-white/70 p-6 transition-all duration-500 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl hover:shadow-brand-500/20 motion-safe:animate-float-slow motion-safe:[animation-duration:18s] even:motion-safe:animate-float-delay dark:bg-slate-950/60',
        ACCENT_SHADOW[accent]
      )}
    >
      <div
        className={clsx(
          'absolute inset-px rounded-[26px] bg-gradient-to-br opacity-90 transition group-hover:opacity-100 bg-[length:180%_180%] motion-safe:animate-glint-slow',
          ACCENT_GRADIENT[accent]
        )}
        aria-hidden
      />
      <div className="relative flex flex-col gap-6">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-600 dark:text-slate-300">
          <span className={clsx('h-1.5 w-1.5 rounded-full', ACCENT_DOT[accent])} />
          {label}
        </span>
        <span className="text-3xl font-black text-slate-900 drop-shadow-[0_4px_14px_rgba(15,23,42,0.12)] transition-colors duration-500 dark:text-white lg:text-4xl">
          {value}
        </span>
      </div>
      <div className="absolute inset-x-6 bottom-5 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-60" />
    </div>
  );
};
