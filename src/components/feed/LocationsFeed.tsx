'use client';

import React from 'react';
import { Mail, Edit2, Trash2, ExternalLink } from 'lucide-react';

export type LocationFeedItem = {
  id: string;
  title: string;
  summary?: string;
  imageUrl?: string;
  website?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
  verifiedByOwner?: boolean;
  postedBy?: { id: string; name: string };
  createdAt?: number;
  stars: number;
  reviewCount: number;
};

type Props = {
  items: LocationFeedItem[];
  currentUserId: string;

  // NEW: admin flag so admins can edit/delete any location
  isAdmin: boolean;

  onOpenLocation: (locId: string) => void;
  onOpenMap: (locId: string) => void;
  onOpenUser: (userId: string) => void;

  onAddReview: (locId: string) => void;
  onEditLocation: (locId: string) => void;
  onDeleteLocation: (locId: string) => void;

  onMessageUser: (userId: string) => void;
  formatShortDate: (ms: number) => string;
};

/** Decide label for the main link pill */
function getPrimaryLabel(url: string, platform?: string) {
  const p = platform?.toLowerCase() ?? '';
  const u = url.toLowerCase();

  if (p === 'youtube' || u.includes('youtube.com') || u.includes('youtu.be')) {
    return 'YouTube';
  }
  if (p === 'tiktok' || u.includes('tiktok.com')) return 'TikTok';
  if (p === 'instagram' || u.includes('instagram.com')) return 'Instagram';
  if (p === 'facebook' || u.includes('facebook.com')) return 'Facebook';

  return platform && platform.toLowerCase() !== 'link' ? platform : 'Link';
}

export default function LocationsFeed({
  items,
  currentUserId,
  isAdmin,
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
    <div className="space-y-4">
      {sorted.map((loc) => {
        const isOwner = loc.postedBy?.id === currentUserId;
        const canManage = isOwner || isAdmin;

        const social = loc.socialLinks ?? [];

        // Primary link:
        // 1) first social link if present
        // 2) otherwise fall back to legacy `website` field
        const primarySocial = social[0];
        const primaryUrl = primarySocial?.url || loc.website || '';
        const primaryLabel = primaryUrl
          ? getPrimaryLabel(primaryUrl, primarySocial?.platform)
          : null;

        // Extra socials (skip the first one – it’s used as primary)
        const extraSocials =
          primarySocial && social.length > 1 ? social.slice(1) : social.slice(1);

        return (
          <article
            key={loc.id}
            onClick={() => onOpenLocation(loc.id)}
            className="flex cursor-pointer gap-4 rounded-lg border border-neutral-700/60 bg-neutral-900 p-4 text-sm hover:border-neutral-400/80"
          >
            {/* LEFT — IMAGE */}
            {loc.imageUrl && (
              <div className="h-24 w-32 shrink-0 overflow-hidden rounded-md bg-neutral-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={loc.imageUrl}
                  alt={loc.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* RIGHT — MAIN CONTENT */}
            <div className="flex flex-1 flex-col gap-2">
              {/* TITLE + OWNER CONTROLS */}
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-white">
                      {loc.title}
                    </h2>

                    {loc.verifiedByOwner && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                        <span className="h-2 w-2 rounded-full bg-emerald-300" />
                        Verified
                      </span>
                    )}
                  </div>

                  {loc.createdAt && (
                    <p className="text-[11px] text-neutral-400">
                      Added {formatShortDate(loc.createdAt)}
                    </p>
                  )}
                </div>

                {/* EDIT / DELETE – icon + label like other cards */}
                {canManage && (
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditLocation(loc.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-cyan-500/70 bg-cyan-500/10 px-2.5 py-1 text-[11px] text-cyan-100 hover:bg-cyan-500/20"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this location?')) {
                          onDeleteLocation(loc.id);
                        }
                      }}
                      className="inline-flex items-center gap-1 rounded-full border border-red-500/70 bg-red-500/10 px-2.5 py-1 text-[11px] text-red-200 hover:bg-red-500/20"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {/* SUMMARY */}
              {loc.summary && (
                <p className="whitespace-pre-line text-xs text-neutral-300">
                  {loc.summary}
                </p>
              )}

              {/* PRIMARY LINK – single accent pill (YouTube / Link / etc) */}
              {primaryUrl && primaryLabel && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(primaryUrl, '_blank');
                  }}
                  className="inline-flex w-fit items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] text-white hover:bg-white/20"
                >
                  <ExternalLink size={12} />
                  {primaryLabel}
                </button>
              )}

              {/* EXTRA SOCIAL LINKS (secondary pills) */}
              {extraSocials.length > 0 && (
                <div className="flex flex-wrap gap-2 text-xs">
                  {extraSocials.map((s, i) => (
                    <button
                      key={`${s.platform}-${i}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(s.url, '_blank');
                      }}
                      className="rounded-full border border-white/40 bg-white/10 px-3 py-1 text-[11px] text-white hover:bg-white/20"
                    >
                      {s.platform}
                    </button>
                  ))}
                </div>
              )}

              {/* FOOTER — posted by + stars + reviews + buttons */}
              <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-400">
                {/* POSTED BY + STARS */}
                <div className="flex flex-wrap items-center gap-1">
                  {loc.postedBy && (
                    <>
                      <span>Posted by</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenUser(loc.postedBy!.id);
                        }}
                        className="font-medium text-white hover:underline"
                      >
                        {loc.postedBy!.name}
                      </button>
                      <span>•</span>
                    </>
                  )}
                  <span>
                    ★ {loc.stars} • {loc.reviewCount}{' '}
                    {loc.reviewCount === 1 ? 'review' : 'reviews'}
                  </span>
                </div>

                {/* BUTTONS */}
                <div className="flex flex-wrap gap-2">
                  {/* VIEW ON MAP */}
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

                  {/* ADD REVIEW */}
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

                  {/* MESSAGE OWNER */}
                  {loc.postedBy && loc.postedBy.id !== currentUserId && (
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
          </article>
        );
      })}
    </div>
  );
}







