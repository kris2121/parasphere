'use client';

import { useEffect, useState } from 'react';

type Item = { id: string; label: string; color: string };

const ITEMS: Item[] = [
  { id: 'home',        label: 'Home',          color: '#00fff6' }, // cyan
  { id: 'hauntings',   label: 'Hauntings',     color: '#ffffff' }, // white
  { id: 'ufos',        label: 'UFOs',          color: '#9ee37d' }, // green
  { id: 'cryptids',    label: 'Cryptids',      color: '#f2a65a' }, // orange
  { id: 'events',      label: 'Events',        color: '#b18cff' }, // purple
  { id: 'marketplace', label: 'Marketplace',   color: '#ffd166' }, // warm yellow (distinct)
  { id: 'collaboration', label: 'Collaboration', color: '#68a0ff' }, // soft blue (distinct)
];

export default function SideDrawerNav({
  current,
  onSelect,
  onSelectHome,
}: {
  current: string;
  onSelect: (tab: string) => void;
  onSelectHome: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function choose(item: Item) {
    setOpen(false);
    if (item.id === 'home') {
      onSelectHome();
      return;
    }
    onSelect(item.id);
  }

  return (
    <>
      {/* Hamburger trigger */}
      <div className="px-4 pt-3">
        <button
          onClick={() => setOpen(true)}
          className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm hover:border-neutral-600"
          aria-label="Open navigation"
        >
          Menu
        </button>
      </div>

      {/* Dim background */}
      {open && (
        <div className="fixed inset-0 z-[95] bg-black/50" onClick={() => setOpen(false)} />
      )}

      {/* Drawer panel */}
      <aside
        className={`fixed left-0 top-0 z-[96] h-full w-64 transform
          border-r border-neutral-800 shadow-2xl
          bg-neutral-950/75 backdrop-blur-md
          transition-transform ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Section navigation"
      >
        <div className="p-4 border-b border-neutral-800">
          <div className="text-lg font-semibold">Parasphere</div>
          <div className="text-xs text-neutral-400">Navigate</div>
        </div>

        <nav className="p-3 space-y-2">
          {ITEMS.map((t) => {
            const active = current === t.id;
            const ring = active ? `ring-1` : `ring-0`;
            return (
              <button
                key={t.id}
                onClick={() => choose(t)}
                className={`w-full text-left rounded-full px-4 py-2
                  border transition
                  ${active
                    ? 'bg-neutral-900/80'
                    : 'hover:bg-neutral-900/60'}
                `}
                style={{
                  color: t.color,
                  borderColor: active ? t.color : 'rgba(120,120,120,0.3)',
                  boxShadow: active ? `0 0 0 2px ${t.color}20 inset` : 'none',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto p-3 text-xs text-neutral-500">
          <div>© {new Date().getFullYear()} Parasphere</div>
        </div>
      </aside>
    </>
  );
}



