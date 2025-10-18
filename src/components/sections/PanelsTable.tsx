import clsx from 'clsx';
import type { FC } from 'react';
import type { Panel } from '../../types/dashboard';

const columns: Array<{ key: keyof Panel; label: string }> = [
  { key: 'panel', label: 'Panel' },
  { key: 'sl_no', label: 'SL' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'power', label: 'Power' },
  { key: 'quantity', label: 'Quantity' }
];

interface PanelsTableProps {
  rows: Panel[];
}

export const PanelsTable: FC<PanelsTableProps> = ({ rows }) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/40 shadow-[0_25px_55px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:bg-slate-950/50">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
        <thead className="bg-gradient-to-r from-white/60 via-white/40 to-white/10 text-slate-600 dark:from-slate-900/70 dark:via-slate-900/40 dark:to-slate-900/20 dark:text-slate-300">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key as string}
                scope="col"
                className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em]"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.panel}-${index}`}
              className="group border-t border-white/5 bg-white/50 transition hover:bg-white/80 dark:border-white/5 dark:bg-slate-950/40 dark:hover:bg-slate-900/70"
            >
              {columns.map((column) => {
                const value = row[column.key] ?? '--';
                const isNumeric = column.key === 'power' || column.key === 'quantity';
                return (
                  <td
                    key={column.key as string}
                    className={clsx(
                      'px-5 py-3 text-slate-700 transition group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white',
                      isNumeric && 'text-right font-semibold'
                    )}
                  >
                    {isNumeric ? (
                      <span className="inline-flex items-center justify-end gap-2">
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                          {column.key === 'power' ? 'kW' : 'Qty'}
                        </span>
                        <span>{value}</span>
                      </span>
                    ) : (
                      value
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-6 text-center text-slate-500 dark:text-slate-400"
              >
                No panels match your filters.
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
};
