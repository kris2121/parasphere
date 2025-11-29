'use client';

import React from 'react';
import {
  User as UserIcon,
  MessageCircle,
  Edit2,
  Trash2,
  ExternalLink,
  Ghost,
} from 'lucide-react';
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

  // optional, we’ll fill this from page.tsx when saving the post
  locationTitle?: string;
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
  onEditPost: (post: HomeFeedPost) => void;
  onDeletePost: (id: string) => void;
  canEditPost: (p: HomeFeedPost) => boolean;

  comments: Record<string, Comment[]>;
  onOpenComment: (key: string, parentId?: string) => void;
  onOpenEditComment: (key: string, commentId: string) => void;
  onDeleteComment: (key: string, commentId: string) => void;
  canEditComment: (c: Comment) => boolean;

  usersById: Record<string, UserMini>;
  followedUsers: string[]; // still accepted, just not visually used now
  onOpenUser: (userId: string) => void;

  sortPosts: (a: HomeFeedPost, b: HomeFeedPost) => number;

  // open image in global lightbox
  onOpenImage: (src: string) => void;

  // 🔹 open the map drawer for a tagged location
  onOpenLocationFromTag?: (locationId: string) => void;
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

/* ---------------------- Threaded comment components ---------------------- */

type CommentThreadProps = {
  comment: Comment;
  replies: Comment[];
  keyString: string;
  onOpenComment: (key: string, parentId?: string) => void;
  onOpenEditComment: (key: string, id: string) => void;
  onDeleteComment: (key: string, id: string) => void;
  canEditComment: (c: Comment) => boolean;
  onOpenImage: (src: string) => void;
  usersById: Record<string, UserMini>;
  onOpenUser: (userId: string) => void;
};

