'use client';

import React from 'react';
import { User as UserIcon, MessageCircle } from 'lucide-react';
import type { UserMini } from '@/components/UserDrawer';

/* --------------------------------- Types --------------------------------- */

export type HomeFeedPost = {
  id: string;
  type: 'Post';
  title: string;
  desc: string;
  locationId?: string;
  imageUrl?: string;
  linkUrl?: string;
  authorId: string;
  authorName: string;
  tagUserIds?: string[];
  createdAt: number;
};

type Comment = {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  imageUrl?: string;
  parentId?: string | null;
  tagUserIds?: string[];
};

type Props = {
  currentUser: { id: string; name: string; avatarUrl?: string };
  posts: HomeFeedPost[];
  onEditPost: (id: string, patch: Partial<HomeFeedPost>) => void;
  onDeletePost: (id: string) => void;
  canEditPost: (p: HomeFeedPost) => boolean;

  comments: Record<string, Comment[]>;
  onOpenComment: (key: string, parentId?: string) => void;
  onOpenEditComment: (key: string, commentId: string) => void;
  canEditComment: (c: Comment) => boolean;

  usersById: Record<string, UserMini>;
  followedUsers: string[];
  onOpenUser: (userId: string) => void;

  sortPosts: (a: HomeFeedPost, b: HomeFeedPost) => number;

  // open image in global lightbox
  onOpenImage: (src: string) => void;
};

/* ---------------------------- Small helpers ---------------------------- */

function getLinkLabel(url?: string) {
  if (!url) return '';
  const u = url.toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube';
  if (u.includes('tiktok.com')) return 'TikTok';
  if (u.includes('instagram.com')) return 'Instagram';
  if (u.includes('facebook.com')) return 'Facebook';
  return 'Link';
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

/* --------------------------------- UI ---------------------------------- */

export default function HomeFeed({
  currentUser,
  posts,
  onEditPost,
  onDeletePost,
  canEditPost,
  comments,
  onOpenComment,
  onOpenEditComment,
  canEditComment,
  usersById,
  followedUsers,
  onOpenUser,
  sortPosts,
  onOpenImage,
}: Props) {
  const sorted = [...posts].sort(sortPosts);

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
        No posts yet. Be the first to share something haunted…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sorted.map((p) => {
        const key = `post:${p.id}`;
        const postComments = comments[key] ?? [];
        const author = usersById[p.authorId] ?? {
          id: p.authorId,
          name: p.authorName || 'User',
        };
        const isFollowed = followedUsers.includes(p.authorId);
        const isMine = p.authorId === currentUser.id;
        const linkLabel = getLinkLabel(p.linkUrl);

        return (
          <article
            key={p.id}
            className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/95 p-3 text-sm shadow-sm"
          >
            {/* Header: avatar + name + date */}
            <header className="mb-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onOpenUser(author.id)}
                className="flex items-center gap-2"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-xs text-neutral-200">
                  {author.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={author.avatarUrl}
                      alt={author.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon size={16} className="text-neutral-300" />
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs font-semibold text-white">
                    {author.name}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {formatShortDate(p.createdAt)}
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-2 text-[11px]">
                {isFollowed && (
                  <span className="rounded-full border border-cyan-500/60 bg-cyan-500/10 px-2 py-0.5 text-cyan-200">
                    Added
                  </span>
                )}
                {isMine && (
                  <span className="rounded-full border border-neutral-600 bg-neutral-800 px-2 py-0.5 text-neutral-200">
                    You
                  </span>
                )}
              </div>
            </header>

            {/* Title & text */}
            <h2 className="text-sm font-semibold text-white">{p.title}</h2>
            {p.desc && (
              <p className="mt-1 text-xs leading-relaxed text-neutral-200">
                {p.desc}
              </p>
            )}

            {/* Image */}
            {p.imageUrl && (
              <button
                type="button"
                onClick={() => onOpenImage(p.imageUrl!)}
                className="mt-3 block overflow-hidden rounded-md border border-neutral-800 bg-black/50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="max-h-72 w-full object-cover"
                />
              </button>
            )}

            {/* Link */}
            {p.linkUrl && linkLabel && (
              <div className="mt-2">
                <a
                  href={p.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-cyan-500/70 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/20"
                >
                  {linkLabel}
                </a>
              </div>
            )}

            {/* Footer: comments + edit/delete */}
            <footer className="mt-3 flex items-center justify-between gap-3 text-[11px]">
              <button
                type="button"
                onClick={() => onOpenComment(key)}
                className="inline-flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-300 hover:border-cyan-500 hover:text-cyan-200"
              >
                <MessageCircle size={13} />
                <span>
                  {postComments.length === 0
                    ? 'Add comment'
                    : `${postComments.length} comment${
                        postComments.length === 1 ? '' : 's'
                      }`}
                </span>
              </button>

              {canEditPost(p) && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEditPost(p.id, {})}
                    className="text-neutral-400 hover:text-neutral-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeletePost(p.id)}
                    className="text-red-400 hover:text-red-200"
                  >
                    Delete
                  </button>
                </div>
              )}
            </footer>
          </article>
        );
      })}
    </div>
  );
}












