'use client';

import React, { useMemo } from 'react';
import {
  Mail,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
} from 'lucide-react';

export type CollabItem = {
  id: string;
  title: string;
  description?: string;
  dateISO?: string;
  locationText?: string;
  priceText?: string;
  contact?: string;
  imageUrl?: string;
  createdAt: number;
  postedBy: { id: string; name: string; avatarUrl?: string };
  countryCode?: string;
  postalCode?: string;
  locationId?: string;

  // page.tsx may extend with extra fields (e.g. socialLinks etc)
  [key: string]: any;
};

type Props = {
  country: string;
  items: CollabItem[];

  currentUserId: string;

  // NEW: admin flag
  isAdmin: boolean;

  onMessageUser: (userId: string) => void;
  onOpenLocation: (locId: string) => void;
  onOpenUser: (userId: string) => void;
  onOpenImage: (src: string) => void;

  onEditCollab: (id: string) => void;
  onDeleteCollab: (id: string) => void;
};

function getLinkLabel(url?: string) {
  if (!url) return 'Link';
  const u = url.toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube';
  if (u.includes('tiktok.com')) return 'TikTok';
  if (u.includes('instagram.com')) return 'Instagram';
  if (u.includes('facebook.com')) return 'Facebook';
  return 'Link';
}

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

export default function CollaborationFeed({
  country,
  items,
  currentUserId,
  isAdmin,
  onMessageUser,
  onOpenLocation,
  onOpenUser,
  onOpenImage,
  onEditCollab,
  onDeleteCollab,
}: Props) {
  const filtered = useMemo(
    () =>
      items.filter((c) => {
        if (!country || country.toUpperCase() === 'EU') return true;
        const code = c.countryCode;
        if (!code) return true;
        return code.toUpperCase() === country.toUpperCase();
      }),
    [items, country],
  );

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const da = a.dateISO ? new Date(a.dateISO).getTime() : a.createdAt;
        const db = b.dateISO ? new Date(b.dateISO).getTime() : b.createdAt;
        return da - db;
      }),
    [filtered],
  );

  function handleDelete(id: string) {
    if (!window.confirm('Delete this collaboration? This cannot be undone.')) {
      return;
    }
    onDeleteCollab(id);
  }

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
        No collaboration posts yet for this country.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((c) => {
        const isOwner = c.postedBy.id === currentUserId;
        const canEdit = isAdmin || isOwner;

        const dateLabel = c.dateISO
          ? formatShortDate(c.dateISO)
          : formatShortDate(c.createdAt);
        const linkLabel = getLinkLabel(c.contact);

        return (
          <div
            key={c.id}
            className="flex gap-3 rounded-lg border border-emerald-500/60 bg-neutral-900/95 p-3 text-sm"
          >
            {/* IMAGE THUMB – same pattern as Marketplace/Events */}
            {c.imageUrl && (
              <button
                type="button"
                onClick={() => onOpenImage(c.imageUrl!)}
                className="h-20 w-28 shrink-0 cursor-pointer overflow-hidden rounded-md bg-neutral-950 md:h-24 md:w-32"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.imageUrl}
                  alt={c.title}
                  className="h-full w-full object-cover"
                />
              </button>
            )}

            {/* MAIN CONTENT */}
            <div className="flex flex-1 flex-col gap-1">
              {/* Top row: title + edit/delete */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    {c.title}
                  </h2>
                  {/* no date/time here – just title */}
                </div>

                {canEdit && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onEditCollab(c.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-400/80 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-100 hover:bg-emerald-500/20"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-red-500/70 bg-red-500/10 px-3 py-1 text-[11px] text-red-200 hover:bg-red-500/20"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              {c.description && (
                <p className="mt-1 whitespace-pre-line text-xs text-neutral-300">
                  {c.description}
                </p>
              )}

              {/* Contact link – green accent with icon */}
              {c.contact && (
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <a
                    href={c.contact}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-emerald-400/80 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-100 hover:bg-emerald-500/20"
                  >
                    <ExternalLink size={12} />
                    {linkLabel}
                  </a>
                </div>
              )}

              {/* Footer: posted by + view on map + message */}
              <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-neutral-500">
                <span>
                  Posted by{' '}
                  <button
                    type="button"
                    onClick={() => onOpenUser(c.postedBy.id)}
                    className="font-medium text-emerald-200 hover:underline"
                  >
                    {c.postedBy.name || 'User'}
                  </button>
                  {dateLabel && <> • {dateLabel}</>}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {c.locationId && (
                    <button
                      type="button"
                      onClick={() => onOpenLocation(c.locationId!)}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-400/80 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-100 hover:bg-emerald-500/20"
                    >
                      <MapPin size={12} />
                      View on map
                    </button>
                  )}

                  {!isOwner && (
                    <button
                      type="button"
                      onClick={() => onMessageUser(c.postedBy.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-600 bg-neutral-800 px-3 py-1 text-[11px] text-neutral-100 hover:bg-neutral-700"
                    >
                      <Mail size={12} />
                      Message team
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
