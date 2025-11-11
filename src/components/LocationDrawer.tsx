'use client';

import { useEffect, useRef } from 'react';
import { LocationData } from './LiveMap';

type Post = {
  id: string;
  title: string;
  desc: string;
  imageUrl?: string;
  linkUrl?: string;
  authorId: string;
  authorName: string;
  createdAt: number;
};

export default function LocationDrawer({
  open,
  location,
  postsForLocation = [],
  locationStars,
  onGiveLocationStar,
  onClickAuthor,
  onClickLocationTitle,
  onFollowLocation,   // <-- NEW
  isFollowed = false, // <-- NEW
  onClose,
}: {
  open: boolean;
  location?: LocationData;
  postsForLocation?: Post[];
  locationStars?: Record<string, number>;
  onGiveLocationStar?: (locId: string) => void;
  onClickAuthor?: (userId: string) => void;
  onClickLocationTitle?: () => void;
  onFollowLocation?: (locId: string) => void;    // <-- NEW
  isFollowed?: boolean;                           // <-- NEW
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !location) return null;
  const starCount = locationStars?.[location.id] ?? 0;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[95] bg-black/60" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed right-0 top-0 z-[96] h-full w-full max-w-xl border-l border-neutral-800 bg-neutral-950 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Clickable header image to close */}
        <button className="block w-full" onClick={onClose} title="Close">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={location.imageUrl || 'https://picsum.photos/800/400'}
            alt={location.title}
            className="h-44 w-full object-cover"
          />
        </button>

        {/* Sticky meta header */}
        <div className="px-4 pt-3 pb-2 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur sticky top-0 z-10">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2
                className="truncate text-lg font-semibold cursor-pointer hover:text-cyan-300"
                onClick={onClickLocationTitle}
                title={location.title}
              >
                {location.title}
              </h2>

              {location.summary && (
                <p className="text-sm text-neutral-300 line-clamp-2">{location.summary}</p>
              )}

              <div className="mt-1 flex items-center gap-3 text-xs text-neutral-400">
                <span className="inline-flex items-center gap-1">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{
                      background:
                        location.type === 'HAUNTING' ? '#ffffff'
                        : location.type === 'UFO' ? '#9ee37d'
                        : location.type === 'EVENT' ? '#b18cff'
                        : '#f2a65a'
                    }}
                  />
                  {location.type}
                </span>

                <button
                  onClick={() => onGiveLocationStar?.(location.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-yellow-600/60 bg-yellow-500/10 px-2 py-0.5 text-yellow-300 hover:bg-yellow-500/20"
                  title="Give this location a star"
                >
                  ★ <span className="min-w-[1.2rem] text-center">{starCount}</span>
                </button>

                {/* Follow / Unfollow */}
                <button
                  onClick={() => onFollowLocation?.(location.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-cyan-500/70 bg-cyan-500/10 px-2 py-0.5 text-cyan-300 hover:bg-cyan-500/20"
                  title={isFollowed ? 'Unfollow location' : 'Follow location'}
                >
                  {isFollowed ? 'Following' : 'Follow'}
                </button>
              </div>

              {/* quick meta */}
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-400">
                {location.address && <span>📍 {location.address}</span>}
                {location.priceInfo && <span>💷 {location.priceInfo}</span>}
                {location.website && (
                  <a href={location.website} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">
                    Website
                  </a>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="shrink-0 rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-900"
            >
              Close
            </button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6 pt-3">
          <h3 className="mb-2 text-sm font-semibold text-neutral-200">Latest posts</h3>
          <div className="grid gap-3">
            {postsForLocation.length === 0 && (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-sm text-neutral-400">
                No posts yet. Be the first to share an update.
              </div>
            )}
            {postsForLocation.map((p) => (
              <article key={p.id} className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
                <div className="mb-1 flex items-center justify-between text-xs text-neutral-400">
                  <div>
                    by{' '}
                    <button
                      className="text-cyan-300 hover:underline"
                      onClick={() => onClickAuthor?.(p.authorId)}
                    >
                      {p.authorName}
                    </button>
                  </div>
                  <div>{new Date(p.createdAt).toLocaleString()}</div>
                </div>
                <h4 className="text-sm font-semibold">{p.title}</h4>
                <p className="text-sm text-neutral-300">{p.desc}</p>
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="mt-2 rounded-md border border-neutral-800" />
                )}
                {p.linkUrl && (
                  <a
                    href={p.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-cyan-300 hover:underline text-sm"
                  >
                    View link
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}







