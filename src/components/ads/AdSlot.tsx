'use client';

import React, { useEffect, useState } from 'react';

import {
  loadActiveAdsForPlacement,
  type AdDB,
  type AdPlacementKey,
} from '@/lib/db/ads';

type AdSlotProps = {
  placementKey: AdPlacementKey;
  className?: string;
  maxItems?: number;
};

const AdSlot: React.FC<AdSlotProps> = ({
  placementKey,
  className,
  maxItems = 1,
}) => {
  const [ads, setAds] = useState<AdDB[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isHeaderCarousel =
    placementKey === 'events-header-banner-carousel' ||
    placementKey === 'marketplace-header-banner-carousel' ||
    placementKey === 'collabs-header-banner';

  useEffect(() => {
    let isMounted = true;

    async function fetchAds() {
      try {
        const activeAds = await loadActiveAdsForPlacement(placementKey);
        if (!isMounted) return;
        setAds(activeAds);
      } catch (err) {
        console.error('Error loading ads for placement', placementKey, err);
        if (!isMounted) return;
        setError('Failed to load ads');
      }
    }

    fetchAds();

    return () => {
      isMounted = false;
    };
  }, [placementKey]);

  if (!ads && !error) return null;
  if (error) return null;

  if (!ads || ads.length === 0) {
    return (
      <div className={className}>
        <GoogleAdFallback placementKey={placementKey} />
      </div>
    );
  }

  if (isHeaderCarousel) {
    return (
      <div className={className}>
        <BannerCarousel ads={ads} />
      </div>
    );
  }

  const inlineAds = ads.slice(0, maxItems);

  return (
    <div className={className}>
      {inlineAds.map((ad) => (
        <NativeAdCard key={ad.id} ad={ad} />
      ))}
    </div>
  );
};

export default AdSlot;

/* -------------------------------------------------------------------------- */
/*  GOOGLE FALLBACK STUB                                                      */
/* -------------------------------------------------------------------------- */

type GoogleAdFallbackProps = {
  placementKey: AdPlacementKey;
};

const GoogleAdFallback: React.FC<GoogleAdFallbackProps> = ({
  placementKey,
}) => {
  return (
    <div
      className="w-full min-h-[60px]"
      data-ad-provider="google"
      data-ad-slot={placementKey}
    />
  );
};

/* -------------------------------------------------------------------------- */
/*  NATIVE INLINE AD CARD                                                     */
/* -------------------------------------------------------------------------- */

type NativeAdCardProps = {
  ad: AdDB;
};

const NativeAdCard: React.FC<NativeAdCardProps> = ({ ad }) => {
  const handleClick = () => {
    if (ad.targetUrl) {
      window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-stretch gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/70 px-3 py-3 text-left shadow-sm transition hover:border-cyan-500/70 hover:bg-slate-900/80"
    >
      {ad.imageUrl ? (
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.imageUrl}
            alt={ad.title || ad.sponsorName || 'Ad'}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-[10px] uppercase tracking-wide text-slate-400">
          Sponsored
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {ad.sponsorName && (
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-cyan-400/80">
            {ad.sponsorName}
          </div>
        )}

        {ad.title && (
          <div className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-50">
            {ad.title}
          </div>
        )}

        {ad.subtitle && (
          <div className="mt-0.5 line-clamp-2 text-xs text-slate-400">
            {ad.subtitle}
          </div>
        )}

        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full border border-cyan-500/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-cyan-300/90">
            {ad.ctaLabel || 'Learn more'}
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Sponsored
          </span>
        </div>
      </div>
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/*  BANNER CAROUSEL FOR HEADER SLOTS                                          */
/* -------------------------------------------------------------------------- */

type BannerCarouselProps = {
  ads: AdDB[];
};

const BannerCarousel: React.FC<BannerCarouselProps> = ({ ads }) => {
  const [index, setIndex] = useState(0);

  if (!ads || ads.length === 0) return null;

  const current = ads[index];

  const handleClick = () => {
    if (current.targetUrl) {
      window.open(current.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const goPrev = () => {
    setIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  const goNext = () => {
    setIndex((prev) => (prev + 1) % ads.length);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/80">
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full items-stretch gap-3 p-3 text-left"
      >
        {current.imageUrl && (
          <div className="h-24 w-40 shrink-0 overflow-hidden rounded-xl bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.imageUrl}
              alt={current.title || current.sponsorName || 'Ad'}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          {current.sponsorName && (
            <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-cyan-400/80">
              {current.sponsorName}
            </div>
          )}

          {current.title && (
            <div className="mt-0.5 line-clamp-2 text-sm font-semibold text-slate-50">
              {current.title}
            </div>
          )}

          {current.subtitle && (
            <div className="mt-0.5 line-clamp-2 text-xs text-slate-300/90">
              {current.subtitle}
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-500/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-cyan-300/90">
              {current.ctaLabel || 'View offer'}
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
              Sponsored
            </span>
          </div>
        </div>
      </button>

      {ads.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/80 px-2 py-1 text-xs text-slate-200 shadow"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-slate-950/80 px-2 py-1 text-xs text-slate-200 shadow"
          >
            ›
          </button>

          <div className="pointer-events-none absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {ads.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === index ? 'bg-cyan-400' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};





