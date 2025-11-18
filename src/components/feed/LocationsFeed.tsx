'use client';

import React from 'react';
import { Mail, Edit2, Trash2 } from 'lucide-react';

export type LocationFeedItem = {
  id: string;
  title: string;
  summary?: string;
  imageUrl?: string;
  address?: string;
  priceInfo?: string;
  website?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  verifiedByOwner?: boolean;
  postedBy?: { id: string; name: string };
  createdAt?: number;
  countryCode?: string;
  postalCode?: string;
  stars: number;
  reviewCount: number;
};

type Props = {
  items: LocationFeedItem[];
  currentUserId: string;

  // CARD CLICK → open drawer for that location
  onOpenLocation: (locId: string) => void;

  // "View on map" → just focus map
  onOpenMap: (locId: string) => void;

  onOpenUser: (userId: string) => void;

  onAddReview: (locId: string) => void;
  onEditLocation: (locId: string) => void;
  onDeleteLocation: (locId: string) => void;

  onMessageUser: (userId: string) => void;

  formatShortDate: (ms: number) => string;
};

export default function LocationsFeed({
  items,
  currentUserId,
  onOpenLocation,
  onOpenMap,
  onOpenUser,
  onAddReview,
  onEditLocation,
  onDeleteLocation,
  onMessageUser,
  formatShortDate,
}: Props) {
  const sorted = [...items].sort(
    (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
  );

  return (
    <div className="space-y-3">
      {sorted.map((loc) => {
        const isOwner = loc.postedBy?.id === currentUserId;

        return (
          <div
            key={loc.id}
            onClick={() => onOpenLocation(loc.id)}
            className="flex cursor-pointer gap-3 rounded-lg border border-white/30 bg-neutral-900 p-3 text-sm hover:border-white/60 hover:bg-neutral-900/80"
          >
            {/* LEFT: Image (still clickable, but handled by card onClick now) */}
            {loc.imageUrl && (
              <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md bg-neutral-950 md:h-24 md:w-32">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={loc.imageUrl}
                  alt={loc.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* MAIN CONTENT */}
            <div className="flex flex-1 flex-col gap-1">
              {/* TITLE + OWNER CONTROLS */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-white">
                      {loc.title}
                    </h2>

                    {loc.verifiedByOwner && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/70 bg-emerald-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-300" />
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                    {loc.countryCode && (
                      <span className="rounded-full bg-neutral-900 px-2 py-0.5">
                        {loc.countryCode}
                        {loc.postalCode && ` • ${loc.postalCode}`}
                      </span>
                    )}

                    {loc.createdAt && (
                      <span className="text-neutral-500">
                        {formatShortDate(loc.createdAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* EDIT / DELETE */}
                {isOwner && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditLocation(loc.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/10 px-2 py-0.5 text-[11px] text-white hover:bg-white/20"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            'Delete this location? This cannot be undone.',
                          )
                        ) {
                          onDeleteLocation(loc.id);
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-red-500/70 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-200 hover:bg-red-500/20"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* SUMMARY TEXT */}
              {loc.summary && (
                <p className="mt-1 text-xs text-neutral-300 whitespace-pre-line">
                  {loc.summary}
                </p>
              )}

              {/* CONTACT ROW */}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-neutral-300">
                {loc.address && (
                  <span className="truncate">
                    <span className="opacity-70">Contact:</span> {loc.address}
                  </span>
                )}
                {loc.priceInfo && (
                  <span>
                    <span className="opacity-70">Price:</span> {loc.priceInfo}
                  </span>
                )}
                {loc.website && (
                  <span className="truncate">
                    <span className="opacity-70">Site:</span> {loc.website}
                  </span>
                )}
              </div>

              {/* SOCIAL LINKS */}
              {loc.socialLinks && loc.socialLinks.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {loc.socialLinks.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(s.url, '_blank');
                      }}
                      className="rounded-full border border-white/50 bg-white/10 px-3 py-1 text-[11px] text-white hover:bg-white/20"
                    >
                      {s.platform}
                    </button>
                  ))}
                </div>
              )}

              {/* FOOTER — like Events */}
              <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-neutral-500">
                {/* Posted by + Stars + Reviews */}
                <span>
                  {loc.postedBy && (
                    <>
                      Posted by{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenUser(loc.postedBy!.id);
                        }}
                        className="font-medium text-white hover:underline"
                      >
                        {loc.postedBy!.name}
                      </button>{' '}
                      •{' '}
                    </>
                  )}
                  ★ {loc.stars}{' '}
                  {loc.reviewCount === 1
                    ? '• 1 review'
                    : `• ${loc.reviewCount} reviews`}
                </span>

                {/* BUTTONS RIGHT */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenMap(loc.id);
                    }}
                    className="rounded-full border border-white/40 bg-white/10 px-3 py-1 text-[11px] text-white hover:bg-white/20"
                  >
                    View on map
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddReview(loc.id);
                    }}
                    className="rounded-full border border-white bg-white/10 px-3 py-1 text-[11px] text-white hover:bg-white/20"
                  >
                    + Add review
                  </button>

                  {loc.postedBy &&
                    loc.postedBy.id !== currentUserId && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMessageUser(loc.postedBy!.id);
                        }}
                        className="inline-flex items-center gap-1 rounded-full border border-neutral-500 bg-neutral-800 px-3 py-1 text-[11px] text-neutral-100 hover:bg-neutral-700"
                      >
                        <Mail size={12} />
                        Message owner
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}



