'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/* ============================================================================
   COUNTRY SCOPE CONTEXT
============================================================================ */

type ScopeCtx = { country: string; setCountry: (c: string) => void };

const Scope = createContext<ScopeCtx | null>(null);

export function ScopeProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(() => {
    if (typeof window === 'undefined') return 'GB';
    const url = new URL(window.location.href);
    const q = url.searchParams.get('country');
    const saved = localStorage.getItem('ps.country');
    const guess = (navigator.language || 'en-GB').split('-').pop() || 'GB';
    return (q || saved || guess).toUpperCase();
  }, []);

  const [country, setCountryState] = useState(initial);

  const setCountry = (c: string) => {
    const code = (c || 'GB').toUpperCase();
    setCountryState(code);
    try {
      localStorage.setItem('ps.country', code);
      const u = new URL(window.location.href);
      u.searchParams.set('country', code);
      history.replaceState({}, '', u.toString());
    } catch {
      // ignore
    }
  };

  return (
    <Scope.Provider value={{ country, setCountry }}>
      {children}
    </Scope.Provider>
  );
}

export function useScope() {
  const v = useContext(Scope);
  if (!v) throw new Error('useScope used outside provider');
  return v;
}

/* ============================================================================
   COUNTRY LIST HOOK
============================================================================ */

export function useCountries() {
  const [countries, setCountries] = useState<
    Array<{ code: string; name: string; region?: string }>
  >([]);

  useEffect(() => {
    let ok = true;
    fetch('/countries.json')
      .then((r) => r.json())
      .then((list) => ok && setCountries(Array.isArray(list) ? list : []))
      .catch(() => {
        setCountries([
          { code: 'EU', name: 'Europe (multi-country)' },
          { code: 'US', name: 'United States' },
          { code: 'GB', name: 'United Kingdom' },
          { code: 'CA', name: 'Canada' },
          { code: 'AU', name: 'Australia' },
        ]);
      });

    return () => {
      ok = false;
    };
  }, []);

  return countries;
}

/* ============================================================================
   COUNTRY SELECT PILL
============================================================================ */

export function CountrySelect({ label = 'Show posts from' }: { label?: string }) {
  const { country, setCountry } = useScope();
  const countries = useCountries();

  const options = useMemo(() => {
    if (!countries.length) return [];
    const eu = countries.filter((c) => c.code.toUpperCase() === 'EU');
    const rest = countries
      .filter((c) => c.code.toUpperCase() !== 'EU')
      .sort((a, b) => a.name.localeCompare(b.name));
    return [...eu, ...rest];
  }, [countries]);

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-zinc-800/60 px-2 py-1 text-xs">
      <span className="opacity-70">{label}</span>
      <select
        className="rounded-full bg-transparent text-neutral-100 outline-none"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      >
        {options.map((o) => (
          <option
            key={o.code}
            value={o.code}
            className="bg-zinc-900 text-neutral-100"
          >
            {o.name} ({o.code})
          </option>
        ))}
      </select>
    </div>
  );
}

/* ============================================================================
   SECTION DISCLAIMER
============================================================================ */

export function SectionDisclaimer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-lg border border-red-700/60 bg-red-900/20 px-4 py-2 text-center text-sm text-red-200">
      {children}
    </div>
  );
}
