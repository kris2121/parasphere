'use client';

import React from 'react';
import { Mail, Edit2, Trash2 } from 'lucide-react';

type MarketplaceItem = {
  id: string;
  kind: 'Product' | 'Service';
  title: string;
  description: string;
  imageUrl?: string;
  contactInfo?: string;
  webLink?: string;
  createdAt: number;
  postedBy: { id: string; name: string };
  countryCode?: string;
  postalCode?: string;
};

type Props = {
  country: string;
  items: MarketplaceItem[];
  marketFilter: 'All' | 'Product' | 'Service';
  setMarketFilter: (v: 'All' | 'Product' | 'Service') => void;

  openDM: (userId: string) => void;
  onOpenUser: (userId: string) => void;   // 👈 NEW

  // owner controls + lightbox
  currentUserId: string;
  onEditListing: (item: MarketplaceItem) => void;
  onDeleteListing: (id: string) => void;
  onOpenImage: (src: string) => void;
};

function formatShortDate(ms: number) {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function labelForLink(url?: string) {
  if (!url) return 'Link';
  const lower = url.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'YouTube';
  if (lower.includes('tiktok.com')) return 'TikTok';
  if (lower.includes('instagram.com')) return 'Instagram';
  if (lower.includes('facebook.com')) return 'Facebook';
  return 'Link';
}

export default function MarketplaceFeed({
  country,
  items,
  marketFilter,
  setMarketFilter,
  openDM,
  onOpenUser,             // 👈 NEW
  currentUserId,
  onEditListing,
  onDeleteListing,
  onOpenImage,
}: Props) {
  // Filter by country scope
  const scoped = items.filter((item) => {
    if (!country || country.toUpperCase() === 'EU') return true;
    if (!item.countryCode) return true;
    return item.countryCode.toUpperCase() === country.toUpperCase();
  });

  // Filter by product/service
  const filtered = scoped.filter((item) => {
    if (marketFilter === 'All') return true;
    return item.kind === marketFilter;
  });

  // Newest first
  const sorted = [...filtered].sort((a, b) => b.createdAt - a.createdAt);

  function handleEdit(item: MarketplaceItem) {
    onEditListing(item);
  }

  function handleDelete(id: string) {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    onDeleteListing(id);
  }

  return (
    <div className="space-y-4">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => setMarketFilter('All')}
          className={`rounded-full border px-3 py-1 ${
            marketFilter === 'All'
              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
              : 'border-neutral-700 text-neutral-300'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setMarketFilter('Product')}
          className={`rounded-full border px-3 py-1 ${
            marketFilter === 'Product'
              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
              : 'border-neutral-700 text-neutral-300'
          }`}
        >
          Products
        </button>
        <button
          type="button"
          onClick={() => setMarketFilter('Service')}
          className={`rounded-full border px-3 py-1 ${
            marketFilter === 'Service'
              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
              : 'border-neutral-700 text-neutral-300'
          }`}
        >
          Services
        </button>
      </div>

      {sorted.length === 0 && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
          No marketplace listings yet. Use the{' '}
          <span className="font-semibold">+ Add Listing</span> button to create
          your first item.
        </div>
      )}

      {/* LISTINGS */}
      <div className="space-y-3">
        {sorted.map((item) => {
          const isOwner = item.postedBy.id === currentUserId;
          const linkLabel = labelForLink(item.webLink);

          return (
            <div
              key={item.id}
              className="flex gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-sm"
            >
              {/* IMAGE LEFT – opens lightbox */}
              {item.imageUrl && (
                <button
                  type="button"
                  onClick={() => onOpenImage(item.imageUrl!)}
                  className="h-20 w-28 shrink-0 overflow-hidden rounded-md bg-neutral-950 md:h-24 md:w-32 cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                </button>
              )}

              {/* MAIN CONTENT */}
              <div className="flex flex-1 flex-col gap-1">
                {/* Title + owner controls */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      {item.title}
                    </h2>

                    <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-neutral-400">
                      {item.countryCode && (
                        <span className="rounded-full bg-neutral-800/80 px-2 py-0.5">
                          {item.countryCode}
                          {item.postalCode && ` • ${item.postalCode}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* EDIT / DELETE – owner only */}
                  {isOwner && (
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="inline-flex items-center gap-1 rounded-full border border-yellow-500/70 bg-yellow-500/10 px-2 py-0.5 text-[11px] text-yellow-200 hover:bg-yellow-500/20"
                      >
                        <Edit2 size={12} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-500/70 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-200 hover:bg-red-500/20"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="mt-1 text-xs text-neutral-300 whitespace-pre-line">
                  {item.description}
                </p>

                {/* Link row */}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-300">
                  {item.webLink && (
                    <button
                      type="button"
                      onClick={() => window.open(item.webLink!, '_blank')}
                      className="inline-flex items-center gap-1 rounded-full border border-yellow-500/70 bg-yellow-500/10 px-2 py-0.5 text-[11px] text-yellow-200 hover:bg-yellow-500/20"
                    >
                      {linkLabel}
                    </button>
                  )}
                </div>

                {/* Footer: posted by + message seller */}
                <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-neutral-500">
                  <span>
                    Posted by{' '}
                    <button
                      type="button"
                      onClick={() => onOpenUser(item.postedBy.id)}
                      className="font-medium text-neutral-300 hover:text-yellow-300 hover:underline"
                    >
                      {item.postedBy.name}
                    </button>{' '}
                    • {formatShortDate(item.createdAt)}
                  </span>

                  {!isOwner && (
                    <button
                      type="button"
                      onClick={() => openDM(item.postedBy.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-500 bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-100 hover:bg-neutral-700"
                    >
                      <Mail size={12} />
                      Message seller
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}









