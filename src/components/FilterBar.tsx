'use client';

type Props = {
  current: string;
  onSelect: (key: string) => void;
};

// Home is now the first pill, on the SAME ROW as the rest
const tabs = [
  { key: 'home',         label: 'Home',          emoji: '🏠' },
  { key: 'hauntings',    label: 'Hauntings',     emoji: '👻' },
  { key: 'ufos',         label: 'UFOs',          emoji: '🛸' },
  { key: 'cryptids',     label: 'Cryptids',      emoji: '🐾' },
  { key: 'events',       label: 'Events',        emoji: '📅' },
  { key: 'marketplace',  label: 'Marketplace',   emoji: '💬' },
  { key: 'collaboration',label: 'Collaboration', emoji: '🤝' },
  { key: 'search',       label: 'Search',        emoji: '🔍' },
  { key: 'profile',      label: 'Profile',       emoji: '👤' },
];

export default function FilterBar({ current, onSelect }: Props) {
  return (
    <div className="sticky top-[42px] z-50 bg-[#0B0C0E]/95 backdrop-blur-md border-b border-neutral-800">
      <div className="mx-auto max-w-6xl px-4 py-3 flex gap-2 flex-wrap">
        {tabs.map((t) => {
          const active = current === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onSelect(t.key)}
              className={[
                'px-3 py-1.5 rounded-full text-sm border flex items-center gap-1',
                active
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-neutral-600 hover:bg-neutral-800'
              ].join(' ')}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


