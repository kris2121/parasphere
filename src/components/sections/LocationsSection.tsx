'use client';

import React from 'react';
import { SectionDisclaimer, CountrySelect } from '@/components/ParaverseScope';
import type { LocationData } from '@/components/LiveMap';
import type { Comment } from '@/types/paraverse';
import type { UserMini } from '@/components/UserDrawer';

import LocationsFeed, {
  LocationFeedItem,
} from '@/components/feed/LocationsFeed';

type Props = {
  country?: string | null;
  countries: { code: string; name: string }[];

  locationsByStars: LocationData[];
  locationStars: Record<string, number>;
  comments: Record<string, Comment[]>;
  usersById: Record<string, UserMini>;

  giveLocationStar: (locId: string) => void;

  openFromPin: (loc: LocationData) => void;
  openComment: (key: string) => void;
  openEditComment: (key: string, commentId: string) => void;
  openUser: (userId: string) => void;

  openAddLocation: () => void;
  formatShortDate: (isoOrMs: string | number) => string;

  currentUserId: string;

  // NEW: admin flag so admins can manage any location
  isAdmin: boolean;

  // "View on map" behaviour injected from page.tsx
  onViewOnMap: (locId: string) => void;

  // feed actions for owner controls / DM
  onEditLocation: (locId: string) => void;
  onDeleteLocation: (locId: string) => void;
  onMessageUser: (userId: string) => void;
};

export default function LocationsSection({
  country,
  countries,
  locationsByStars,
  locationStars,
  comments,
  usersById,
  giveLocationStar, // currently not used in feed but kept for future
  openFromPin,
  openComment,
  openEditComment,
  openUser,
  openAddLocation,
  formatShortDate,
  currentUserId,
  isAdmin,
  onViewOnMap,
  onEditLocation,
  onDeleteLocation,
  onMessageUser,
}: Props) {
  // Build feed items with stars + review counts etc
  const items: LocationFeedItem[] = locationsByStars.map((loc) => {
    const locId = loc.id;
    const stars = locationStars[locId] ?? 0;
    const reviewKey = `loc:${locId}`;
    const reviewComments = comments[reviewKey] ?? [];

    const ownerId = (loc as any).ownerId ?? 'unknown';
    const ownerName = (loc as any).ownerName ?? 'Location owner';
    const createdAt = (loc as any).createdAt ?? Date.now();

    const socialLinks =
      ((loc as any).socialLinks as Array<{ platform: string; url: string }>) ??
      [];

    return {
      id: locId,
      title: loc.title,
      summary: loc.summary,
      imageUrl: (loc as any).imageUrl as string | undefined,
      address: (loc as any).address,
      priceInfo: (loc as any).priceInfo,
      website: (loc as any).website,
      socialLinks,
      verifiedByOwner: (loc as any).verifiedByOwner,
      postedBy: { id: ownerId, name: ownerName },
      createdAt,
      countryCode: (loc as any).countryCode,
      postalCode: (loc as any).postalCode,
      stars,
      reviewCount: reviewComments.length,
    };
  });

  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold text-white">Locations</h1>

      <SectionDisclaimer>
        Locations are user-submitted. Always verify access rules and ownership
        before visiting. Some listings may not be officially owner-confirmed.
      </SectionDisclaimer>

      {/* Country scope pill */}
      <div className="mb-4">
        <CountrySelect country={country ?? undefined} countries={countries} />
      </div>

      <div className="mb-6">
        <button
          onClick={openAddLocation}
          className="rounded-md border border-white bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10"
        >
          + Add Location
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
          No locations have been added yet. Use the{' '}
          <span className="font-semibold">+ Add Location</span> button to add
          your first haunt.
        </div>
      ) : (
        <LocationsFeed
          items={items}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          // IMAGE CLICK → open drawer (via openFromPin)
          onOpenLocation={(locId) => {
            const loc = locationsByStars.find((l) => l.id === locId);
            if (loc) openFromPin(loc);
          }}
          // "View on map" → just move map / no drawer
          onOpenMap={(locId) => onViewOnMap(locId)}
          onOpenUser={openUser}
          onAddReview={(locId) => openComment(`loc:${locId}`)}
          onEditLocation={onEditLocation}
          onDeleteLocation={onDeleteLocation}
          onMessageUser={onMessageUser}
          formatShortDate={(ms) =>
            formatShortDate(typeof ms === 'number' ? ms : Number(ms))
          }
        />
      )}
    </>
  );
}




