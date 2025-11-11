'use client';

import { Dispatch, SetStateAction } from 'react';

type Props = {
  /** current search text */
  query: string;
  /** state setter from useState — pass setSearchQuery here */
  setQuery: Dispatch<SetStateAction<string>>;
  /** current active tab id (e.g. 'home' | 'hauntings' | 'ufos' | 'cryptids' | 'events' | 'marketplace' | 'collaboration') */
  activeTab: string;
  /** called when a tab is selected */
  onTabChange: (tab: string) => void;
};

const TABS: { id: string; label: string }[] = [
  { id: 'home',         label: 'All' },
  { id: 'hauntings',    label: 'Hauntings' },
  { id: 'ufos',         label: 'UFOs' },
  { id: 'cryptids',     label: 'Cryptids' },
  { id: 'events',       label: 'Events' },
  { id: 'marketplace',  label: 'Marketplace' },
  { id: 'collaboration',label: 'Collab' },
];

export default function FilterBar({ query, setQuery, activeTab, onTabChange }: Props) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
      {/* Search */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search posts & locations…"
        className="w-full md:w-80 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none"
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = t.id === activeTab;
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              className={`rounded-full border px-3 py-1 text-sm ${
                active
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                  : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}






