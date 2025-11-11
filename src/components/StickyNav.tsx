'use client';

export default function StickyNav({
  search,
  onSearchChange,
  onProfileClick,
}: {
  search?: string;
  onSearchChange?: (v: string) => void;
  onProfileClick?: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 bg-[#0B0C0E]/95 backdrop-blur border-b border-neutral-800">
      <div className="mx-auto max-w-6xl px-4 h-12 flex items-center justify-between gap-3">
        <div className="w-24" /> {/* left spacer (drawer button lives below) */}

        <div className="text-sm sm:text-base font-semibold tracking-wide">
          Parasphere
        </div>

        <div className="flex items-center gap-2">
          {onSearchChange ? (
            <input
              value={search ?? ''}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search posts and places"
              className="w-[180px] sm:w-[280px] rounded-md border border-neutral-700 bg-neutral-950 px-3 py-1.5 text-sm focus:outline-none focus:border-neutral-500"
            />
          ) : (
            <div className="w-[180px] sm:w-[280px]" />
          )}

          <button
            onClick={onProfileClick}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm hover:border-neutral-600"
          >
            Profile
          </button>
        </div>
      </div>
    </header>
  );
}

