'use client';

import { Dispatch, SetStateAction } from 'react';

type Props = {
  current: string;                              // active tab id
  onSelect: Dispatch<SetStateAction<string>>;   // accepts setTab directly
};

export default function FilterBar({ current, onSelect }: Props) {
  const categories: { id: string; label: string }[] = [
    { id: 'home',         label: 'Home' },
    { id: 'hauntings',    label: 'Hauntings' },
    { id: 'ufos',         label: 'UFOs' },
    { id: 'cryptids',     label: 'Cryptids' },
    { id: 'events',       label: 'Events' },
    { id: 'marketplace',  label: 'Marketplace' },
    { id: 'collaboration',label: 'Collaboration' },
  ];

  return (
    <div className="sticky top-[42px] z-40 bg-[#0B0C0E]/95 backdrop-blur-md border-b border-neutral-800 flex gap-2 overflow-x-auto p-2 text-sm">
      {categories.map(cat => {
        const active = current === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={[
              "whitespace-nowrap rounded-xl px-3 py-1 transition border",
              active
                ? "border-cyan-500 text-cyan-300 bg-cyan-500/10"
                : "border-neutral-700 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-900"
            ].join(" ")}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}




