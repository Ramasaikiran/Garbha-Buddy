// availability_dates may come back from Postgres as a real array, a
// "{2026-10-11,2026-10-12}" string, or a comma separated string.
export function parseAvailabilityDates(value: unknown): string[] {
  let list: string[] = [];
  if (Array.isArray(value)) {
    list = value.map(String);
  } else if (typeof value === 'string') {
    list = value.replace(/^\{|\}$/g, '').split(',');
  }
  return list.map((d) => d.replace(/"/g, '').trim()).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
}

// Today's date in India as YYYY-MM-DD, independent of the server timezone.
export function todayIST(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}
