'use client';

type Props = {
  onAddLocation?: () => void; // now OPTIONAL
};

export default function MapActions({ onAddLocation }: Props) {
  // If no actions are available (like now), render nothing
  if (!onAddLocation) {
    return (
      <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-3 md:p-4">
        {/* Empty container reserved for future map actions */}
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 flex items-end justify-end p-3 md:p-4">
      <div className="pointer-events-auto flex flex-col gap-2">
        <button
          type="button"
          onClick={onAddLocation}
          className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-black/80 px-3 py-1.5 text-xs font-medium text-white/90 shadow-lg hover:bg-black"
        >
          <span className="text-lg leading-none">+</span>
          <span>Add Location</span>
        </button>
      </div>
    </div>
  );
}






