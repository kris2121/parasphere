// lib/dateUtils.ts

export function minutesAgo(mins: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - mins);
  return d.toISOString();
}

export function formatShortDate(isoOrMs: string | number): string {
  const d =
    typeof isoOrMs === 'number' ? new Date(isoOrMs) : new Date(isoOrMs);

  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
