'use client';

import React, { useMemo } from 'react';
import type { MarketplaceItem } from '@/types/paraverse';
import MarketplaceFeed from '@/components/feed/MarketplaceFeed';
import {
  CountrySelect,
  SectionDisclaimer,
} from '@/components/ParaverseScope';

type MarketFilter = 'All' | 'For Sale' | 'Wanted';

type Props = {
  country: string | null;
  items: MarketplaceItem[];
  marketFilter: MarketFilter;
  setMarketFilter: (v: MarketFilter) => void;
  currentUserId: string;

  // NEW: admin flag so admin can edit/delete any listing
  isAdmin: boolean;

  // DM handler
  onOpenDM: (userId: string) => void;

  onAddListing: () => void;
  onEditListing: (item: MarketplaceItem) => void;
  onDeleteListing: (id: string) => void;
  onOpenImage: (src: string) => void;
  onOpenUser: (id: string) => void;
};

export default function MarketplaceSection({
  country,
  items,
  marketFilter,
  setMarketFilter,
  currentUserId,
  isAdmin,
  onOpenDM,
  onAddListing,
  onEditListing,
  onDeleteListing,
  onOpenImage,
  onOpenUser,
}: Props) {
  const filteredItems = useMemo(() => {
    if (marketFilter === 'For Sale') {
      return items.filter((i) => i.kind === 'For Sale');
    }
    if (marketFilter === 'Wanted') {
      return items.filter((i) => i.kind === 'Wanted');
    }
    return items;
  }, [items, marketFilter]);

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-yellow-300">
        Marketplace
      </h1>

      {/* Behaviour / rules disclaimer */}
      <div className="mt-3">
        <SectionDisclaimer>
          Listings are community-submitted. Paraverse does not verify
          listings or users. Please use common sense and stay safe
          when arranging purchases or meet-ups.
        </SectionDisclaimer>
      </div>

      {/* Country scope pill */}
      <div className="mb-3 mt-2">
        <CountrySelect />
      </div>

      {/* Add Listing button */}
      <div className="mt-1">
        <button
          onClick={onAddListing}
          className="rounded-md border border-yellow-500 bg-yellow-500/10 px-3 py-1.5 text-sm font-medium text-yellow-300 hover:bg-yellow-500/20"
        >
          + Add listing
        </button>
      </div>

      {/* Filter chips */}
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <button
          className={`rounded-full border px-3 py-1 ${
            marketFilter === 'All'
              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
              : 'border-neutral-700 text-neutral-300'
          }`}
          onClick={() => setMarketFilter('All')}
        >
          All
        </button>

        <button
          className={`rounded-full border px-3 py-1 ${
            marketFilter === 'For Sale'
              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
              : 'border-neutral-700 text-neutral-300'
          }`}
          onClick={() => setMarketFilter('For Sale')}
        >
          For Sale
        </button>

        <button
          className={`rounded-full border px-3 py-1 ${
            marketFilter === 'Wanted'
              ? 'border-yellow-500 bg-yellow-500/10 text-yellow-300'
              : 'border-neutral-700 text-neutral-300'
          }`}
          onClick={() => setMarketFilter('Wanted')}
        >
          Wanted
        </button>
      </div>

      {/* Feed */}
      <MarketplaceFeed
        items={filteredItems}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        onEditListing={onEditListing}
        onDeleteListing={onDeleteListing}
        onOpenImage={onOpenImage}
        onOpenUser={onOpenUser}
        onMessageUser={onOpenDM}
      />
    </div>
  );
}




