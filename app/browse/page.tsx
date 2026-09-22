'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CompanionCard from '@/components/CompanionCard';

const CITIES = [
  'Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune',
  'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam',
  'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut',
  'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Amritsar', 'Navi Mumbai', 'Prayagraj',
  'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur',
  'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Thiruvananthapuram', 'Kochi',
  'Mysuru', 'Dehradun', 'Noida', 'Gurugram', 'Gandhinagar', 'Anand', 'Bhavnagar', 'Jamnagar',
];

export default function BrowsePage() {
  const [city, setCity] = useState('');
  const [companions, setCompanions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    const url = city ? `/api/companions/search?city=${encodeURIComponent(city)}` : '/api/companions/search';
    fetch(url)
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.error || 'Failed to load');
        setCompanions(data.companions || []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [city]);

  return (
    <main style={{ background: 'var(--paper)' }} className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-semibold" style={{ color: 'var(--ink)' }}>
            Garba Buddy
          </Link>
          <Link href="/login" className="text-sm font-medium underline" style={{ color: 'var(--gold-deep)' }}>
            Log in
          </Link>
        </div>

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
          {!loading && error && (
            <p style={{ color: 'var(--maroon)' }}>
              Couldn't load companions right now. Refresh to try again.
            </p>
          )}
          {!loading && !error && companions.length === 0 && (
            <div>
              <p style={{ color: 'var(--ink-40)' }}>
                No verified companions in {city || 'this city'} yet.
              </p>
              {city && (
                <button
                  type="button"
                  onClick={() => setCity('')}
                  className="mt-2 text-sm underline"
                  style={{ color: 'var(--gold-deep)' }}
                >
                  See all cities instead
                </button>
              )}
            </div>
          )}
          {companions.map((c) => (
            <CompanionCard key={c.id} companion={c} />
          ))}
        </div>
      </div>
    </main>
  );
}
