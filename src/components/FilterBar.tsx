'use client';

import React from 'react';
import {
  Home,
  Ghost,
  Orbit,
  PawPrint,
  CalendarClock,
  Store,
  Handshake,
} from 'lucide-react';

type TabKey =
  | 'home'
  | 'hauntings'
  | 'ufos'
  | 'cryptids'
  | 'events'
  | 'marketplace'
  | 'collaboration'
  | 'profile';

type Props = {
  query: string;
  setQuery: (v: string) => void;
  activeTab: TabKey;
  onTabChange: (k: TabKey) => void;

  // for profile avatar/initials
  currentUser?: {
    name?: string;
    avatarUrl?: string;
  };
};

const TABS: Array<{
  key: TabKey;
  label: string;
  color: string; // tailwind text color
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { key: 'home',          label: 'Home',          color: 'text-cyan-300',    icon: Home },
  { key: 'hauntings',     label: 'Hauntings',     color: 'text-white',       icon: Ghost },
  { key: 'ufos',          label: 'UFOs',          color: 'text-green-300',   icon: Orbit },
  { key: 'cryptids',      label: 'Cryptids',      color: 'text-orange-300',  icon: PawPrint },
  { key: 'events',        label: 'Events',        color: 'text-purple-300',  icon: CalendarClock },
  { key: 'marketplace',   label: 'Marketplace',   color: 'text-blue-300',    icon: Store },
  { key: 'collaboration', label: 'Collaboration', color: 'text-neutral-300', icon: Handshake },
  // 'profile' handled specially at render time (avatar/USER)
  { key: 'profile',       label: 'Profile',       color: 'text-red-300' },
];

function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(' ');
}

export default function FilterBar({
  query,
  setQuery,
  activeTab,
  onTabChange,
  currentUser,
}: Props) {
  const initials =
    (currentUser?.name || 'USER')
      .trim()
      .split(/\s+/)
      .map((p) => p[0]?.toUpperCase())
      .slice(0, 2)
      .join('') || 'USER';

  return (
    <div className="flex items-center gap-3">
      {/* search */}
      <div className="min-w-0 flex-1">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search locations, posts, people…"
          className="w-full rounded-md border border-neutral-800 bg-neutral-900/70 px-3 py-2 text-sm outline-none placeholder-neutral-500 focus:border-neutral-700"
          aria-label="Search"
        />
      </div>

      {/* tabs */}
      <nav className="flex items-center gap-1 overflow-auto">
        {TABS.map(({ key, label, color, icon: Icon }) => {
          const isActive = activeTab === key;

          // Special render for profile: avatar or red USER badge
          if (key === 'profile') {
            const hasAvatar = Boolean(currentUser?.avatarUrl);
            return (
              <button
                key={key}
                type="button"
                onClick={() => onTabChange(key)}
                title={label}
                aria-label={label}
                className={cx(
                  'relative inline-flex h-9 w-9 items-center justify-center rounded-full border',
                  isActive ? 'border-neutral-600 bg-neutral-900' : 'border-neutral-800 hover:bg-neutral-900/50'
                )}
              >
                {hasAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentUser!.avatarUrl!}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600/20 text-[10px] font-semibold uppercase tracking-wide text-red-300">
                    {initials || 'USER'}
                  </div>
                )}
                <span className="sr-only">{label}</span>
              </button>
            );
          }

          // Normal icon tabs
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              title={label}
              aria-label={label}
              className={cx(
                'inline-flex h-9 w-9 items-center justify-center rounded-full border',
                isActive ? 'border-neutral-600 bg-neutral-900' : 'border-neutral-800 hover:bg-neutral-900/50'
              )}
            >
              {Icon ? <Icon size={18} className={color} /> : <span className={color}>•</span>}
              <span className="sr-only">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}











