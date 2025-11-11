'use client';

export default function LiveMapPlaceholder() {
  return (
    <div className="sticky top-[42px] z-40">
      <div className="h-[42vh] w-full bg-neutral-900 border-b border-neutral-800 grid place-items-center">
        <div className="text-neutral-400 text-sm">
          Live Map (Mapbox) — centered on your location • zoomable • filters above
        </div>
      </div>
    </div>
  );
}
