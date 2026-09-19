'use client';

import { useEffect, useState } from 'react';
import CompanionCard from '@/components/CompanionCard';

const CITIES = ['Ahmedabad', 'Mumbai', 'Surat', 'Vadodara', 'Rajkot', 'Bengaluru', 'Hyderabad', 'Chennai', 'Noida', 'Delhi NCR'];

export default function BrowsePage() {
  const [city, setCity] = useState('');
  const [companions, setCompanions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = city ? `/api/companions/search?city=${encodeURIComponent(city)}` : '/api/companions/search';
    fetch(url)
      .then((r) => r.json())
      .then((data) => setCompanions(data.companions || []))
      .finally(() => setLoading(false));
  }, [city]);

  return (
    <main style={{ background: 'var(--paper)' }} className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
          Browse
        </p>
        <h1 className="font-display mt-3 text-4xl font-medium">Find your buddy</h1>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="field-input mt-6 w-full max-w-xs"
        >
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {loading && <p style={{ color: 'var(--ink-40)' }}>Loading…</p>}
          {!loading && companions.length === 0 && (
            <p style={{ color: 'var(--ink-40)' }}>No verified companions here yet.</p>
          )}
          {companions.map((c) => (
            <CompanionCard key={c.id} companion={c} />
          ))}
        </div>
      </div>
    </main>
  );
}
