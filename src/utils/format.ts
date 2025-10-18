export function formatNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return '--';
  }
  const numeric = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(numeric)) {
    return String(value);
  }
  return new Intl.NumberFormat('en-IN').format(numeric);
}

export function matchesSearchTerm(record: Record<string, unknown>, term: string) {
  if (!term.trim()) {
    return true;
  }
  const search = term.toLowerCase();
  return Object.values(record).some((value) => {
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(search);
  });
}
