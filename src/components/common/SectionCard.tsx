import type { FC, HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface SectionCardProps extends HTMLAttributes<HTMLElement> {
  title?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

export const SectionCard: FC<SectionCardProps> = ({
  title,
  actions,
  className,
  children,
  ...sectionProps
}) => {
  return (
    <section
      className={clsx(
        'relative overflow-hidden rounded-3xl border border-white/10 bg-white/70 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl transition-all duration-500 hover:border-white/20 hover:shadow-[0_35px_75px_rgba(14,165,233,0.25)] dark:bg-slate-950/60',
        className
      )}
      {...sectionProps}
    >
      <div className="pointer-events-none absolute inset-px rounded-[26px] border border-white/5" />
      <div className="relative">
        {(title || actions) && (
          <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {typeof title === 'string' ? (
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
            ) : (
              title
            )}
            {actions}
          </header>
        )}
        {children}
      </div>
    </section>
  );
};
