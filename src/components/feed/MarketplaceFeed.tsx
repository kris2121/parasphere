'use client';

import React from 'react';
import { Edit2, Trash2, ExternalLink, Mail } from 'lucide-react';
import type { MarketplaceItem } from '@/types/paraverse';
import { formatShortDate } from '@/lib/dateUtils';

import AdSlot from '@/components/ads/AdSlot';

type Props = {
  items: MarketplaceItem[];
  currentUserId: string;

  // NEW: admin can edit/delete any listing
  isAdmin: boolean;

  onEditListing: (item: MarketplaceItem) => void;
  onDeleteListing: (id: string) => void;
  onOpenImage: (src: string) => void;
  onOpenUser: (userId: string) => void;

  // NEW: DM hook
  onMessageUser: (userId: string) => void;
};

export default function MarketplaceFeed({
  items,
  currentUserId,
  isAdmin,
  onEditListing,
  onDeleteListing,
  onOpenImage,
  onOpenUser,
  onMessageUser,
}: Props) {
  if (!items.length) {
    return (
      <div className="mt-4 rounded-md border border-dashed border-neutral-700/70 bg-neutral-900/40 p-4 text-sm text-neutral-300">
        No listings yet. Be the first to add a haunted product or service.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      {/* HEADER BANNER CAROUSEL FOR MARKETPLACE */}
      <AdSlot
        placementKey="marketplace-header-banner-carousel"
        className="mb-3"
      />

      {items.map((item, index) => {
        const ownerId = item.postedBy?.id;
        const canEdit = isAdmin || ownerId === currentUserId;

        const createdAt =
          typeof item.createdAt === 'number'
            ? item.createdAt
            : new Date(item.createdAt as any).getTime();

        return (
          <React.Fragment key={item.id}>
            <article
              className="rounded-lg border border-yellow-500/60 bg-neutral-900/95 p-3 text-sm shadow-sm"
            >
              <div className="flex gap-3">
                {/* Thumbnail */}
                <button
                  type="button"
                  className="flex h-24 w-32 items-center justify-center overflow-hidden rounded-md border border-neutral-800 bg-black/60 cursor-pointer"
                  onClick={() => {
                    if (item.imageUrl) onOpenImage(item.imageUrl as string);
                  }}
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl as string}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[11px] text-neutral-500">No image</span>
                  )}
                </button>

                {/* Main content */}
                <div className="flex-1">
                  {/* Header row: title + kind + edit/delete */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-white">
                          {item.title}
                        </h2>

                        {item.kind && (
                          <span className="rounded-full border border-yellow-500/60 bg-yellow-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-yellow-300">
                            {item.kind === 'Product' ? 'FOR SALE' : 'WANTED'}
                          </span>
                        )}
                      </div>
                    </div>

                    {canEdit && (
                      <div className="flex items-center gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => onEditListing(item)}
                          className="inline-flex items-center gap-1 rounded-full border border-yellow-500/60 bg-yellow-500/10 px-2.5 py-1 text-yellow-200 hover:bg-yellow-500/20"
                        >
                          <Edit2 size={12} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteListing(item.id as string)}
                          className="inline-flex items-center gap-1 rounded-full border border-red-500/60 bg-red-500/10 px-2.5 py-1 text-red-200 hover:bg-red-500/20"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="mt-1 text-xs leading-relaxed text-neutral-200">
                      {item.description}
                    </p>
                  )}

                  {/* Link button (single accent action) */}
                  {item.webLink && (
                    <div className="mt-2">
                      <a
                        href={item.webLink as string}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full border border-yellow-500 bg-yellow-500/10 px-3 py-1 text-[11px] font-semibold text-yellow-200 hover:bg-yellow-500/20"
                      >
                        <ExternalLink size={12} />
                        Link
                      </a>
                    </div>
                  )}

                  {/* Footer: Posted by + date + DM */}
                  <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400">
                    <div>
                      <span>Posted by </span>
                      {item.postedBy?.id ? (
                        <button
                          type="button"
                          onClick={() => onOpenUser(item.postedBy!.id)}
                          className="font-semibold text-neutral-100 underline-offset-2 hover:text-yellow-200 hover:underline"
                        >
                          {item.postedBy.name || 'User'}
                        </button>
                      ) : (
                        <span className="font-semibold text-neutral-100">
                          {item.postedBy?.name || 'User'}
                        </span>
                      )}
                      <span> • {formatShortDate(createdAt)}</span>
                    </div>

                    {/* Message seller */}
                    {ownerId && ownerId !== currentUserId && (
                      <button
                        type="button"
                        onClick={() => onMessageUser(ownerId)}
                        className="inline-flex items-center gap-1 rounded-full border border-neutral-500 bg-neutral-800 px-3 py-1 text-[11px] text-neutral-100 hover:bg-neutral-700"
                      >
                        <Mail size={12} />
                        Message seller
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </article>

            {/* INLINE NATIVE AD AFTER 3rd LISTING */}
            {index === 2 && (
              <AdSlot
                placementKey="marketplace-feed-inline-1"
                className="mt-2"
              />
            )}

            {/* INLINE NATIVE AD AFTER 10th LISTING */}
            {index === 9 && (
              <AdSlot
                placementKey="marketplace-feed-inline-2"
                className="mt-2"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}











