'use client';

import React from 'react';
import { Mail } from 'lucide-react';

import LiveMap, {
  LocationData,
  LiveMapHandle,
} from '@/components/LiveMap';
import LocationDrawer from '@/components/LocationDrawer';
import MapActions from '@/components/MapActions';
import UserDrawer, { UserMini } from '@/components/UserDrawer';

import type { EventItem, CollabItem, Comment } from '@/types/paraverse';
import type { CreatorPost } from '@/components/feed/CreatorsFeed';

// ----------------------------------------------
// Country → map centre lookup table
// ----------------------------------------------
const COUNTRY_CENTERS: Record<string, [number, number]> = {
  GB: [-2.5, 54.3], // United Kingdom
  UK: [-2.5, 54.3], // UK alternative
  US: [-98.35, 39.5], // United States
  CA: [-106.35, 56.1], // Canada
  AU: [134.49, -25.73], // Australia
  IE: [-8.1, 53.2], // Ireland
};

type MapShellProps = {
  mapRef: React.RefObject<LiveMapHandle>;
  country: string;
  mapLocations: LocationData[];
  openFromPin: (loc: LocationData) => void;

  drawerOpen: boolean;
  drawerKind: 'HAUNTING' | 'EVENT' | 'COLLAB' | null;
  drawerLoc?: LocationData;
  setDrawerOpen: (open: boolean) => void;
  setDrawerKind: (kind: 'HAUNTING' | 'EVENT' | 'COLLAB' | null) => void;

  locationReviews: Comment[];
  giveLocationStar: (locId: string) => void;
  locationStars: Record<string, number>;
  followedLocations: string[];
  toggleFollowLocation: (locId: string) => void;
  canEditComment: (c: Comment) => boolean;
  openComment: (key: string) => void;
  openEditComment: (key: string, id: string) => void;

  events: EventItem[];
  collabs: CollabItem[];
  formatShortDate: (isoOrMs: string | number) => string;
  openDM: (userId: string) => void;

  userDrawerOpen: boolean;
  drawerUser?: UserMini;
  currentUser: {
    id: string;
    name: string;
    avatarUrl?: string;
    role: 'user' | 'admin' | 'superadmin';
  };
  userStars: Record<string, number>;
  giveUserStar: (id: string) => void;
  toggleFollowUser: (id: string) => void;

  /** List of followed user ids so the drawer can show Added vs Add */
  followedUsers: string[];

  setUsersById: (updater: any) => void;
  setCurrentUser: (updater: any) => void;
  setDrawerUser: (updater: any) => void;
  setUserDrawerOpen: (updater: any) => void;

  // all creator posts grouped by locationId
  creatorPostsByLocation: Record<string, CreatorPost[]>;

  // profile save handler from page.tsx
  onSaveUserProfile: (next: UserMini) => void;

  // NEW: admin + location owner tools
  isAdmin: boolean;
  onEditLocation: (locId: string) => void;
  onDeleteLocation: (locId: string) => void;

  // NEW: superadmin-only admin toggle handler
  onToggleAdminRole: (userId: string, nextRole: 'user' | 'admin') => void;
};

