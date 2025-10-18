import Papa from 'papaparse';

export interface CsvColumn<T extends Record<string, unknown>> {
  key: keyof T;
  label: string;
}

export function downloadCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: Array<CsvColumn<T>>,
  filename: string
) {
  if (!rows.length) {
    return;
  }

  const csv = Papa.unparse({
    fields: columns.map((column) => column.label),
    data: rows.map((row) =>
      columns.map((column) => {
        const value = row[column.key];
        if (typeof value === 'boolean') {
          return value ? 'Yes' : 'No';
        }
        return value ?? '';
      })
    )
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
