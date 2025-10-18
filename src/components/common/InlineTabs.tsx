import type { FC } from 'react';
import clsx from 'clsx';

interface InlineTabsProps<T extends string> {
  options: Array<{ id: T; label: string }>;
  active: T;
  onChange: (id: T) => void;
}

export const InlineTabs = <T extends string>({
  options,
  active,
  onChange
}: InlineTabsProps<T>) => {
  return (
    <div className="inline-flex rounded-full border border-white/15 bg-white/40 p-1.5 text-sm shadow-[0_12px_35px_rgba(14,165,233,0.18)] backdrop-blur-xl dark:bg-slate-950/50">
      {options.map((option) => {
        const isActive = option.id === active;
        return (
          <button
            key={option.id}
            type="button"
            className={clsx(
              'rounded-full px-4 py-1.5 font-semibold uppercase tracking-wide transition',
              isActive
                ? 'bg-gradient-to-r from-brand-400 via-brand-500 to-sky-500 text-white shadow-[0_8px_25px_rgba(14,165,233,0.35)]'
                : 'text-slate-600 hover:text-brand-500 dark:text-slate-300'
            )}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
