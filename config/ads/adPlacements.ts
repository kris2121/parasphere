// config/adPlacements.ts

export type AdPlacementKey =
  // Home feed
  | 'home-feed-inline-1'
  | 'home-feed-inline-2'
  // Events feed
  | 'events-header-banner-carousel'
  | 'events-feed-inline-1'
  | 'events-feed-inline-2'
  // Marketplace feed
  | 'marketplace-header-banner-carousel'
  | 'marketplace-feed-inline-1'
  | 'marketplace-feed-inline-2'
  // Collaborations feed
  | 'collabs-feed-inline-1'
  | 'collabs-feed-inline-2'
  // Locations feed
  | 'locations-feed-inline-1'
  | 'locations-feed-inline-2'
  // Global / reserved
  | 'global-footer-banner'
  | 'promo-interstitial';

export const AD_PLACEMENTS: AdPlacementKey[] = [
  // Home feed
  'home-feed-inline-1',
  'home-feed-inline-2',
  // Events feed
  'events-header-banner-carousel',
  'events-feed-inline-1',
  'events-feed-inline-2',
  // Marketplace feed
  'marketplace-header-banner-carousel',
  'marketplace-feed-inline-1',
  'marketplace-feed-inline-2',
  // Collaborations feed
  'collabs-feed-inline-1',
  'collabs-feed-inline-2',
  // Locations feed
  'locations-feed-inline-1',
  'locations-feed-inline-2',
  // Global / reserved
  'global-footer-banner',
  'promo-interstitial',
];
