'use client';

import React from 'react';
import type { EventItem } from '@/types/paraverse';
import { Edit2, Trash2, ExternalLink, MapPin, Mail } from 'lucide-react';

type Props = {
  events: EventItem[];
  currentUserId: string;
  isAdmin: boolean;

  onEditEvent: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  onOpenLocation: (locationId: string) => void;
  onOpenImage: (src: string) => void;
  onOpenUser: (id: string) => void;
  onMessageUser: (userId: string) => void;
};

export default function EventsFeed({
  events,
  currentUserId,
  isAdmin,
  onEditEvent,
  onDeleteEvent,
  onOpenLocation,
  onOpenImage,
  onOpenUser,
  onMessageUser,
}: Props) {
  const sorted = [...events].sort(
    (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
  );

  return (
    <div className="mt-4 space-y-4">
      {sorted.map((ev) => {
        const organiserId = ev.postedBy?.id ?? 'unknown';
        const organiserName = ev.postedBy?.name ?? 'Organiser';
        const canManage = isAdmin || organiserId === currentUserId;

        const imageUrl = ev.imageUrl;
        const link = (ev as any).link as string | undefined;
        const socialLinks = ((ev as any).socialLinks ??
          []) as Array<{ platform: string; url: string }>;
        const primarySocial = socialLinks[0];
        const primaryUrl = primarySocial?.url || link || '';

        // Simple created-at display similar to other cards
        const createdLabel = ev.createdAt
          ? new Date(ev.createdAt).toLocaleString(undefined, {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
          : undefined;

        return (
          <article
            key={ev.id}
            className="flex gap-4 rounded-lg border border-purple-500/50 bg-[#110d18] p-4 text-sm"
          >
        {/* LEFT: IMAGE */}
{imageUrl && (
  <button
    type="button"
    onClick={() => onOpenImage(imageUrl)}
    className="h-24 w-32 shrink-0 overflow-hidden rounded-md bg-black/40 cursor-pointer"
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      src={imageUrl}
      alt={ev.title}
      className="h-full w-full object-cover"
    />
  </button>
)}


            {/* RIGHT: CONTENT */}
            <div className="flex flex-1 flex-col gap-2">
              {/* HEADER: title + controls */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <h2 className="text-base font-semibold text-purple-100">
                    {ev.title}
                  </h2>
                </div>

                {canManage && (
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => onEditEvent(ev.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-purple-400 bg-purple-500/10 px-2.5 py-1 text-[11px] text-purple-100 hover:bg-purple-500/20"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            'Delete this event? This cannot be undone.',
                          )
                        ) {
                          onDeleteEvent(ev.id);
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

              {/* DESCRIPTION */}
              {ev.description && (
                <p className="whitespace-pre-line text-xs text-neutral-200">
                  {ev.description}
                </p>
              )}

              {/* PRIMARY LINK */}
              {primaryUrl && (
                <button
                  type="button"
                  onClick={() => window.open(primaryUrl, '_blank')}
                  className="inline-flex w-fit items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[11px] text-white hover:bg-white/20"
                >
                  <ExternalLink size={12} />
                  Event link
                </button>
              )}

              {/* FOOTER: posted by + date + actions */}
              <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-300">
                {/* POSTED BY */}
                <div className="flex flex-wrap items-center gap-1">
                  {organiserId !== 'unknown' && (
                    <>
                      <span>Posted by</span>
                      <button
                        type="button"
                        onClick={() => onOpenUser(organiserId)}
                        className="font-medium text-white hover:underline"
                      >
                        {organiserName}
                      </button>
                      {createdLabel && <span>• {createdLabel}</span>}
                    </>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* VIEW ON MAP */}
                  {ev.locationId && (
                    <button
                      type="button"
                      onClick={() => onOpenLocation(ev.locationId!)}
                      className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/5 px-3 py-1 text-[11px] text-white hover:bg-white/15"
                    >
                      <MapPin size={12} />
                      View on map
                    </button>
                  )}

                  {/* MESSAGE ORGANISER */}
                  {organiserId !== 'unknown' &&
                    organiserId !== currentUserId && (
                      <button
                        type="button"
                        onClick={() => onMessageUser(organiserId)}
                        className="inline-flex items-center gap-1 rounded-full border border-neutral-500 bg-neutral-800 px-3 py-1 text-[11px] text-neutral-100 hover:bg-neutral-700"
                      >
                        <Mail size={12} />
                        Message organiser
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


