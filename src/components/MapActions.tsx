'use client';

export default function MapActions({ onAddLocation }: { onAddLocation: () => void }) {
  return (
    <div className="pointer-events-none absolute right-6 top-6 z-20">
      <button
        onClick={onAddLocation}
        className="pointer-events-auto rounded-full border border-cyan-500 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-500/20 shadow-lg"
        title="Add a location"
      >
        + Add location
      </button>
    </div>
  );
}



