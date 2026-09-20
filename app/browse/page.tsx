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