function CommentThread({
  comment,
  replies,
  keyString,
  onOpenComment,
  onOpenEditComment,
  onDeleteComment,
  canEditComment,
  onOpenImage,
  usersById,
  onOpenUser,
}: CommentThreadProps) {
  const editable = canEditComment(comment);

  // sort replies oldest → newest for consistency
  const sortedReplies = [...replies].sort(
    (a, b) => a.createdAt - b.createdAt,
  );

  // 🔹 Tagged users for root comment
  const rootTaggedUsers =
    (comment.tagUserIds ?? [])
      .map((id) => usersById[id])
      .filter(Boolean) ?? [];

  return (
    <div className="space-y-2">
      {/* Root comment */}
      <div className="flex items-start gap-2 text-[11px] text-neutral-200">
        <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-800 text-[10px] text-neutral-100">
          <UserIcon size={12} className="text-neutral-300" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-neutral-100">
              {comment.authorName}
            </span>
            <span className="text-[10px] text-neutral-500">
              {formatShortDate(comment.createdAt)}
            </span>
          </div>

          {comment.text && (
            <p className="mt-0.5 text-[11px] text-neutral-200">
              {comment.text}
            </p>
          )}

          {/* 🔹 Root comment tagged users */}
          {rootTaggedUsers.length > 0 && (
            <div className="mt-0.5 flex flex-wrap gap-1 text-[10px] text-cyan-300">
              {rootTaggedUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => onOpenUser(u.id)}
                  className="inline-flex items-center gap-1 rounded-full bg-neutral-900/70 px-2 py-0.5 hover:bg-neutral-800"
                >
                  <span className="text-neutral-400">@</span>
                  <span className="font-medium">{u.name}</span>
                </button>
              ))}
            </div>
          )}

          {comment.imageUrl && (
            <button
              type="button"
              onClick={() => onOpenImage(comment.imageUrl!)}
              className="mt-1 inline-block overflow-hidden rounded-md border border-neutral-800 bg-black/40"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={comment.imageUrl}
                alt="comment attachment"
                className="max-h-40 w-auto object-cover"
              />
            </button>
          )}

          {/* Actions */}
          <div className="mt-1 flex gap-3 text-[10px] text-neutral-400">
            <button
              type="button"
              onClick={() => onOpenComment(keyString, comment.id)}
              className="hover:text-cyan-200"
            >
              Reply
            </button>
            {editable && (
              <>
                <button
                  type="button"
                  onClick={() => onOpenEditComment(keyString, comment.id)}
                  className="hover:text-cyan-200"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteComment(keyString, comment.id)}
                  className="hover:text-red-300"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Replies, indented */}
      {sortedReplies.length > 0 && (
        <div className="ml-7 space-y-1 border-l border-neutral-800 pl-3">
          {sortedReplies.map((r) => {
            const editableReply = canEditComment(r);

            // 🔹 Tagged users for reply
            const replyTaggedUsers =
              (r.tagUserIds ?? [])
                .map((id) => usersById[id])
                .filter(Boolean) ?? [];

            return (
              <div
                key={r.id}
                className="flex items-start gap-2 text-[11px] text-neutral-200"
              >
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-800 text-[9px] text-neutral-100">
                  <UserIcon size={11} className="text-neutral-300" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-neutral-100">
                      {r.authorName}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {formatShortDate(r.createdAt)}
                    </span>
                  </div>

                  {r.text && (
                    <p className="mt-0.5 text-[11px] text-neutral-200">
                      {r.text}
                    </p>
                  )}

                  {/* 🔹 Reply tagged users */}
                  {replyTaggedUsers.length > 0 && (
                    <div className="mt-0.5 flex flex-wrap gap-1 text-[10px] text-cyan-300">
                      {replyTaggedUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => onOpenUser(u.id)}
                          className="inline-flex items-center gap-1 rounded-full bg-neutral-900/70 px-2 py-0.5 hover:bg-neutral-800"
                        >
                          <span className="text-neutral-400">@</span>
                          <span className="font-medium">{u.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {r.imageUrl && (
                    <button
                      type="button"
                      onClick={() => onOpenImage(r.imageUrl!)}
                      className="mt-1 inline-block overflow-hidden rounded-md border border-neutral-800 bg-black/40"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={r.imageUrl}
                        alt="comment attachment"
                        className="max-h-40 w-auto object-cover"
                      />
                    </button>
                  )}

                  <div className="mt-1 flex gap-3 text-[10px] text-neutral-400">
                    <button
                      type="button"
                      onClick={() => onOpenComment(keyString, r.id)}
                      className="hover:text-cyan-200"
                    >
                      Reply
                    </button>
                    {editableReply && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            onOpenEditComment(keyString, r.id)
                          }
                          className="hover:text-cyan-200"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteComment(keyString, r.id)}
                          className="hover:text-red-300"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
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
  onDeleteComment,
  canEditComment,
  usersById,
  followedUsers, // kept for API compatibility, not used visually
  onOpenUser,
  sortPosts,
  onOpenImage,
  onOpenLocationFromTag,
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

        // Split into roots + replies
        const roots: Comment[] = [];
        const repliesByParent: Record<string, Comment[]> = {};

        postComments.forEach((c) => {
          if (!c.parentId) {
            roots.push(c);
          } else {
            if (!repliesByParent[c.parentId]) {
              repliesByParent[c.parentId] = [];
            }
            repliesByParent[c.parentId].push(c);
          }
        });

        // sort roots by time (oldest → newest)
        roots.sort((a, b) => a.createdAt - b.createdAt);

        const author = usersById[p.authorId] ?? {
          id: p.authorId,
          name: p.authorName || 'User',
        };

        const linkLabel = getLinkLabel(p.linkUrl);
        const totalComments = postComments.length;

        // 🔹 Location + user tags
        const locationLabel =
          (p as any).locationTitle || (p as any).locationName || ''; // safety

        const taggedUsers =
          p.tagUserIds?.map((uid) => usersById[uid]).filter(Boolean) ?? [];

        const hasTagRow = !!locationLabel || taggedUsers.length > 0;

        return (
          <article
            key={p.id}
            className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/95 p-3 text-sm shadow-sm"
          >
            <div className="flex gap-3">
              {/* Thumbnail column (matches Events layout) */}
          <button
  type="button"
  className="flex h-24 w-32 items-center justify-center overflow-hidden rounded-md border border-neutral-800 bg-black/60 cursor-pointer"
  onClick={() => {
    if (p.imageUrl) onOpenImage(p.imageUrl);
  }}
>

                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[11px] text-neutral-500">
                    No image
                  </span>
                )}
              </button>

              {/* Main content column */}
              <div className="flex-1">
                {/* Header row: title + edit/delete (like Events) */}
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-sm font-semibold text-white">
                    {p.title}
                  </h2>

                  {canEditPost(p) && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => onEditPost(p)}
                        className="inline-flex items-center gap-1 rounded-full border border-cyan-500/70 bg-cyan-500/10 px-2.5 py-1 text-cyan-100 hover:bg-cyan-500/20"
                      >
                        <Edit2 size={12} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeletePost(p.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-500/70 bg-red-500/10 px-2.5 py-1 text-red-200 hover:bg-red-500/20"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                {p.desc && (
                  <p className="mt-1 text-xs leading-relaxed text-neutral-200">
                    {p.desc}
                  </p>
                )}

                {/* 🔹 Tag row: location + users */}
                {hasTagRow && (
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                    {/* Location tag chip */}
                    {p.locationId && locationLabel && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenLocationFromTag?.(p.locationId as string)
                        }
                        className="inline-flex items-center gap-1 rounded-full bg-cyan-900/40 px-2.5 py-1 text-[11px] font-medium text-cyan-100 hover:bg-cyan-800/70"
                      >
                        <Ghost size={11} className="text-cyan-300" />
                        <span>{locationLabel}</span>
                      </button>
                    )}

                    {/* Tagged users */}
                    {taggedUsers.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => onOpenUser(u.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-neutral-800/70 px-2.5 py-1 text-[11px] text-neutral-100 hover:bg-neutral-700"
                      >
                        <span className="text-neutral-400">@</span>
                        <span className="font-medium">{u.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Link pill */}
                {p.linkUrl && linkLabel && (
                  <div className="mt-2">
                    <a
                      href={p.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-cyan-500/70 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/20"
                    >
                      <ExternalLink size={12} />
                      {linkLabel}
                    </a>
                  </div>
                )}

                {/* Footer: posted by + date / comments pill */}
                <footer className="mt-3 flex items-center justify-between text-[11px] text-neutral-400">
                  <button
                    type="button"
                    onClick={() => onOpenUser(author.id)}
                    className="text-left hover:text-cyan-200"
                  >
                    <span>Posted by </span>
                    <span className="font-semibold text-white hover:underline">
                      {author.name}
                    </span>
                    <span>{' • '}{formatShortDate(p.createdAt)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenComment(key)}
                    className="inline-flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-900 px-2 py-1 text-neutral-300 hover:border-cyan-500 hover:text-cyan-200"
                  >
                    <MessageCircle size={13} />
                    <span>
                      {totalComments === 0
                        ? 'Add comment'
                        : `${totalComments} comment${
                            totalComments === 1 ? '' : 's'
                          }`}
                    </span>
                  </button>
                </footer>
              </div>
            </div>

            {/* Threaded comments under the post */}
            {roots.length > 0 && (
              <div className="mt-3 space-y-2 border-t border-neutral-800 pt-2">
                {roots.map((root) => (
                  <CommentThread
                    key={root.id}
                    comment={root}
                    replies={repliesByParent[root.id] ?? []}
                    keyString={key}
                    onOpenComment={onOpenComment}
                    onOpenEditComment={onOpenEditComment}
                    onDeleteComment={onDeleteComment}
                    canEditComment={canEditComment}
                    onOpenImage={onOpenImage}
                    usersById={usersById}
                    onOpenUser={onOpenUser}
                  />
                ))}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}






