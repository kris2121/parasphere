'use client';

export default function FilterBar() {
  const categories = [
    { id: 'hauntings', label: '👻 Hauntings' },
    { id: 'ufos', label: '🛸 UFOs' },
    { id: 'cryptids', label: '🐾 Cryptids' },
    { id: 'events', label: '📅 Events' },
    { id: 'marketplace', label: '💬 Marketplace' },
    { id: 'collaboration', label: '🤝 Collaboration' },
    { id: 'search', label: '🔍 Search' },
    { id: 'profile', label: '👤 Profile' },
  ];

  return (
    <div className="sticky top-[42px] z-50 bg-[#0B0C0E]/95 backdrop-blur-md border-b border-neutral-800 flex gap-2 overflow-x-auto p-2 text-sm">
      {categories.map((cat) => (
        <button
          key={cat.id}
          className="whitespace-nowrap rounded-xl border border-neutral-700 px-3 py-1 hover:bg-[#00FFF6]/10 hover:border-[#00FFF6] transition"
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
