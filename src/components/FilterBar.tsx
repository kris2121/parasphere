'use client';

import { Dispatch, SetStateAction } from 'react';

type Props = {
  /** current search text */
  query: string;
  /** state setter from useState — pass setSearchQuery here */
  setQuery: Dispatch<SetStateAction<string>>;
  /** current active tab id (e.g. 'home' | 'hauntings' | 'ufos' | 'cryptids' | 'events' | 'marketplace' | 'collaboration' | 'profile') */
  activeTab: string;
  /** called when a tab is selected */
  onTabChange: (tab: string) => void;
};

const TABS: { id: string; label: string }[] = [
  { id: 'home',          label: 'Home' },       // renamed from All → Home
  { id: 'hauntings',     label: 'Hauntings' },
  { id: 'ufos',          label: 'UFOs' },
  { id: 'cryptids',      label: 'Cryptids' },
  { id: 'events',        label: 'Events' },
  { id: 'marketplace',   label: 'Marketplace' },
  { id: 'collaboration', label: 'Collab' },
  { id: 'profile',       label: 'Profile' },    // sits at the end
];

const COLORS: Record<
  string,
  { text: string; border: string; hover: string; activeBg: string }
> = {
  home:          { text: 'text-cyan-300',    border: 'border-cyan-500',    hover: 'hover:bg-cyan-500/10',    activeBg: 'bg-cyan-500/10' },
  hauntings:     { text: 'text-white',       border: 'border-white/60',     hover: 'hover:bg-white/10',       activeBg: 'bg-white/10' },
  ufos:          { text: 'text-green-300',   border: 'border-green-500',    hover: 'hover:bg-green-500/10',   activeBg: 'bg-green-500/10' },
  cryptids:      { text: 'text-orange-300',  border: 'border-orange-500',   hover: 'hover:bg-orange-500/10',  activeBg: 'bg-orange-500/10' },
  events:        { text: 'text-purple-300',  border: 'border-purple-500',   hover: 'hover:bg-purple-500/10',  activeBg: 'bg-purple-500/10' },
  marketplace:   { text: 'text-blue-300',    border: 'border-blue-500',     hover: 'hover:bg-blue-500/10',    activeBg: 'bg-blue-500/10' },
  collaboration: { text: 'text-neutral-300', border: 'border-neutral-600',  hover: 'hover:bg-neutral-800/50', activeBg: 'bg-neutral-800/60' },
  profile:       { text: 'text-red-300',     border: 'border-red-500',      hover: 'hover:bg-red-500/10',     activeBg: 'bg-red-500/10' },
};

export default function FilterBar({ query, setQuery, activeTab, onTabChange }: Props) {
  return (
    <div className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        {/* Search */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts & locations…"
          className="w-full md:w-83 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm outline-none"

        />

        {/* Pills — single line, scrollable if overflow */}
        <div className="flex flex-nowrap items-center gap-2 md:ml-auto overflow-x-auto">
          {TABS.map((t) => {
            const active = t.id === activeTab;
            const c = COLORS[t.id] ?? {
              text: 'text-neutral-300',
              border: 'border-neutral-700',
              hover: 'hover:bg-neutral-800/50',
              activeBg: 'bg-neutral-800/50',
            };
            const base = 'rounded-full border px-3 py-1 text-sm transition-colors whitespace-nowrap';
            const cls = active
              ? `${base} ${c.text} ${c.border} ${c.activeBg}`
              : `${base} ${c.text} ${c.border} ${c.hover}`;
            return (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={cls}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}









