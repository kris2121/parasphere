'use client';

import type { LocationData } from './LiveMap';
import type { DemoPost } from './PostCard';

function SocialIcon({ name }: { name: keyof NonNullable<LocationData['socials']> }) {
  const label = { facebook:'f', instagram:'ig', tiktok:'tt', x:'x', youtube:'yt' }[name];
  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-neutral-600 text-[10px]"
      title={name}
    >
      {label}
    </span>
  );
}

export default function LocationDrawer({
  open,
  location,
  postsForLocation,
  onClose,
  onMessageUploader,
  onReport,
  onBlock,
}: {
  open: boolean;
  location?: LocationData;
  postsForLocation: DemoPost[];
  onClose: () => void;
  onMessageUploader?: (uploaderId: string) => void;
  onReport?: (locationId: string) => void;
  onBlock?: (uploaderId: string) => void;
}) {
  if (!open || !location) return null;

  const socials = location.socials || {};

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center sm:justify-center" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-[81] w-full sm:max-w-2xl sm:rounded-2xl sm:overflow-hidden border-t sm:border border-neutral-800 bg-neutral-900">
        {/* Hero image (tap to close) */}
        {location.imageUrl ? (
          <button type="button" className="block w-full group relative" onClick={onClose} title="Close">
            <img src={location.imageUrl} alt={location.title} className="w-full h-56 object-cover" />
            <div className="absolute inset-0 bg-black/10 group-active:bg-black/20 transition" />
          </button>
        ) : (
          <button type="button" onClick={onClose} className="block w-full h-20 bg-neutral-800" title="Close" />
        )}

        <div className="p-4">
          <div className="text-xs text-neutral-400 mb-1">{niceType(location.type)}</div>
          <h3 className="text-lg font-semibold">{location.title}</h3>
          {location.summary && <p className="text-sm text-neutral-300 mt-1">{location.summary}</p>}

          {/* Key info list */}
          <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
            {location.address && (
              <a className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 hover:border-neutral-700"
                 target="_blank" rel="noopener noreferrer"
                 href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`}>
                📍 {location.address}
              </a>
            )}
            {location.what3words && (
              <a className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 hover:border-neutral-700"
                 target="_blank" rel="noopener noreferrer"
                 href={`https://what3words.com/${location.what3words.replace(/^\/+|^\\+/, '')}`}>
                /// {location.what3words}
              </a>
            )}
            <div className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2">
              Lat {location.lat.toFixed(5)} • Lng {location.lng.toFixed(5)}
            </div>
            {location.openingHours && (
              <div className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2">
                🕒 {location.openingHours}
              </div>
            )}
            {location.priceInfo && (
              <div className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2">
                💷 {location.priceInfo}
              </div>
            )}
            {location.phone && (
              <a className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 hover:border-neutral-700"
                 href={`tel:${location.phone}`}>☎️ {location.phone}</a>
            )}
            {location.email && (
              <a className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 hover:border-neutral-700"
                 href={`mailto:${location.email}`}>✉️ {location.email}</a>
            )}
            {location.website && (
              <a className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 hover:border-neutral-700"
                 target="_blank" rel="noopener noreferrer" href={location.website}>
                🌐 Website
              </a>
            )}
          </div>

          {/* Socials */}
          {Object.keys(socials).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {socials.facebook && (
                <a className="inline-flex items-center gap-1 rounded-md border border-neutral-800 px-2 py-1 text-xs hover:border-neutral-700"
                   href={socials.facebook} target="_blank" rel="noopener noreferrer">
                  <SocialIcon name="facebook" /> Facebook
                </a>
              )}
              {socials.instagram && (
                <a className="inline-flex items-center gap-1 rounded-md border border-neutral-800 px-2 py-1 text-xs hover:border-neutral-700"
                   href={socials.instagram} target="_blank" rel="noopener noreferrer">
                  <SocialIcon name="instagram" /> Instagram
                </a>
              )}
              {socials.tiktok && (
                <a className="inline-flex items-center gap-1 rounded-md border border-neutral-800 px-2 py-1 text-xs hover:border-neutral-700"
                   href={socials.tiktok} target="_blank" rel="noopener noreferrer">
                  <SocialIcon name="tiktok" /> TikTok
                </a>
              )}
              {socials.x && (
                <a className="inline-flex items-center gap-1 rounded-md border border-neutral-800 px-2 py-1 text-xs hover:border-neutral-700"
                   href={socials.x} target="_blank" rel="noopener noreferrer">
                  <SocialIcon name="x" /> X
                </a>
              )}
              {socials.youtube && (
                <a className="inline-flex items-center gap-1 rounded-md border border-neutral-800 px-2 py-1 text-xs hover:border-neutral-700"
                   href={socials.youtube} target="_blank" rel="noopener noreferrer">
                  <SocialIcon name="youtube" /> YouTube
                </a>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex items-center gap-2">
            {location.uploader && onMessageUploader && (
              <button
                onClick={() => onMessageUploader(location.uploader!.id)}
                className="rounded-md border border-cyan-600 bg-cyan-500/10 px-3 py-2 text-sm hover:bg-cyan-500/20"
                title={`Message ${location.uploader.name}`}
              >
                💬 Message {location.uploader.name}
              </button>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
              target="_blank" rel="noopener noreferrer"
              className="rounded-md border border-neutral-700 px-3 py-2 text-sm hover:border-neutral-600"
            >
              Open in Maps
            </a>
            <a
              href={`https://maps.apple.com/?q=${location.lat},${location.lng}`}
              target="_blank" rel="noopener noreferrer"
              className="rounded-md border border-neutral-700 px-3 py-2 text-sm hover:border-neutral-600"
            >
              Apple Maps
            </a>
            {/* Report / Block hooks (we'll flesh these out later) */}
            {onReport && (
              <button
                onClick={() => onReport(location.id)}
                className="ml-auto rounded-md border border-red-700/60 px-3 py-2 text-sm text-red-300 hover:border-red-600/80"
                title="Report this location"
              >
                Report
              </button>
            )}
            {location.uploader && onBlock && (
              <button
                onClick={() => onBlock(location.uploader!.id)}
                className="rounded-md border border-neutral-700 px-3 py-2 text-sm hover:border-neutral-600"
                title="Block this uploader"
              >
                Block
              </button>
            )}
          </div>

          {/* Posts for this location */}
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-neutral-200 mb-2">Posts about this place</h4>
            {postsForLocation.length === 0 ? (
              <div className="text-xs text-neutral-500 border border-neutral-800 rounded-md px-3 py-2">
                No posts yet. Be the first to share an experience.
              </div>
            ) : (
              <div className="space-y-2">
                {postsForLocation.map((p, i) => (
                  <div key={i} className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2">
                    <div className="text-[11px] text-cyan-300">{p.type}</div>
                    <div className="text-sm font-medium text-neutral-100">{p.title}</div>
                    <div className="text-xs text-neutral-400 line-clamp-2">{p.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 text-[11px] text-neutral-500">Tip: tap the photo to close.</div>
        </div>
      </div>
    </div>
  );
}

function niceType(t: LocationData['type']) {
  if (t === 'HAUNTING') return 'Haunting';
  if (t === 'UFO') return 'UFO';
  if (t === 'CRYPTID') return 'Cryptid';
  return t;
}


