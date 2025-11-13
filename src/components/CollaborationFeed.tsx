'use client';

import React, { useMemo } from 'react';

/* -------- Local helper UI bits (kept self-contained) -------- */

function TranslatePost({ text }: { text?: string }) {
  const [showTranslated, setShowTranslated] = React.useState(false);
  if (!text) return null;

  const display = showTranslated ? text : text;

  return (
    <div className="mt-1">
      <p className="text-sm text-neutral-300">{display}</p>
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
      <span>★</span>{' '}
      <span className="min-w-[1.2rem] text-center">{value}</span>
    </button>
  );
}

/* ------------------------ Types / helpers ------------------------ */

export type CollaborationFeedItem = {
  id: string;
  title: string;
  description?: string;
  dateISO?: string;
  locationText?: string;
  priceText?: string;
  contact?: string;
  imageUrl?: string;
  createdAt: number;
  postedBy: { id: string; name: string };
  countryCode?: string;
  postalCode?: string;
};

type Props = {
  country: string;
  items: CollaborationFeedItem[];
  comments: Record<string, any[]>;
  collabStars: Record<string, number>;
  giveCollabStar: (id: string) => void;
  openComment: (key: string) => void;
};

function byCountry<T extends { countryCode?: string }>(code: string) {
  const upper = (code || '').toUpperCase();
  return (x: T) => (x.countryCode?.toUpperCase() || '') === upper;
}

function sortCollab(a: CollaborationFeedItem, b: CollaborationFeedItem) {
  const da = a.dateISO ? new Date(a.dateISO).getTime() : a.createdAt;
  const db = b.dateISO ? new Date(b.dateISO).getTime() : b.createdAt;
  return db - da;
}

/* -------------------------- Component --------------------------- */

export default function CollaborationFeed({
  country,
  items,
  comments,
  collabStars,
  giveCollabStar,
  openComment,
}: Props) {
  const now = Date.now();

  const activeCollabs = useMemo(
    () =>
      items.filter((c) => {
        if (!c.dateISO) return true;
        const d = new Date(c.dateISO).getTime();
        return d >= now;
      }),
    [items, now],
  );

  const collabsForCountry = useMemo(
    () => activeCollabs.filter(byCountry<CollaborationFeedItem>(country)),
    [activeCollabs, country],
  );

  return (
    <div className="grid gap-4">
      {collabsForCountry.sort(sortCollab).map((c) => {
        const cKey = `collab:${c.id}`;
        return (
          <article
            key={c.id}
            className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{c.title}</h3>
              <StarBadge
                value={collabStars[c.id] ?? 0}
                onClick={() => giveCollabStar(c.id)}
              />
            </div>
            {c.imageUrl && (
              <img
                src={c.imageUrl}
                alt=""
                className="mt-2 rounded-md border border-neutral-800"
              />
            )}
            {c.description && <TranslatePost text={c.description} />}

            <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-400">
              {c.dateISO && <span>Date: {new Date(c.dateISO).toLocaleString()}</span>}
              {c.locationText && <span>Location: {c.locationText}</span>}
              {c.countryCode && <span>Country: {c.countryCode}</span>}
              {c.postalCode && <span>Post code: {c.postalCode}</span>}
              {c.priceText && <span>Price: {c.priceText}</span>}
              {c.contact && (
                <a
                  className="text-cyan-300 hover:underline"
                  href={c.contact}
                  target="_blank"
                  rel="noreferrer"
                >
                  Contact / Link
                </a>
              )}
            </div>

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
          </article>
        );
      })}

      {collabsForCountry.length === 0 && (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
          No collaboration posts yet.
        </div>
      )}
    </div>
  );
}
