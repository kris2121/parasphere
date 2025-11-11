'use client';

import LogoWordmark from './LogoWordmark';

export default function StickyNav() {
  return (
    <div className="sticky top-0 z-50 bg-[#0B0C0E]/95 backdrop-blur-md border-b border-neutral-800">
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between gap-3">

        {/* LEFT: brand (centered on small screens via justify-between + invisible spacer on right) */}
        <div className="flex-1 flex items-center">
          {/* Swap this for an <img src="/logo.svg" alt="Parasphere" className="h-6 w-auto" /> when you have a logo */}
          <LogoWordmark size="md" />
        </div>

        {/* RIGHT: reserved for future icons (keeps single-row layout tidy) */}
        <div className="flex-1 hidden sm:flex items-center justify-end gap-2">
          {/* e.g., notifications, profile avatar later */}
        </div>
      </div>
    </div>
  );
}



