'use client';

import { useEffect, useRef } from 'react';
import { LocationData } from './LiveMap';

type Props = {
  open: boolean;
  location?: LocationData;
  onGiveLocationStar?: (locId: string) => void;
  onClickLocationTitle?: () => void;
  onFollowLocation?: (locId: string) => void;
  isFollowed?: boolean;
  onClose: () => void;

  /** where to render it; 'center' keeps it inside the map container */
  variant?: 'center' | 'right';
};

export default function LocationDrawer({
  open,
  location,
  onGiveLocationStar,
  onClickLocationTitle,
  onFollowLocation,
  isFollowed = false,
  onClose,
  variant = 'center',
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !location) return null;

  const starCount = (undefined as unknown as Record<string, number>)?.[location.id] ?? 0; // (stars passed in page.tsx if you need it)

  // ---- helpers (colors for type dot) ----
  const typeDot =
    location.type === 'HAUNTING'
      ? '#ffffff'
      : location.type === 'UFO'
      ? '#9ee37d'
      : location.type === 'EVENT'
      ? '#b18cff'
      : '#f2a65a';

  // ====== CENTERED VARIANT (recommended) ======
  if (variant === 'center') {
    return (
      // Must live inside a parent with `relative` (the map wrapper)
      <>
        {/* local backdrop, bounded by parent */}
        <div className="absolute inset-0 z-[95] bg-black/60" onClick={onClose} />

        {/* center container */}
        <div className="absolute inset-0 z-[96] flex items-start justify-center p-3 md:p-6">
          <div
            ref={panelRef}
            className="w-full max-w-xl overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header image */}
            <button className="block w-full" onClick={onClose} title="Close">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={location.imageUrl || 'https://picsum.photos/800/400'}
                alt={location.title}
                className="h-44 w-full object-cover"
              />
            </button>

            {/* Body (scrolls if long) */}
            <div className="max-h-[80vh] overflow-y-auto px-4 pb-5 pt-3">
              {/* Title + actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2
                    className="truncate text-lg font-semibold cursor-pointer hover:text-cyan-300"
                    onClick={onClickLocationTitle}
                    title={location.title}
                  >
                    {location.title}
                  </h2>

                  {location.summary && (
                    <p className="text-sm text-neutral-300 mt-1">{location.summary}</p>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: typeDot }}
                      />
                      <span className="uppercase tracking-wide">{location.type}</span>
                    </span>

                    <button
                      onClick={() => onGiveLocationStar?.(location.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-yellow-600/60 bg-yellow-500/10 px-2 py-0.5 text-yellow-300 hover:bg-yellow-500/20"
                      title="Give this location a star"
                    >
                      <span className="leading-none">Star</span>
                      <span className="min-w-[1.4rem] text-center">{starCount}</span>
                    </button>

                    <button
                      onClick={() => onFollowLocation?.(location.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-500/70 bg-cyan-500/10 px-2 py-0.5 text-cyan-300 hover:bg-cyan-500/20"
                      title={isFollowed ? 'Unfollow location' : 'Follow location'}
                    >
                      {isFollowed ? 'Following' : 'Follow'}
                    </button>
                  </div>

                  {/* meta (no emojis) */}
                  <div className="mt-2 grid gap-x-6 gap-y-1 text-xs text-neutral-400 md:grid-cols-2">
                    {location.address && (
                      <div>
                        <span className="text-neutral-500">Address:</span> {location.address}
                      </div>
                    )}
                    {location.priceInfo && (
                      <div>
                        <span className="text-neutral-500">Price:</span> {location.priceInfo}
                      </div>
                    )}
                    {location.website && (
                      <div>
                        <a
                          href={location.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-300 hover:underline"
                        >
                          Website
                        </a>
                      </div>
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
          </div>
        </div>
      </>
    );
  }

  // ====== fallback 'right' variant (legacy slide-in) ======
  return (
    <>
      <div className="fixed inset-0 z-[95] bg-black/60" onClick={onClose} />
      <div
        ref={panelRef}
        className="fixed right-0 top-0 z-[96] h-full w-full max-w-xl border-l border-neutral-800 bg-neutral-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header image */}
        <button className="block w-full" onClick={onClose} title="Close">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={location.imageUrl || 'https://picsum.photos/800/400'}
            alt={location.title}
            className="h-44 w-full object-cover"
          />
        </button>

        <div className="max-h-full overflow-y-auto px-4 pb-5 pt-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2
                className="truncate text-lg font-semibold cursor-pointer hover:text-cyan-300"
                onClick={onClickLocationTitle}
                title={location.title}
              >
                {location.title}
              </h2>
              {location.summary && (
                <p className="text-sm text-neutral-300 mt-1">{location.summary}</p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ background: typeDot }}
                  />
                  <span className="uppercase tracking-wide">{location.type}</span>
                </span>

                <button
                  onClick={() => onGiveLocationStar?.(location.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-yellow-600/60 bg-yellow-500/10 px-2 py-0.5 text-yellow-300 hover:bg-yellow-500/20"
                  title="Give this location a star"
                >
                  <span className="leading-none">Star</span>
                  <span className="min-w-[1.4rem] text-center">{starCount}</span>
                </button>

                <button
                  onClick={() => onFollowLocation?.(location.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-500/70 bg-cyan-500/10 px-2 py-0.5 text-cyan-300 hover:bg-cyan-500/20"
                >
                  {isFollowed ? 'Following' : 'Follow'}
                </button>
              </div>

              <div className="mt-2 grid gap-x-6 gap-y-1 text-xs text-neutral-400 md:grid-cols-2">
                {location.address && (
                  <div>
                    <span className="text-neutral-500">Address:</span> {location.address}
                  </div>
                )}
                {location.priceInfo && (
                  <div>
                    <span className="text-neutral-500">Price:</span> {location.priceInfo}
                  </div>
                )}
                {location.website && (
                  <div>
                    <a
                      href={location.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-300 hover:underline"
                    >
                      Website
                    </a>
                  </div>
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
      </div>
    </>
  );
}








