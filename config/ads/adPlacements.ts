// src/config/adPlacements.ts

// All valid ad placement keys used across the app
export type AdPlacementKey =
  // Events
  | 'events-header-banner-carousel'
  | 'events-feed-inline-1'
  | 'events-feed-inline-2'
  // Marketplace
  | 'marketplace-header-banner-carousel'
  | 'marketplace-feed-inline-1'
  | 'marketplace-feed-inline-2'
  // Collaborations
  | 'collabs-header-banner'
  | 'collabs-feed-inline-1'
  | 'collabs-feed-inline-2';

// Optional registry object if you want labels / admin UI later
export const AD_PLACEMENTS: Record<
  AdPlacementKey,
  { label: string }
> = {
  // Events
  'events-header-banner-carousel': { label: 'Events header banner' },
  'events-feed-inline-1': { label: 'Events inline #1' },
  'events-feed-inline-2': { label: 'Events inline #2' },

  // Marketplace
  'marketplace-header-banner-carousel': {
    label: 'Marketplace header banner',
  },
  'marketplace-feed-inline-1': { label: 'Marketplace inline #1' },
  'marketplace-feed-inline-2': { label: 'Marketplace inline #2' },

  // Collabs
  'collabs-header-banner': { label: 'Collabs header banner' },
  'collabs-feed-inline-1': { label: 'Collabs inline #1' },
  'collabs-feed-inline-2': { label: 'Collabs inline #2' },
};

