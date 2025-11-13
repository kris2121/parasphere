'use client';

import React from 'react';

export type MarketplaceItem = {
  id: string;
  kind: 'Product' | 'Service';
  title: string;
  description: string;
  price?: number;
  locationText?: string;
  imageUrl?: string;
  contactOrLink?: string;
  createdAt: number;
  postedBy: { id: string; name: string };
  countryCode?: string;
  postalCode?: string;
};

type MarketFilter = 'All' | 'Product' | 'Service';

type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  imageUrl?: string;
  tagUserIds?: string[];
  createdAt: number;
};

type Props = {
  items: MarketplaceItem[];
  comments: Record<string, Comment[]>;
  country: string;
  marketStars: Record<string, number>;
  onGiveStar: (id: string) => void;
  onOpenComment: (key: string) => void;
  marketFilter: MarketFilter;
  setMarketFilter: (v: MarketFilter) => void;
  onOpenListingForm: () => void;
};

function byCountry<T extends { countryCode?: string }>(code: string) {
  return (x: T) => (x.countryCode?.toUpperCase() || '') === code;
}

function sortMarket(a: MarketplaceItem, b: MarketplaceItem) {
  return b.createdAt - a.createdAt;
}

function SectionDisclaimer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-lg border border-yellow-700/40 bg-yellow-900/10 px-3 py-2 text-sm text-yellow-200">
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm ${
        active
          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
          : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
      }`}
    >
      {children}
    </button>
  );
}

function StarBadge({
  value,
  onClick,
}: {
  value: number;
  onClick?: () => void;
}) {
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

function TranslatePost({ text }: { text?: string }) {
  const [showTranslated, setShowTranslated] = React.useState(false);
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

export default function MarketplaceFeed({
  items,
  comments,
  country,
  marketStars,
  onGiveStar,
  onOpenComment,
  marketFilter,
  setMarketFilter,
  onOpenListingForm,
}: Props) {
  const filtered = items
    .filter(byCountry<MarketplaceItem>(country))
    .filter((m) => (marketFilter === 'All' ? true : m.kind === marketFilter))
    .sort(sortMarket);

  const anyInCountry = items.filter(byCountry<MarketplaceItem>(country)).length > 0;

  return (
    <>
      <SectionDisclaimer>
        Marketplace listings are user-posted advertisements. Paraverse is not a
        party to any transaction and accepts no liability. Do your own checks,
        warranties, and payments externally.
      </SectionDisclaimer>

      <div className="mb-3 flex items-center gap-2">
        <Chip active={marketFilter === 'All'} onClick={() => setMarketFilter('All')}>
          All
        </Chip>
        <Chip
          active={marketFilter === 'Product'}
          onClick={() => setMarketFilter('Product')}
        >
          Products
        </Chip>
        <Chip
          active={marketFilter === 'Service'}
          onClick={() => setMarketFilter('Service')}
        >
          Services
        </Chip>
        <div className="grow" />
        <button
          onClick={onOpenListingForm}
          className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300 hover:bg-cyan-500/20"
        >
          + Add Listing
        </button>
      </div>

      <div className="grid gap-4">
        {filtered.map((m) => {
          const cKey = `market:${m.id}`;
          return (
            <article
              key={m.id}
              className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs text-neutral-400">
                  {m.kind} • by {m.postedBy.name}
                </div>
                <StarBadge
                  value={marketStars[m.id] ?? 0}
                  onClick={() => onGiveStar(m.id)}
                />
              </div>
              <h3 className="text-lg font-semibold">{m.title}</h3>
              {m.imageUrl && (
                <img
                  src={m.imageUrl}
                  className="mt-2 rounded-md border border-neutral-800"
                  alt=""
                />
              )}
              <TranslatePost text={m.description} />
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-400">
                {m.price && <span>Price: £{m.price}</span>}
                {m.locationText && <span>Location: {m.locationText}</span>}
                {m.countryCode && <span>Country: {m.countryCode}</span>}
                {m.postalCode && <span>Post code: {m.postalCode}</span>}
                {m.contactOrLink && (
                  <a
                    className="text-cyan-300 hover:underline"
                    href={m.contactOrLink}
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
                  onClick={() => onOpenComment(cKey)}
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

        {!anyInCountry && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
            No listings yet.
          </div>
        )}
      </div>
    </>
  );
}
