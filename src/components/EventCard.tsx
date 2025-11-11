'use client';

import type { LocationData } from './LiveMap';

export default function EventCard({
  ev,
  now = new Date(),
  onViewOnMap,
  onToggleStar,
  onAddComment,
  onDeleteComment,
  currentUserId,
}: {
  ev: LocationData; // type === 'EVENT'
  now?: Date;
  onViewOnMap?: (locationId: string) => void;
  onToggleStar?: () => void;
  onAddComment?: (text: string) => void;
  onDeleteComment?: (commentId: string) => void;
  currentUserId: string;
}) {
  const start = ev.eventStartISO ? new Date(ev.eventStartISO) : null;
  const end = ev.eventEndISO ? new Date(ev.eventEndISO) : null;
  const ended = end ? end.getTime() < now.getTime() : (start ? start.getTime() < now.getTime() : false);

  return (
    <article className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 hover:border-neutral-700 transition">
      {ev.imageUrl && (
        <img src={ev.imageUrl} alt="" className="w-full max-h-[420px] object-cover rounded-lg border border-neutral-800 mb-3" />
      )}

      <div className="flex items-center justify-between mb-1">
        <div className="text-purple-300 text-xs">Event</div>
        {ended && <span className="text-[11px] rounded-full border border-neutral-700 px-2 py-0.5 text-neutral-400">Ended</span>}
      </div>

      <h3 className="text-lg font-semibold leading-tight">{ev.title}</h3>
      {ev.summary && <p className="text-neutral-300 text-sm mt-1">{ev.summary}</p>}

      <div className="mt-2 grid sm:grid-cols-2 gap-2 text-sm">
        {start && <div className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2">🗓️ Starts: {start.toLocaleString()}</div>}
        {end &&   <div className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2">🏁 Ends: {end.toLocaleString()}</div>}
        {ev.address && (
          <a className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 hover:border-neutral-700"
             href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ev.address)}`} target="_blank" rel="noopener noreferrer">
            📍 {ev.address}
          </a>
        )}
        {ev.priceInfo && <div className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2">💷 {ev.priceInfo}</div>}
        {ev.website && (
          <a className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 hover:border-neutral-700"
             href={ev.website} target="_blank" rel="noopener noreferrer">
            🌐 Tickets / Website
          </a>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {onViewOnMap && (
          <button
            onClick={() => onViewOnMap(ev.id)}
            className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:border-purple-400 hover:bg-purple-400/10"
          >
            View on map
          </button>
        )}
        {onToggleStar && (
          <button
            onClick={onToggleStar}
            className={`rounded-md border px-3 py-1 text-sm ${
              ev.myStarred ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300' : 'border-neutral-700 hover:border-neutral-600'
            }`}
            title={ev.myStarred ? 'Unstar' : 'Star'}
          >
            ⭐ {ev.stars ?? 0}
          </button>
        )}
      </div>

      {/* Comments */}
      {ev.comments && ev.comments.length > 0 && (
        <div className="mt-4 space-y-2">
          {ev.comments.map((c) => {
            const canDelete = c.authorId === currentUserId || ev.uploader?.id === currentUserId;
            return (
              <div key={c.id} className="flex items-start gap-2">
                <div className="flex-1 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm">
                  <div className="text-xs text-neutral-400 mb-0.5">{c.authorName}</div>
                  <div className="text-neutral-200">{c.text}</div>
                </div>
                {canDelete && onDeleteComment && (
                  <button onClick={() => onDeleteComment(c.id)} className="text-neutral-500 hover:text-neutral-300 text-sm" title="Remove comment">✕</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add comment */}
      {onAddComment && (
        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem('cmt') as HTMLInputElement;
            const val = input.value.trim(); if (!val) return;
            onAddComment(val);
            input.value = '';
          }}
        >
          <input
            name="cmt"
            placeholder="Write a comment about this event…"
            className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 outline-none focus:border-purple-400"
          />
          <button type="submit" className="rounded-md border border-neutral-700 px-3 py-2 text-sm hover:border-neutral-600">
            Post
          </button>
        </form>
      )}
    </article>
  );
}
