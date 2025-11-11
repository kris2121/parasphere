'use client';

import { useEffect } from 'react';

export type UserMini = {
  id: string;
  name: string;
  team?: string;
  location?: string;
  avatarUrl?: string;
};

export default function UserDrawer({
  open,
  user,
  stars = 0,
  onGiveStar,
  onFollow,
  onMessage,
  onBlock,
  onReport,
  onClose,
}: {
  open: boolean;
  user?: UserMini;
  stars?: number;
  onGiveStar?: (userId: string) => void;
  onFollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onBlock?: (userId: string) => void;
  onReport?: (userId: string) => void;
  onClose: () => void;
}) {
  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !user) return null;

  return (
    <>
      <div className="fixed inset-0 z-[95] bg-black/60" onClick={onClose} />
      <div className="fixed right-0 top-0 z-[96] h-full w-full max-w-md border-l border-neutral-800 bg-neutral-950 shadow-2xl">
        <div className="p-4 border-b border-neutral-800 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatarUrl || 'https://i.pravatar.cc/100?img=5'}
            alt={user.name}
            className="h-12 w-12 rounded-full border border-neutral-800 object-cover"
          />
          <div className="min-w-0">
            <div className="text-lg font-semibold truncate">{user.name}</div>
            <div className="text-xs text-neutral-400">
              {[user.team, user.location].filter(Boolean).join(" • ") || 'Explorer'}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => onGiveStar?.(user.id)}
              className="inline-flex items-center gap-1 rounded-full border border-yellow-600/60 bg-yellow-500/10 px-2 py-1 text-xs text-yellow-300 hover:bg-yellow-500/20"
              title="Give a star"
            >
              ★ <span className="min-w-[1.2rem] text-center">{stars}</span>
            </button>
            <button onClick={onClose} className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-900">
              Close
            </button>
          </div>
        </div>

        <div className="p-4 flex flex-wrap gap-2">
          <button onClick={() => onFollow?.(user.id)}  className="rounded-md border border-cyan-500/70 px-3 py-1.5 text-sm text-cyan-300 hover:bg-cyan-500/10">Follow</button>
          <button onClick={() => onMessage?.(user.id)} className="rounded-md border border-blue-500/70 px-3 py-1.5 text-sm text-blue-300 hover:bg-blue-500/10">Message</button>
          <button onClick={() => onBlock?.(user.id)}   className="rounded-md border border-neutral-600 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-800">Block</button>
          <button onClick={() => onReport?.(user.id)}  className="rounded-md border border-red-500/70 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10">Report</button>
        </div>

        {/* Future: user’s own summary / counts could live here */}
      </div>
    </>
  );
}
