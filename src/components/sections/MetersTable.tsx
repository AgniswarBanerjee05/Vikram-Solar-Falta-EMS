import clsx from 'clsx';
import type { FC } from 'react';
import type { Meter } from '../../types/dashboard';

const columns: Array<{ key: keyof Meter; label: string }> = [
  { key: 'sl_no', label: 'SL' },
  { key: 'location', label: 'Location' },
  { key: 'panel_name', label: 'Panel' },
  { key: 'meter_name', label: 'Meter Name' },
  { key: 'model', label: 'Model' },
  { key: 'meter_serial', label: 'Serial' },
  { key: 'comm_port', label: 'Comm Port' },
  { key: 'new_meter_required', label: 'New?' },
  { key: 'equipment_connected', label: 'Equipment' },
  { key: 'remarks', label: 'Remarks' }
];

interface MetersTableProps {
  rows: Meter[];
}

export const MetersTable: FC<MetersTableProps> = ({ rows }) => {
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
          {rows.map((row) => (
            <tr
              key={`${row.sl_no}-${row.meter_serial}`}
              className="group border-t border-white/5 bg-white/50 transition hover:bg-white/80 dark:border-white/5 dark:bg-slate-950/40 dark:hover:bg-slate-900/70"
            >
              {columns.map((column) => {
                let value = row[column.key];
                if (column.key === 'new_meter_required') {
                  value = row.new_meter_required;
                }
                if (column.key === 'comm_port') {
                  const normalized = String(value ?? '').trim().toUpperCase();
                  return (
                    <td
                      key={column.key as string}
                      className="px-5 py-3 text-slate-700 transition group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white"
                    >
                      <span
                        className={clsx(
                          'inline-flex min-w-[64px] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                          normalized === 'YES'
                            ? 'bg-emerald-400/20 text-emerald-600 ring-1 ring-emerald-400/40 dark:bg-emerald-400/15 dark:text-emerald-300'
                            : normalized === 'NO'
                              ? 'bg-rose-400/20 text-rose-600 ring-1 ring-rose-400/40 dark:bg-rose-400/15 dark:text-rose-300'
                              : 'bg-slate-200/50 text-slate-600 ring-1 ring-slate-300/40 dark:bg-slate-700/40 dark:text-slate-200'
                        )}
                      >
                        {normalized || '--'}
                      </span>
                    </td>
                  );
                }
                if (column.key === 'new_meter_required') {
                  const isRequired = Boolean(value);
                  return (
                    <td
                      key={column.key as string}
                      className="px-5 py-3 text-slate-700 transition group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white"
                    >
                      <span
                        className={clsx(
                          'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                          isRequired
                            ? 'bg-rose-400/20 text-rose-600 ring-1 ring-rose-400/40 dark:bg-rose-400/15 dark:text-rose-300'
                            : 'bg-emerald-400/20 text-emerald-600 ring-1 ring-emerald-400/40 dark:bg-emerald-400/15 dark:text-emerald-300'
                        )}
                      >
                        {isRequired ? 'Required' : 'Existing'}
                      </span>
                    </td>
                  );
                }
                const normalizedValue =
                  typeof value === 'string' ? value.trim() : value;
                const displayValue =
                  normalizedValue === undefined ||
                  normalizedValue === null ||
                  normalizedValue === ''
                    ? '--'
                    : normalizedValue;
                return (
                  <td
                    key={column.key as string}
                    className="px-5 py-3 text-slate-700 transition group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white"
                  >
                    {displayValue}
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
                No meters match your filters.
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
};