export default function MapShell(props: MapShellProps) {
  const {
    mapRef,
    country,
    mapLocations,
    openFromPin,
    drawerOpen,
    drawerKind,
    drawerLoc,
    setDrawerOpen,
    setDrawerKind,
    locationReviews,
    giveLocationStar,
    locationStars,
    followedLocations,
    toggleFollowLocation,
    canEditComment,
    openComment,
    openEditComment,
    events,
    collabs,
    formatShortDate,
    openDM,
    userDrawerOpen,
    drawerUser,
    currentUser,
    userStars,
    giveUserStar,
    toggleFollowUser,
    followedUsers,
    setUsersById,
    setCurrentUser,
    setDrawerUser,
    setUserDrawerOpen,
    creatorPostsByLocation,
    onSaveUserProfile,
    isAdmin,
    onEditLocation,
    onDeleteLocation,
    onToggleAdminRole,
  } = props;

  // Creator videos for the currently opened location (already grouped in page.tsx)
  const creatorPostsForDrawerLocation: CreatorPost[] =
    drawerLoc && creatorPostsByLocation
      ? creatorPostsByLocation[drawerLoc.id] ?? []
      : [];

  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-3 pt-3">
      <div className="relative">
        <LiveMap
          ref={mapRef}
          initialCenter={COUNTRY_CENTERS[country] || COUNTRY_CENTERS.GB}
          heightVh={{ desktop: 38, mobile: 32 }}
          locations={mapLocations}
          onOpen={openFromPin}
        />

        {/* MapActions is now map-only (no Add Location here) */}
        <MapActions />

        {/* Drawers */}
        <div className="pointer-events-none absolute inset-0 z-50 flex items-start justify-center p-3 md:p-4">
          <div className="pointer-events-auto w-full max-w-xl space-y-3">
            {/* LOCATION / HAUNT DRAWER (stars + reviews + admin tools) */}
            {drawerOpen && drawerKind === 'HAUNTING' && (
              <LocationDrawer
                variant="center"
                open={drawerOpen}
                location={drawerLoc}
                starCount={
                  drawerLoc ? locationStars[drawerLoc.id] ?? 0 : 0
                }
                onGiveLocationStar={giveLocationStar}
                onClickLocationTitle={() => {
                  if (!drawerLoc) return;
                  if (mapRef.current?.focusOn) {
                    mapRef.current.focusOn(
                      drawerLoc.lng,
                      drawerLoc.lat,
                      11,
                    );
                  }
                }}
                isFollowed={
                  drawerLoc
                    ? followedLocations.includes(drawerLoc.id)
                    : false
                }
                onFollowLocation={(locId) => toggleFollowLocation(locId)}
                onAddReview={() => {
                  if (!drawerLoc) return;
                  const reviewKey = `loc:${drawerLoc.id}`;
                  openComment(reviewKey);
                }}
                reviews={locationReviews}
                canEditReview={canEditComment}
                onEditReview={(reviewId) => {
                  if (!drawerLoc) return;
                  const reviewKey = `loc:${drawerLoc.id}`;
                  openEditComment(reviewKey, reviewId);
                }}
                onClose={() => {
                  setDrawerOpen(false);
                  setDrawerKind(null);

                  if (drawerLoc && mapRef.current?.focusOn) {
                    mapRef.current.focusOn(
                      drawerLoc.lng,
                      drawerLoc.lat,
                      11,
                    );
                  }
                }}
                currentUserId={currentUser.id}
                isAdmin={isAdmin}
                onEditLocation={(locId) => onEditLocation(locId)}
                onDeleteLocation={(locId) => onDeleteLocation(locId)}
              />
            )}

            {/* EVENT MAP DRAWER – mirrors Event feed card */}
            {drawerOpen && drawerKind === 'EVENT' && drawerLoc && (
              <div className="rounded-xl border border-purple-500/70 bg-neutral-950/95 p-4 shadow-xl">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-purple-300">
                      Event details
                    </p>
                    <h2 className="text-lg font-semibold text-white">
                      {drawerLoc.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      setDrawerKind(null);
                    }}
                    className="rounded-full bg-black/60 px-2 py-1 text-xs text-neutral-300 hover:bg-black/80"
                  >
                    ✕
                  </button>
                </div>

                {(() => {
                  const ev = events.find((e) => e.locationId === drawerLoc.id);
                  if (!ev) return null;

                  const primaryLink =
                    Array.isArray(ev.socialLinks) && ev.socialLinks.length > 0
                      ? ev.socialLinks[0].url
                      : undefined;

                  return (
                    <div className="space-y-4 text-sm">
                      <div className="flex flex-col gap-3 md:flex-row">
                        {/* IMAGE THUMB */}
                        {ev.imageUrl && (
                          <div className="h-24 w-32 shrink-0 overflow-hidden rounded-md bg-neutral-900 md:h-28 md:w-40">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={ev.imageUrl}
                              alt={ev.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-1">
                          {ev.description && (
                            <p className="whitespace-pre-line text-neutral-200">
                              {ev.description}
                            </p>
                          )}

                          {/* Single LINK pill – same idea as feed */}
                          {primaryLink && (
                            <div className="mt-3">
                              <button
                                type="button"
                                onClick={() =>
                                  window.open(primaryLink, '_blank')
                                }
                                className="inline-flex items-center gap-1 rounded-full border border-purple-400 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-100 hover:bg-purple-500/20"
                              >
                                Link
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* HOST + MESSAGE HOST – matches feed info but with CTA */}
                      <div className="mt-1 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-300">
                        <div>
                          <span className="opacity-70">Hosted by </span>
                          <span className="font-semibold text-purple-200">
                            {ev.postedBy?.name || 'Unknown'}
                          </span>
                        </div>
                        {ev.postedBy?.id && (
                          <button
                            type="button"
                            onClick={() => openDM(ev.postedBy.id)}
                            className="inline-flex items-center rounded-full border border-purple-400 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-200 hover:bg-purple-500/20"
                          >
                            Message host
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* COLLAB MAP DRAWER – mirrors Collaboration feed card */}
            {drawerOpen && drawerKind === 'COLLAB' && drawerLoc && (
              <div className="rounded-xl border border-emerald-500/70 bg-neutral-950/95 p-4 shadow-xl">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                      Collaboration details
                    </p>
                    <h2 className="text-lg font-semibold text-white">
                      {drawerLoc.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerOpen(false);
                      setDrawerKind(null);
                    }}
                    className="rounded-full bg-black/60 px-2 py-1 text-xs text-neutral-300 hover:bg-black/80"
                  >
                    ✕
                  </button>
                </div>

                {(() => {
                  const c = collabs.find(
                    (item) => item.locationId === drawerLoc.id,
                  );
                  if (!c) return null;

                  const primaryLink =
                    Array.isArray((c as any).socialLinks) &&
                    (c as any).socialLinks.length > 0
                      ? (c as any).socialLinks[0].url
                      : undefined;

                  return (
                    <div className="space-y-4 text-sm">
                      <div className="flex flex-col gap-3 md:flex-row">
                        {/* IMAGE THUMB */}
                        {c.imageUrl && (
                          <div className="h-24 w-32 shrink-0 overflow-hidden rounded-md bg-neutral-900 md:h-28 md:w-40">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={c.imageUrl}
                              alt={c.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}

                        <div className="flex-1">
                          {c.dateISO && (
                            <div className="mb-1 text-xs text-neutral-400">
                              {formatShortDate(c.dateISO)}
                            </div>
                          )}

                          {c.description && (
                            <p className="whitespace-pre-line text-neutral-200">
                              {c.description}
                            </p>
                          )}

                          {/* Single LINK pill – same style concept as feed */}
                          {primaryLink && (
                            <div className="mt-3">
                              <button
                                type="button"
                                onClick={() =>
                                  window.open(primaryLink, '_blank')
                                }
                                className="inline-flex items-center gap-1 rounded-full border border-emerald-400 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-100 hover:bg-emerald-500/20"
                              >
                                Link
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* MESSAGE HOST CTA */}
                      <div className="mt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => openDM(c.postedBy.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-emerald-400 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-100 hover:bg-emerald-500/20"
                        >
                          <Mail size={14} className="shrink-0" />
                          <span>Message host</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* USER PROFILE VIEW / EDIT DRAWER */}
            <UserDrawer
              open={userDrawerOpen}
              user={drawerUser}
              currentUserId={currentUser.id}
              currentUserRole={currentUser.role}
              onToggleAdminRole={onToggleAdminRole}
              onFollow={(uid) => toggleFollowUser(uid)}
              onMessage={(uid) => openDM(uid)}
              onBlock={(uid) => alert(`Block ${uid}`)}
              onReport={(uid) => alert(`Report ${uid}`)}
              onSave={(updated) => {
                onSaveUserProfile(updated);
                setDrawerUser(updated);
              }}
              isFollowing={
                drawerUser ? followedUsers.includes(drawerUser.id) : false
              }
              onClose={() => setUserDrawerOpen(false)}
              variant="center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}






