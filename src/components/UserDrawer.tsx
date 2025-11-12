'use client';

import { useEffect, useMemo, useState } from 'react';

export type UserMini = {
  id: string;
  name: string;
  team?: string;
  location?: string;
  bio?: string;
  website?: string;
  avatarUrl?: string;
};

type Props = {
  open: boolean;
  user?: UserMini;
  /** show a star tally if you like */
  stars?: number;

  onGiveStar?: (userId: string) => void;
  onFollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onBlock?: (userId: string) => void;
  onReport?: (userId: string) => void;
  /** called with the edited profile (id preserved) */
  onSave?: (next: UserMini) => void;

  onClose: () => void;

  /** where to render it; 'center' keeps it inside the map container */
  variant?: 'center' | 'right';
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
  onSave,
  onClose,
  variant = 'center',
}: Props) {
  const u = user ?? { id: 'u_current', name: 'You' };

  // local editable fields
  const [name, setName] = useState(u.name ?? '');
  const [place, setPlace] = useState(u.location ?? '');
  const [bio, setBio] = useState(u.bio ?? '');
  const [website, setWebsite] = useState(u.website ?? '');

  useEffect(() => {
    // hydrate form when user changes
    setName(u.name ?? '');
    setPlace(u.location ?? '');
    setBio(u.bio ?? '');
    setWebsite(u.website ?? '');
  }, [u.id]);

  // esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const Panel = (
    <div
      className="w-full max-w-md overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-3">
        {/* avatar */}
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-neutral-800 bg-neutral-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {u.avatarUrl ? (
            <img src={u.avatarUrl} alt={u.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
              IMG
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm text-neutral-400">Editing Profile</div>
          <div className="truncate text-lg font-semibold">{u.name || 'You'}</div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            className="rounded-md border border-yellow-600/60 bg-yellow-500/10 px-2 py-1 text-sm text-yellow-300 hover:bg-yellow-500/20"
            onClick={() => onGiveStar?.(u.id)}
          >
            Star {stars > 0 ? `(${stars})` : ''}
          </button>
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-700 px-2.5 py-1.5 text-sm hover:bg-neutral-900"
          >
            Close
          </button>
        </div>
      </div>

      {/* Body (content-sized with internal scroll) */}
      <div className="max-h-[80vh] overflow-y-auto px-4 pb-5 pt-4">
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className="text-xs text-neutral-400">Display name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none"
              placeholder="Your display name"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-neutral-400">Location</span>
            <input
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none"
              placeholder="City, Country"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-neutral-400">Website</span>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none"
              placeholder="https://example.com"
              inputMode="url"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs text-neutral-400">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[100px] rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none"
              placeholder="A short introduction…"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={() => onFollow?.(u.id)}
              className="rounded-md border border-cyan-500/70 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300 hover:bg-cyan-500/20"
            >
              Follow
            </button>
            <button
              onClick={() => onMessage?.(u.id)}
              className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-900"
            >
              Message
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() =>
                  onSave?.({
                    ...u,
                    name: name.trim(),
                    location: place.trim(),
                    website: website.trim(),
                    bio: bio.trim(),
                  })
                }
                className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300 hover:bg-cyan-500/20"
              >
                Save
              </button>
              <button
                onClick={() => onReport?.(u.id)}
                className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-900"
              >
                Report
              </button>
              <button
                onClick={() => onBlock?.(u.id)}
                className="rounded-md border border-red-500/70 bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20"
              >
                Block
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // centered variant (bounded by parent map container)
  if (variant === 'center') {
    return (
      <>
        <div className="absolute inset-0 z-[95] bg-black/60" onClick={onClose} />
        <div className="absolute inset-0 z-[96] flex items-start justify-center p-3 md:p-6">
          {Panel}
        </div>
      </>
    );
  }

  // fallback: slide-in right
  return (
    <>
      <div className="fixed inset-0 z-[95] bg-black/60" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-[96] flex items-start justify-end p-3 md:p-4">
        {Panel}
      </div>
    </>
  );
}

