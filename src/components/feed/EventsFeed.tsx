'use client';

import React from 'react';
import { Mail, Edit2, Trash2 } from 'lucide-react';

export type EventsFeedEvent = {
  id: string;
  title: string;
  description?: string;
  locationText?: string;
  startISO?: string;
  endISO?: string;
  priceText?: string;
  link?: string;
  imageUrl?: string;
  createdAt: number;
  postedBy?: { id: string; name: string };
  countryCode?: string;
  postalCode?: string;
  // Page.tsx extends this with socialLinks + locationId, that’s fine
  [key: string]: any;
};

type Props = {
  country: string;
  events: EventsFeedEvent[];
  onMessageUser: (userId: string) => void;
  onOpenLocation: (locId: string) => void;

  // NEW: open profile for poster
  onOpenUser: (userId: string) => void;

  // owner controls + image zoom + edit
  currentUserId: string;
  onEditEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onOpenImage: (src: string) => void;
};

function formatShortDate(isoOrMs?: string | number) {
  if (!isoOrMs) return '';
  const d =
    typeof isoOrMs === 'number' ? new Date(isoOrMs) : new Date(isoOrMs);
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EventsFeed({
  country,
  events,
  onMessageUser,
  onOpenLocation,
  onOpenUser,
  currentUserId,
  onEditEvent,
  onDeleteEvent,
  onOpenImage,
}: Props) {
  // Country scope (same idea as Marketplace)
  const scoped = events.filter((ev) => {
    if (!country || country.toUpperCase() === 'EU') return true;
    if (!ev.countryCode) return true;
    return ev.countryCode.toUpperCase() === country.toUpperCase();
  });

  // Newest first
  const sorted = [...scoped].sort((a, b) => b.createdAt - a.createdAt);

  function handleDelete(id: string) {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;
    onDeleteEvent(id);
  }

  return (
    <div className="space-y-4">
      {sorted.length === 0 && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
          No events have been added for this country yet.
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((ev) => {
          const isOwner = ev.postedBy?.id === currentUserId;
          const dateLabel = ev.startISO
            ? formatShortDate(ev.startISO)
            : formatShortDate(ev.createdAt);

          const socialLinks: Array<{ platform: string; url: string }> =
            Array.isArray((ev as any).socialLinks)
              ? (ev as any).socialLinks
              : [];

          return (
            <div
              key={ev.id}
              className="flex gap-3 rounded-lg border border-purple-500/50 bg-[#07040D] p-3 text-sm"
            >
              {/* IMAGE LEFT – same pattern as Marketplace, with pointer + lightbox */}
              {ev.imageUrl && (
                <button
                  type="button"
                  onClick={() => onOpenImage(ev.imageUrl!)}
                  className="h-20 w-28 shrink-0 overflow-hidden rounded-md bg-neutral-950 md:h-24 md:w-32 cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ev.imageUrl}
                    alt={ev.title}
                    className="h-full w-full object-cover"
                  />
                </button>
              )}

              {/* MAIN CONTENT */}
              <div className="flex flex-1 flex-col gap-1">
                {/* Title + country/postcode + timestamp + owner controls */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      {ev.title}
                    </h2>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                      {/* Country + postcode pill – match Marketplace layout */}
                      {ev.countryCode && (
                        <span className="rounded-full bg-neutral-900 px-2 py-0.5">
                          {ev.countryCode}
                          {ev.postalCode && ` • ${ev.postalCode}`}
                        </span>
                      )}

                      {dateLabel && (
                        <span className="text-neutral-500">{dateLabel}</span>
                      )}
                    </div>
                  </div>

                  {/* EDIT / DELETE – owner only */}
                  {isOwner && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onEditEvent(ev.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-purple-400/80 bg-purple-500/10 px-2 py-0.5 text-[11px] text-purple-100 hover:bg-purple-500/20"
                      >
                        <Edit2 size={12} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(ev.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-500/70 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-200 hover:bg-red-500/20"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                {ev.description && (
                  <p className="mt-1 text-xs text-neutral-300 whitespace-pre-line">
                    {ev.description}
                  </p>
                )}

                {/* Social link chips (YouTube, TikTok, etc.) */}
                {socialLinks.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {socialLinks.map((s, idx) => (
                      <button
                        key={`${s.platform}-${idx}`}
                        type="button"
                        onClick={() => {
                          if (s.url) window.open(s.url, '_blank');
                        }}
                        className="rounded-full border border-purple-400 bg-purple-500/10 px-3 py-1 text-[11px] text-purple-100 hover:bg-purple-500/20"
                      >
                        {s.platform || 'Link'}
                      </button>
                    ))}
                  </div>
                )}

<div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-neutral-500">
  <span>
    Posted by{' '}
    {ev.postedBy?.id ? (
      <button
        type="button"
        onClick={() => onOpenUser(ev.postedBy!.id)}
        className="font-medium text-purple-300 hover:text-purple hover:underline"
      >
        {ev.postedBy?.name || 'User'}
      </button>
    ) : (
      <span className="font-medium text-neutral-300">
        {ev.postedBy?.name || 'User'}
      </span>
    )}
    {dateLabel && <> • {dateLabel}</>}
  </span>

  <div className="flex flex-wrap gap-2">
    {(ev as any).locationId && (
      <button
        type="button"
        onClick={() =>
          onOpenLocation((ev as any).locationId as string)
        }
        className="rounded-full border border-purple-400 bg-purple-500/10 px-3 py-1 text-[11px] text-purple-100 hover:bg-purple-500/20"
      >
        View on map
      </button>
    )}

    {ev.postedBy?.id &&
      ev.postedBy.id !== currentUserId && (
        <button
          type="button"
          onClick={() => onMessageUser(ev.postedBy!.id)}
          className="inline-flex items-center gap-1 rounded-full border border-neutral-500 bg-neutral-800 px-3 py-1 text-[11px] text-neutral-100 hover:bg-neutral-700"
        >
          <Mail size={12} />
          Message host
        </button>
      )}
  </div>
</div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}












