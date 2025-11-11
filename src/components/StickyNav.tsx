'use client';

export default function StickyNav() {
  return (
    <div className="sticky top-0 z-50 bg-black/80 border-b border-neutral-800 backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2 text-cyan-300 font-semibold">
        <div>ParaSphere</div>
        <nav className="flex gap-3 text-sm">
          <button className="hover:text-cyan-100">UFO</button>
          <button className="hover:text-cyan-100">Cryptids</button>
          <button className="hover:text-cyan-100">Hauntings</button>
        </nav>
      </div>
    </div>
  );
}