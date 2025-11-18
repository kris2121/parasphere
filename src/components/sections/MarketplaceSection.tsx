'use client';

import React from 'react';
import MarketplaceFeed from '@/components/feed/MarketplaceFeed';
import { CountrySelect, SectionDisclaimer } from '@/components/ParaverseScope';

type MarketplaceSectionProps = {
  country: string;
  items: any[]; // or MarketplaceItem[]
  marketFilter: 'All' | 'Product' | 'Service';
  setMarketFilter: (v: 'All' | 'Product' | 'Service') => void;

  currentUserId: string;
  onOpenDM: (userId: string) => void;
  onOpenUser: (userId: string) => void;          // 👈 NEW

  onAddListing: () => void;
  onEditListing: (item: any) => void;            // pass-through to feed
  onDeleteListing: (id: string) => void;

  onOpenImage: (src: string) => void;
};

export default function MarketplaceSection({
  country,
  items,
  marketFilter,
  setMarketFilter,
  currentUserId,
  onOpenDM,
  onOpenUser,
  onAddListing,
  onEditListing,
  onDeleteListing,
  onOpenImage,
}: MarketplaceSectionProps) {
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold text-yellow-300">
        Marketplace
      </h1>

      <SectionDisclaimer>
        Listings are user posted. Paraverse is not involved in transactions — verify
        sellers and terms independently.
      </SectionDisclaimer>

      <div className="mb-4">
        <CountrySelect />
      </div>

      <div className="mb-4">
        <button
          onClick={onAddListing}
          className="rounded-md border border-yellow-500 bg-yellow-500/10 px-3 py-1.5 text-sm text-yellow-300"
        >
          + Add Listing
        </button>
      </div>

      <MarketplaceFeed
        country={country}
        items={items}
        marketFilter={marketFilter}
        setMarketFilter={setMarketFilter}
        openDM={onOpenDM}
        onOpenUser={onOpenUser}          // 👈 NEW
        currentUserId={currentUserId}
        onEditListing={onEditListing}
        onDeleteListing={onDeleteListing}
        onOpenImage={onOpenImage}
      />
    </>
  );
}
