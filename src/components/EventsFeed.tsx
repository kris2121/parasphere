'use client';

import React, { useMemo } from 'react';

/* -------- Local helper UI bits (kept self-contained) -------- */

function TranslatePost({ text }: { text?: string }) {
  const [showTranslated, setShowTranslated] = React.useState(false);
  if (!text) return null;

  // For now this just shows the same text; later you can plug in a translator.
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

function SectionDisclaimer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-lg border border-yellow-700/40 bg-yellow-900/10 px-3 py-2 text-sm text-yellow-200">
      {children}
    </div>
  );
}

/* ------------------------ Types / helpers ------------------------ */

export type EventsFeedEvent = {
  id: string;
  title: string;
  description?: string;
  locationText?: string;
  startISO: string;
  endISO?: string;
  priceText?: string;
  link?: string;
  imageUrl?: string;
  createdAt: number;
  postedBy: { id: string; name: string };
  countryCode?: string;
  postalCode?: string;
};

type Props = {
  country: string;
  events: EventsFeedEvent[];
  comments: Record<string, any[]>;
  eventStars: Record<string, number>;
  giveEventStar: (id: string) => void;
  openComment: (key: string) => void;
};

function byCountry<T extends { countryCode?: string }>(code: string) {
  const upper = (code || '').toUpperCase();
  return (x: T) => (x.countryCode?.toUpperCase() || '') === upper;
}

function sortEvents(a: EventsFeedEvent, b: EventsFeedEvent) {
  return new Date(b.startISO).getTime() - new Date(a.startISO).getTime();
}

/* -------------------------- Component --------------------------- */

export default function EventsFeed({
  country,
  events,
  comments,
  eventStars,
  giveEventStar,
  openComment,
}: Props) {
  const now = Date.now();

  const activeEvents = useMemo(
    () =>
      events.filter((ev) => {
        const start = ev.startISO ? new Date(ev.startISO).getTime() : 0;
        const end = ev.endISO ? new Date(ev.endISO).getTime() : start;
        return end >= now;
      }),
    [events, now],
  );

  const eventsForCountry = activeEvents.filter(byCountry<EventsFeedEvent>(country));

  return (
    <>
      <SectionDisclaimer>
        Paraverse does not organise, endorse, or guarantee any events listed here. Users
        should verify details, reputation, and any warranties independently.
      </SectionDisclaimer>

      <div className="grid gap-4">
        {eventsForCountry.sort(sortEvents).map((ev) => {
          const cKey = `event:${ev.id}`;
          return (
            <article
              key={ev.id}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs text-neutral-400">by {ev.postedBy.name}</div>
                <StarBadge
                  value={eventStars[ev.id] ?? 0}
                  onClick={() => giveEventStar(ev.id)}
                />
              </div>
              <h3 className="text-lg font-semibold">{ev.title}</h3>
              {ev.imageUrl && (
                <img
                  src={ev.imageUrl}
                  alt=""
                  className="mt-2 rounded-md border border-neutral-800"
                />
              )}
              {ev.description && <TranslatePost text={ev.description} />}
              <div className="mt-2 text-xs text-neutral-400">
                Date: {new Date(ev.startISO).toLocaleString()}{' '}
                {ev.endISO ? `— ${new Date(ev.endISO).toLocaleString()}` : ''}
              </div>
              {ev.locationText && (
                <div className="text-xs text-neutral-400">
                  Location: {ev.locationText}
                </div>
              )}
              {ev.countryCode && (
                <div className="text-xs text-neutral-400">
                  Country: {ev.countryCode}
                </div>
              )}
              {ev.postalCode && (
                <div className="text-xs text-neutral-400">
                  Post code: {ev.postalCode}
                </div>
              )}
              {ev.priceText && (
                <div className="text-xs text-neutral-400">
                  Price: {ev.priceText}
                </div>
              )}
              {ev.link && (
                <a
                  className="mt-2 inline-block text-purple-200 hover:underline"
                  href={ev.link}
                  target="_blank"
                  rel="noreferrer"
                >
                  Tickets / Info
                </a>
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
            </article>
          );
        })}

        {eventsForCountry.length === 0 && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
            No events yet.
          </div>
        )}
      </div>
    </>
  );
}
