'use client';

import { useEffect, useState } from 'react';
import CompanionCard from '@/components/CompanionCard';

const CITIES = ['Ahmedabad', 'Mumbai', 'Surat', 'Vadodara', 'Rajkot', 'Bengaluru', 'Delhi NCR'];

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
    <main className="min-h-screen bg-[#1a0b2e] px-4 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.3em] text-[#ffb703]">
          NAVRATRI · GARBA BUDDY
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold">Find your buddy</h1>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="mt-5 w-full max-w-xs rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-white sm:w-auto"
        >
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {loading && <p className="text-white/50">Loading…</p>}
          {!loading && companions.length === 0 && (
            <p className="text-white/50">No verified companions here yet.</p>
          )}
          {companions.map((c) => (
            <CompanionCard key={c.id} companion={c} />
          ))}
        </div>
      </div>
    </main>
  );
}
