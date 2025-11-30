'use client';

import React, { useMemo } from 'react';
import { ExternalLink, Flag } from 'lucide-react';
import AdSlot from '@/components/ads/AdSlot';

export type CreatorPost = {
  id: string;
  title: string;
  description?: string;
  youtubeUrl: string;

  // link to a location in your DB (not shown as a pill here)
  locationId?: string;
  locationText?: string;

  createdAt: number;
  postedBy: { id: string; name: string; avatarUrl?: string };

  [key: string]: any;
};

type Props = {
  posts: CreatorPost[];
  sortPosts: (a: CreatorPost, b: CreatorPost) => number;

  onOpenUser: (userId: string) => void;

  // kept for future use but NOT used in the feed (no "view on map" pill)
  onOpenLocation: (locationId: string) => void;

  onEditPost?: (post: CreatorPost) => void;
  onDeletePost?: (id: string) => void;
  canEditPost?: (p: CreatorPost) => boolean;

  // NEW: report handler
  onReportVideo?: (post: CreatorPost) => void;
};

/* ======== Helpers ======== */

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);

    // youtu.be/VIDEOID
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1);
    }

    // youtube.com/watch?v=VIDEOID
    const v = u.searchParams.get('v');
    if (v) return v;

    // fallback: last part of the path
    const parts = u.pathname.split('/');
    const last = parts[parts.length - 1];
    return last || null;
  } catch {
    return null;
  }
}

function youtubeThumb(url: string): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

function formatShortDate(ms: number) {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ======== Component ======== */

export default function CreatorsFeed({
  posts,
  sortPosts,
  onOpenUser,
  // onOpenLocation is intentionally unused (no map pill in creators)
  onOpenLocation,
  onEditPost,
  onDeletePost,
  canEditPost,
  onReportVideo,
}: Props) {
  const sorted = useMemo(
    () => [...posts].sort(sortPosts),
    [posts, sortPosts],
  );

  if (!sorted.length) {
    return (
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/80 p-4 text-sm text-neutral-300">
        No creator videos yet. Be the first to share a paranormal video linked
        to a location.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((post, index) => {
        const thumb = youtubeThumb(post.youtubeUrl) || undefined;
        const editable = canEditPost ? canEditPost(post) : false;
        const dateLabel = formatShortDate(post.createdAt);

        return (
          <React.Fragment key={post.id}>
            <div
              className="flex gap-3 rounded-lg border border-orange-500/60 bg-neutral-900/95 p-3 text-sm"
            >
              {/* IMAGE THUMB – same pattern as Marketplace/Events/Collab */}
              {thumb && (
                <a
                  href={post.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-20 w-28 shrink-0 cursor-pointer overflow-hidden rounded-md bg-neutral-950 md:h-24 md:w-32"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb}
                    alt={post.title}
                    className="h-full w-full object-cover"
                  />
                </a>
              )}

              {/* MAIN CONTENT */}
              <div className="flex flex-1 flex-col gap-1">
                {/* Top row: title + edit/delete */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      {post.title}
                    </h2>
                  </div>

                  {editable && (
                    <div className="flex gap-1">
                      {onEditPost && (
                        <button
                          type="button"
                          onClick={() => onEditPost(post)}
                          className="inline-flex items-center gap-1 rounded-full border border-orange-400/80 bg-orange-500/10 px-3 py-1 text-[11px] text-orange-100 hover:bg-orange-500/20"
                        >
                          Edit
                        </button>
                      )}
                      {onDeletePost && (
                        <button
                          type="button"
                          onClick={() => onDeletePost(post.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-red-500/70 bg-red-500/10 px-3 py-1 text-[11px] text-red-200 hover:bg-red-500/20"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Description */}
                {post.description && (
                  <p className="mt-1 whitespace-pre-line text-xs text-neutral-300">
                    {post.description}
                  </p>
                )}

                {/* Watch on YouTube – pill, like collab contact button */}
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <a
                    href={post.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-orange-400/80 bg-orange-500/10 px-3 py-1 text-[11px] text-orange-100 hover:bg-orange-500/20"
                  >
                    <ExternalLink size={12} />
                    Watch on YouTube
                  </a>
                </div>

                {/* Footer: posted by + date + report button */}
                <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-neutral-500">
                  <span>
                    Posted by{' '}
                    <button
                      type="button"
                      onClick={() => onOpenUser(post.postedBy.id)}
                      className="font-medium text-orange-200 hover:underline"
                    >
                      {post.postedBy.name || 'User'}
                    </button>
                    {dateLabel && <> • {dateLabel}</>}
                  </span>

                  {onReportVideo && (
                    <button
                      type="button"
                      onClick={() => onReportVideo(post)}
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-600 bg-neutral-800 px-3 py-1 text-[11px] text-neutral-100 hover:bg-neutral-700"
                    >
                      <Flag size={12} />
                      Report video
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* INLINE NATIVE AD AFTER 3rd CREATOR VIDEO */}
            {index === 2 && (
              <AdSlot
                placementKey="creators-feed-inline-1"
                className="mt-2"
              />
            )}

            {/* INLINE NATIVE AD AFTER 10th CREATOR VIDEO */}
            {index === 9 && (
              <AdSlot
                placementKey="creators-feed-inline-2"
                className="mt-2"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}







