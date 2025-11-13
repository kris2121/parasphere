'use client';

import React, { useState } from 'react';

type Post = {
  id: string;
  title: string;
  desc: string;
  locationId?: string;
  imageUrl?: string;
  linkUrl?: string;
  authorId: string;
  authorName: string;
  createdAt: number;
};

type HomeFeedProps = {
  tab: string;
  posts: Post[];
  filteredPosts: Post[];
  searchQuery: string;
  selectedUserId: string | null;
  selectedLocationId: string | null;
  setSelectedLocationId: (id: string | null) => void;
  setSelectedUserId: (id: string | null) => void;
  usersById: Record<string, { id: string; name: string; avatarUrl?: string }>;
  locations: Array<{ id: string; title: string }>;
  postStars: Record<string, number>;
  givePostStar: (id: string) => void;
  comments: Record<string, any[]>;
  canEditPost: (p: Post) => boolean;
  editPost: (id: string, patch: Partial<Post>) => void;
  deletePost: (id: string) => void;
  canEditComment: (c: any) => boolean;
  deleteComment: (key: string, id: string) => void;
  openComment: (key: string) => void;
  sortPosts: (a: Post, b: Post) => number;
};

/* Local helpers – duplicated from page.tsx just for this feed */

function TranslatePost({ text }: { text?: string }) {
  const [showTranslated, setShowTranslated] = useState(false);
  if (!text) return null;
  return (
    <div className="mt-1">
      <p className="text-sm text-neutral-300">
        {showTranslated ? text : text}
      </p>
      <button
        type="button"
        onClick={() => setShowTranslated((v) => !v)}
        className="mt-1 text-xs text-cyan-300 hover:underline"
      >
        {showTranslated ? 'Show original' : 'Translate'}
      </button>
    </div>
  );
}

function StarBadge({ value, onClick }: { value: number; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border border-yellow-600/60 bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-200 hover:bg-yellow-500/20"
      title="Give a star"
    >
      <span>★</span>
      <span className="min-w-[1.2rem] text-center">{value}</span>
    </button>
  );
}

export default function HomeFeed({
  tab,
  posts,
  filteredPosts,
  searchQuery,
  selectedUserId,
  selectedLocationId,
  setSelectedLocationId,
  setSelectedUserId,
  usersById,
  locations,
  postStars,
  givePostStar,
  comments,
  canEditPost,
  editPost,
  deletePost,
  canEditComment,
  deleteComment,
  openComment,
  sortPosts,
}: HomeFeedProps) {
  // same logic you had in page.tsx
  const postsSource = tab === 'home' ? filteredPosts : posts;

  const list = postsSource
    .filter(
      (p) =>
        (!selectedUserId || p.authorId === selectedUserId) &&
        (!selectedLocationId || p.locationId === selectedLocationId) &&
        (!searchQuery ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.desc.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    .sort(sortPosts);

  return (
    <div className="grid gap-4">
      {list.map((p) => {
        const cKey = `post:${p.id}`;
        return (
          <article
            key={p.id}
            className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs text-neutral-400">
                Post • by{' '}
                <button
                  className="text-cyan-300 hover:underline"
                  onClick={() => setSelectedUserId(p.authorId)}
                >
                  {usersById[p.authorId]?.name ?? p.authorName}
                </button>
              </div>
              <StarBadge
                value={postStars[p.id] ?? 0}
                onClick={() => givePostStar(p.id)}
              />
            </div>

            {canEditPost(p) && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <button
                  className="rounded-md border border-neutral-700 px-2 py-1 hover:bg-neutral-900"
                  onClick={() => {
                    const title = prompt('Edit title', p.title) ?? p.title;
                    const desc = prompt('Edit description', p.desc) ?? p.desc;
                    editPost(p.id, { title, desc });
                  }}
                >
                  Edit
                </button>
                <button
                  className="rounded-md border border-red-500/70 px-2 py-1 text-red-300 hover:bg-red-500/10"
                  onClick={() => {
                    if (confirm('Delete this post?')) deletePost(p.id);
                  }}
                >
                  Delete
                </button>
              </div>
            )}

            <h3 className="mt-1 text-lg font-semibold">{p.title}</h3>
            <TranslatePost text={p.desc} />

            {p.imageUrl && (
              <img
                src={p.imageUrl}
                alt=""
                className="mt-2 rounded-md border border-neutral-800"
              />
            )}
            {p.linkUrl && (
              <a
                className="mt-2 inline-block text-cyan-300 hover:underline"
                href={p.linkUrl}
                target="_blank"
                rel="noreferrer"
              >
                View link
              </a>
            )}
            {p.locationId && (
              <div className="mt-2 text-xs text-neutral-400">
                Location:{' '}
                <button
                  className="text-cyan-300 hover:underline"
                  onClick={() => {
                    setSelectedLocationId(p.locationId!);
                    setSelectedUserId(null);
                  }}
                >
                  {locations.find((l) => l.id === p.locationId)?.title ??
                    p.locationId}
                </button>
              </div>
            )}

            <div className="mt-3 flex items-center gap-3">
              <button
                className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-900"
                onClick={() => openComment(cKey)}
              >
                Comment
              </button>
              <div className="text-xs text-neutral-500">
                {(comments[cKey]?.length ?? 0)} comments
              </div>
            </div>

            {comments[cKey]?.length ? (
              <div className="mt-2 grid gap-2">
                {comments[cKey].map((c) => (
                  <div
                    key={c.id}
                    className="rounded-md border border-neutral-800 bg-neutral-950 p-2"
                  >
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <div>
                        by{' '}
                        <span className="text-cyan-300">
                          {c.authorName}
                        </span>{' '}
                        • {new Date(c.createdAt).toLocaleString()}
                      </div>
                      {canEditComment(c) && (
                        <button
                          className="rounded border border-neutral-700 px-2 py-0.5 hover:bg-neutral-900"
                          onClick={() => deleteComment(cKey, c.id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-neutral-200">
                      {c.text}
                    </div>
                    {c.imageUrl && (
                      <img
                        src={c.imageUrl}
                        alt=""
                        className="mt-2 max-h-60 w-auto rounded-md border border-neutral-800"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        );
      })}
      {posts.length === 0 && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
          No posts yet.
        </div>
      )}
    </div>
  );
}
