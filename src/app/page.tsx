'use client';

import React from 'react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import LiveMap, { LocationData, LiveMapHandle } from '@/components/LiveMap';
import LocationDrawer from '@/components/LocationDrawer';
import UserDrawer, { UserMini } from '@/components/UserDrawer';
import MapActions from '@/components/MapActions';
import FilterBar from '@/components/FilterBar';

/* ------------------------------ Small UI bits ------------------------------ */
function StarBadge({ value, onClick }: { value: number; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border border-yellow-600/60 bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-200 hover:bg-yellow-500/20"
      title="Give a star"
    >
      ★ <span className="min-w-[1.2rem] text-center">{value}</span>
    </button>
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

function Modal({
  open,
  onClose,
  children,
  maxW = 'max-w-xl',
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxW?: string;
}) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/60" onClick={onClose} />
      <div className={`fixed left-1/2 top-1/2 z-[91] -translate-x-1/2 -translate-y-1/2 w-[92vw] ${maxW} rounded-xl border border-neutral-800 bg-neutral-950 p-4`}>
        {children}
      </div>
    </>
  );
}

function SectionDisclaimer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-lg border border-yellow-700/40 bg-yellow-900/10 px-3 py-2 text-sm text-yellow-200">
      {children}
    </div>
  );
}

/* --------------------------------- Types ---------------------------------- */
type DemoPost = {
  id: string;
  type: 'Post • Haunting' | 'Post • UFO' | 'Post • Cryptid' | 'Friend • Post';
  title: string;
  desc: string;
  locationId?: string;
  imageUrl?: string;
  linkUrl?: string;
  authorId: string;
  authorName: string;
  tagUserIds?: string[];
  createdAt: number;
};

type MarketplaceItem = {
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
};

type EventItem = {
  id: string;
  title: string;
  description?: string;
  locationText?: string;
  startISO: string;
  endISO?: string;
  priceText?: string;
  link?: string;
  imageUrl?: string;
  createdAt: number;
  postedBy: { id: string; name: string };
};

type CollabItem = {
  id: string;
  title: string;
  description?: string;
  dateISO?: string;
  locationText?: string;
  priceText?: string;
  contact?: string;
  imageUrl?: string;
  createdAt: number;
  postedBy: { id: string; name: string };
};

/* ------------------------------ Helper hooks ------------------------------ */
function useImagePreview() {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [name, setName] = useState<string | undefined>(undefined);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (url) URL.revokeObjectURL(url);
    if (!f) {
      setUrl(undefined);
      setName(undefined);
      return;
    }
    setUrl(URL.createObjectURL(f));
    setName(f.name);
  }
  function clear() {
    if (url) URL.revokeObjectURL(url);
    setUrl(undefined);
    setName(undefined);
  }
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);

  return { url, name, onChange, clear };
}

/* ================================ Page ==================================== */
export default function Page() {
  /* ----------------------- Current user (demo auth) ----------------------- */
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatarUrl?: string }>({
    id: 'u_current',
    name: 'You',
    avatarUrl: undefined,
  });

  /* Seed your own user in usersById so tagging etc. works */
  const [usersById, setUsersById] = useState<Record<string, UserMini>>({
    u_current: { id: 'u_current', name: 'You' },
  });

  /* ---------------------------- Nav / Filters ---------------------------- */
  const [tab, setTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef<LiveMapHandle>(null);

  /* ----------------------------- Drawers -------------------------------- */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoc, setDrawerLoc] = useState<LocationData | undefined>(undefined);

  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [drawerUser, setDrawerUser] = useState<UserMini | undefined>(undefined);

  /* ------------------------------- Stars -------------------------------- */
  const [userStars, setUserStars] = useState<Record<string, number>>({});
  const [locationStars, setLocationStars] = useState<Record<string, number>>({});
  const [postStars, setPostStars] = useState<Record<string, number>>({});
  const [eventStars, setEventStars] = useState<Record<string, number>>({});
  const [marketStars, setMarketStars] = useState<Record<string, number>>({});
  const [collabStars, setCollabStars] = useState<Record<string, number>>({});
  const inc = (setter: (f: (p: any) => any) => void, id: string) =>
    setter((prev: Record<string, number>) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));

  const giveUserStar = (userId: string) =>
    setUserStars((prev) => ({ ...prev, [userId]: (prev[userId] ?? 0) + 1 }));
  const giveLocationStar = (locId: string) => inc(setLocationStars as any, locId);
  const givePostStar = (id: string) => inc(setPostStars, id);
  const giveEventStar = (id: string) => inc(setEventStars, id);
  const giveMarketStar = (id: string) => inc(setMarketStars, id);
  const giveCollabStar = (id: string) => inc(setCollabStars, id);

  /* --------------------- Entities (local demo state) --------------------- */
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [posts, setPosts] = useState<DemoPost[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [market, setMarket] = useState<MarketplaceItem[]>([]);
  const [collabs, setCollabs] = useState<CollabItem[]>([]);
  const [marketFilter, setMarketFilter] = useState<'All' | 'Product' | 'Service'>('All');

  /* --------------------------- Comments (all) ---------------------------- */
  const [comments, setComments] = useState<Record<string, any[]>>({});
  function addComment(key: string, c: any) {
    setComments((prev) => ({ ...prev, [key]: [c, ...(prev[key] ?? [])] }));
  }
  function canEditComment(c: any) {
    return c.authorId === currentUser.id;
  }
  function deleteComment(key: string, id: string) {
    setComments((prev) => ({ ...prev, [key]: (prev[key] ?? []).filter((x: any) => x.id !== id) }));
  }

  /* --------------------- Comment modal (image + tags) -------------------- */
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentKey, setCommentKey] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentTags, setCommentTags] = useState<string[]>([]);
  const { url: cImg, name: cImgName, onChange: cImgChange, clear: cImgClear } = useImagePreview();
  function openComment(forKey: string) {
    setCommentKey(forKey);
    setCommentOpen(true);
  }
  function submitComment() {
    if (!commentKey) return;
    const c = {
      id: crypto.randomUUID(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      text: commentText.trim(),
      imageUrl: cImg,
      tagUserIds: commentTags,
      createdAt: Date.now(),
    };
    addComment(commentKey, c);
    setCommentOpen(false);
    setCommentText('');
    setCommentTags([]);
    cImgClear();
  }

  /* --------------------------- Following (demo) -------------------------- */
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [followedLocations, setFollowedLocations] = useState<string[]>([]);
  useEffect(() => {
    setFollowedUsers(JSON.parse(localStorage.getItem('ps_follow_users') || '[]'));
    setFollowedLocations(JSON.parse(localStorage.getItem('ps_follow_locs') || '[]'));
  }, []);
  useEffect(() => {
    localStorage.setItem('ps_follow_users', JSON.stringify(followedUsers));
  }, [followedUsers]);
  useEffect(() => {
    localStorage.setItem('ps_follow_locs', JSON.stringify(followedLocations));
  }, [followedLocations]);

  const toggleFollowUser = (userId: string) =>
    setFollowedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  const toggleFollowLocation = (locId: string) =>
    setFollowedLocations((prev) => (prev.includes(locId) ? prev.filter((id) => id !== locId) : [...prev, locId]));

  /* --------------------------- Tab / filtering --------------------------- */
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  function handleSelectTab(next: string) {
    if (next === 'profile') {
      openUser(currentUser.id);
      setProfileModalOpen(true); // open editor when user taps Profile
      return;
    }
    setTab(next);
    setSelectedUserId(null);
    setSelectedLocationId(null);
  }

  function allowedTypesForTab(t: string): Array<LocationData['type']> | null {
    if (t === 'hauntings') return ['HAUNTING'];
    if (t === 'ufos') return ['UFO'];
    if (t === 'cryptids') return ['CRYPTID'];
    if (t === 'events') return ['EVENT'];
    return null;
  }
  const allowed = allowedTypesForTab(tab);
  const matchesQuery = (s?: string) => !searchQuery || (s ?? '').toLowerCase().includes(searchQuery.toLowerCase());
  const filteredLocations = useMemo(() => {
    const byTab = allowed ? locations.filter((l) => allowed.includes(l.type)) : locations;
    return byTab.filter((l) => matchesQuery(l.title) || matchesQuery(l.summary));
  }, [allowed, locations, searchQuery]);

  /* ------------------------------ Openers ------------------------------- */
  function openFromPin(loc: LocationData) {
    setDrawerLoc(loc);
    setDrawerOpen(true);
    setSelectedLocationId(loc.id);
    setSelectedUserId(null);
  }
  function openUser(userId: string) {
    const u = usersById[userId] ?? { id: userId, name: 'User' };
    setDrawerUser(u);
    setUserDrawerOpen(true);
    setSelectedUserId(userId);
    setSelectedLocationId(null);
    setTab('home');
  }

  /* ------------------------------ Add POST ------------------------------- */
  const { url: postImg, name: postImgName, onChange: postImgChange, clear: postImgClear } = useImagePreview();
  const [postFormOpen, setPostFormOpen] = useState(false);
  const [postTagUsers, setPostTagUsers] = useState<string[]>([]);
  const [selectedLocId, setSelectedLocId] = useState<string>('');
  const [locQuery, setLocQuery] = useState('');

  const locationOptions = useMemo(() => {
    const base = allowed ? locations.filter((l) => allowed!.includes(l.type)) : locations;
    const q = locQuery.trim().toLowerCase();
    return q ? base.filter((l) => l.title.toLowerCase().includes(q)).slice(0, 20) : base.slice(0, 12);
  }, [allowed, locations, locQuery]);

  function toggle(arr: string[], id: string, setter: (v: string[]) => void) {
    setter(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  }

  function handleAddPost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedLocId) return;

    const fd = new FormData(e.currentTarget);
    const title = String(fd.get('title') || '').trim();
    const desc = String(fd.get('desc') || '').trim();
    const link = String(fd.get('link') || '').trim() || undefined;

    const loc = locations.find((l) => l.id === selectedLocId);
    const typeFromLoc =
      loc?.type === 'UFO'
        ? 'Post • UFO'
        : loc?.type === 'CRYPTID'
        ? 'Post • Cryptid'
        : loc?.type === 'EVENT'
        ? 'Friend • Post'
        : 'Post • Haunting';

    const p: DemoPost = {
      id: crypto.randomUUID(),
      type: typeFromLoc,
      title,
      desc,
      locationId: selectedLocId,
      imageUrl: postImg,
      linkUrl: link,
      authorId: currentUser.id,
      authorName: currentUser.name,
      tagUserIds: postTagUsers,
      createdAt: Date.now(),
    };
    setPosts((prev) => [p, ...prev]);
    // reset
    postImgClear();
    setPostTagUsers([]);
    setSelectedLocId('');
    setLocQuery('');
    setPostFormOpen(false);
  }

  function canEditPost(p: DemoPost) {
    return p.authorId === currentUser.id;
  }
  function editPost(id: string, patch: Partial<DemoPost>) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }
  function deletePost(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setComments((prev) => {
      const c = { ...prev };
      delete c[`post:${id}`];
      return c;
    });
  }

  /* --------------------------- Add LOCATION ------------------------------ */
  const [locFormOpen, setLocFormOpen] = useState(false);
  const [newLoc, setNewLoc] = useState<{ lng: number; lat: number } | null>(null);
  const { url: locImg, name: locImgName, onChange: locImgChange, clear: locImgClear } = useImagePreview();

  function openAddLocation() {
    const center = mapRef.current?.getCenter();
    setNewLoc(center ? { lng: center[0], lat: center[1] } : { lng: -2.5, lat: 54.3 });
    setLocFormOpen(true);
  }

  function handleAddLocation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const type = String(fd.get('type')) as LocationData['type'];
    const l: LocationData = {
      id: crypto.randomUUID(),
      title: String(fd.get('title') || '').trim(),
      type,
      lat: Number(fd.get('lat') || newLoc?.lat || 54.3),
      lng: Number(fd.get('lng') || newLoc?.lng || -2.5),
      summary: String(fd.get('summary') || '').trim() || undefined,
      address: String(fd.get('address') || '').trim() || undefined,
      priceInfo: String(fd.get('priceInfo') || '').trim() || undefined,
      website: String(fd.get('website') || '').trim() || undefined,
      imageUrl: locImg,
    };
    setLocations((prev) => [l, ...prev]);
    setLocFormOpen(false);
    locImgClear();
  }

  /* ------------------ Events / Marketplace / Collab forms ----------------- */
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const { url: evImg, name: evImgName, onChange: evImgChange, clear: evImgClear } = useImagePreview();
  function handleAddEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setEvents((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: String(fd.get('title') || '').trim(),
        description: String(fd.get('desc') || '').trim() || undefined,
        locationText: String(fd.get('where') || '').trim() || undefined,
        startISO: String(fd.get('start') || ''),
        endISO: String(fd.get('end') || '') || undefined,
        priceText: String(fd.get('price') || '').trim() || undefined,
        link: String(fd.get('link') || '').trim() || undefined,
        imageUrl: evImg,
        createdAt: Date.now(),
        postedBy: { id: currentUser.id, name: currentUser.name },
      },
    ]);
    setEventFormOpen(false);
    evImgClear();
  }

  const [listingFormOpen, setListingFormOpen] = useState(false);
  const { url: mkImg, name: mkImgName, onChange: mkImgChange, clear: mkImgClear } = useImagePreview();
  function handleAddListing(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setMarket((prev) => [
      {
        id: crypto.randomUUID(),
        kind: (String(fd.get('kind')) as 'Product' | 'Service') || 'Product',
        title: String(fd.get('title') || '').trim(),
        description: String(fd.get('desc') || '').trim(),
        price: Number(String(fd.get('price') || '').trim()) || undefined,
        locationText: String(fd.get('where') || '').trim() || undefined,
        imageUrl: mkImg,
        contactOrLink: String(fd.get('contact') || '').trim() || undefined,
        createdAt: Date.now(),
        postedBy: { id: currentUser.id, name: currentUser.name },
      },
      ...prev,
    ]);
    setListingFormOpen(false);
    mkImgClear();
  }

  const [collabFormOpen, setCollabFormOpen] = useState(false);
  const { url: cbImg, name: cbImgName, onChange: cbImgChange, clear: cbImgClear } = useImagePreview();
  function handleAddCollab(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setCollabs((prev) => [
      {
        id: crypto.randomUUID(),
        title: String(fd.get('title') || '').trim(),
        description: String(fd.get('desc') || '').trim() || undefined,
        dateISO: String(fd.get('date') || '') || undefined,
        locationText: String(fd.get('where') || '').trim() || undefined,
        priceText: String(fd.get('price') || '').trim() || undefined,
        contact: String(fd.get('contact') || '').trim() || undefined,
        imageUrl: cbImg,
        createdAt: Date.now(),
        postedBy: { id: currentUser.id, name: currentUser.name },
      },
      ...prev,
    ]);
    setCollabFormOpen(false);
    cbImgClear();
  }

  /* --------------------------- Profile picture ---------------------------- */
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { url: avatarPreview, name: avatarName, onChange: avatarChange, clear: avatarClear } = useImagePreview();
  function saveAvatar() {
    if (!avatarPreview) {
      setProfileModalOpen(false);
      return;
    }
    setCurrentUser((u) => ({ ...u, avatarUrl: avatarPreview }));
    setUsersById((prev) => ({ ...prev, [currentUser.id]: { id: currentUser.id, name: currentUser.name, avatarUrl: avatarPreview } as any }));
    setProfileModalOpen(false);
    // don’t revoke object URL so it keeps rendering; would be replaced later by uploaded path
  }

  /* ---------------------------- RENDER START ------------------------------ */
  return (
    <main className="flex min-h-screen flex-col bg-[#0B0C0E] text-white">
      {/* HEADER: logo + FilterBar in the same row */}
      <header className="sticky top-0 z-40 border-b border-neutral-800/60 bg-[#0B0C0E]/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-2">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="h-10 w-10 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-cyan.png" alt="ParaSphere Logo" className="h-10 w-10 object-contain" />
            </div>

            {/* FilterBar spans remaining width */}
            <div className="min-w-0 flex-1">
              <FilterBar
                query={searchQuery}
                setQuery={setSearchQuery}
                activeTab={tab}
                onTabChange={handleSelectTab}
              />
            </div>
          </div>
        </div>
      </header>

      {/* MAP AREA (drawers centered inside) */}
      <section className="relative mx-auto w-full max-w-6xl px-4 pb-3 pt-3">
        <div className="relative">
          <LiveMap
            ref={mapRef}
            initialCenter={[-2.5, 54.3]}
            overviewZoom={5.8}
            heightVh={{ desktop: 38, mobile: 32 }}
            locations={filteredLocations}
            onOpen={openFromPin}
          />

          <MapActions onAddLocation={openAddLocation} />

          {/* Drawer overlay centered INSIDE the map area */}
          <div className="pointer-events-none absolute inset-0 z-50 flex items-start justify-center p-3 md:p-4">
            <div className="pointer-events-auto w-full max-w-xl">
              <LocationDrawer
                variant="center"
                open={drawerOpen}
                location={drawerLoc}
                onGiveLocationStar={giveLocationStar}
                onClickLocationTitle={() => drawerLoc && setSelectedLocationId(drawerLoc.id)}
                onFollowLocation={(locId) => toggleFollowLocation(locId)}
                isFollowed={drawerLoc ? followedLocations.includes(drawerLoc.id) : false}
                onClose={() => setDrawerOpen(false)}
              />

              <UserDrawer
                open={userDrawerOpen}
                user={drawerUser}
                stars={drawerUser ? userStars[drawerUser.id] ?? 0 : 0}
                onGiveStar={(uid) => giveUserStar(uid)}
                onFollow={(uid) => toggleFollowUser(uid)}
                onMessage={(uid) => alert(`(message) ${uid}`)}
                onBlock={(uid) => alert(`(block) ${uid}`)}
                onReport={(uid) => alert(`(report) ${uid}`)}
                onEditProfile={() => setProfileModalOpen(true)}
                onClose={() => setUserDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEEDS */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-6">
          {/* PAGE TITLE */}
          <div className="mb-4">
            <h1 className="text-2xl font-semibold">
              {selectedLocationId
                ? locations.find((l) => l.id === selectedLocationId)?.title ?? 'Location'
                : selectedUserId
                ? `${usersById[selectedUserId]?.name ?? 'User'} — posts`
                : tab === 'home'
                ? 'HOME'
                : tab === 'hauntings'
                ? 'Hauntings — newest first'
                : tab === 'ufos'
                ? 'UFOs — newest first'
                : tab === 'cryptids'
                ? 'Cryptids — newest first'
                : tab === 'events'
                ? 'Events — upcoming first'
                : tab === 'marketplace'
                ? 'Marketplace — newest first'
                : tab === 'collaboration'
                ? 'Collaboration — latest'
                : 'Feed'}
            </h1>

            {!selectedLocationId && !selectedUserId && tab === 'home' && (
              <div className="mt-1 text-sm text-yellow-200">
                Now showing posts from your followed locations and friends.
              </div>
            )}

            {/* Follow filters on HOME */}
            {tab === 'home' && (
              <div className="mt-3 grid gap-3">
                <div>
                  <div className="mb-1 text-xs text-neutral-400">Followed users</div>
                  <div className="flex flex-wrap gap-2">
                    {followedUsers.length === 0 && (
                      <span className="text-xs text-neutral-500">You’re not following any users yet.</span>
                    )}
                    {followedUsers.map((uid) => (
                      <Chip
                        key={uid}
                        active={selectedUserId === uid}
                        onClick={() => {
                          setSelectedUserId(uid === selectedUserId ? null : uid);
                          setSelectedLocationId(null);
                        }}
                      >
                        {usersById[uid]?.name ?? uid}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-neutral-400">Followed locations</div>
                  <div className="flex flex-wrap gap-2">
                    {followedLocations.length === 0 && (
                      <span className="text-xs text-neutral-500">You’re not following any locations yet.</span>
                    )}
                    {followedLocations.map((lid) => (
                      <Chip
                        key={lid}
                        active={selectedLocationId === lid}
                        onClick={() => {
                          setSelectedLocationId(lid === selectedLocationId ? null : lid);
                          setSelectedUserId(null);
                        }}
                      >
                        {locations.find((l) => l.id === lid)?.title ?? lid}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Add Post button on feed tabs */}
            {['home', 'hauntings', 'ufos', 'cryptids'].includes(tab) && (
              <div className="mt-3">
                <button
                  onClick={() => setPostFormOpen(true)}
                  className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300 hover:bg-cyan-500/20"
                >
                  + Add Post
                </button>
              </div>
            )}
          </div>

          {/* POSTS */}
          {['home', 'hauntings', 'ufos', 'cryptids'].includes(tab) && (
            <div className="grid gap-4">
              {posts
                .filter(
                  (p) =>
                    (!selectedUserId || p.authorId === selectedUserId) &&
                    (!selectedLocationId || p.locationId === selectedLocationId) &&
                    (!searchQuery ||
                      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      p.desc.toLowerCase().includes(searchQuery.toLowerCase())),
                )
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((p) => {
                  const cKey = `post:${p.id}`;
                  return (
                    <article key={p.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-neutral-400">
                          {p.type} • by{' '}
                          <button className="text-cyan-300 hover:underline" onClick={() => openUser(p.authorId)}>
                            {usersById[p.authorId]?.name ?? p.authorName}
                          </button>
                        </div>
                        <StarBadge value={postStars[p.id] ?? 0} onClick={() => givePostStar(p.id)} />
                      </div>

                      {/* Author controls */}
                      {canEditPost(p) && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <button
                            className="rounded-md border border-neutral-700 px-2 py-1 hover:bg-neutral-900"
                            onClick={() => {
                              const title = prompt('Edit title', p.title) ?? p.title;
                              const desc = prompt('Edit description', p.desc) ?? p.desc;
                              editPost(p.id, { title, desc });
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="rounded-md border border-red-500/70 px-2 py-1 text-red-300 hover:bg-red-500/10"
                            onClick={() => {
                              if (confirm('Delete this post?')) deletePost(p.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}

                      <h3 className="mt-1 text-lg font-semibold">{p.title}</h3>
                      <p className="text-sm text-neutral-300">{p.desc}</p>

                      {p.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt="" className="mt-2 rounded-md border border-neutral-800" />
                      )}
                      {p.linkUrl && (
                        <a className="mt-2 inline-block text-cyan-300 hover:underline" href={p.linkUrl} target="_blank" rel="noreferrer">
                          View link
                        </a>
                      )}
                      {p.locationId && (
                        <div className="mt-2 text-xs text-neutral-400">
                          Location:&nbsp;
                          <button
                            className="text-cyan-300 hover:underline"
                            onClick={() => {
                              setSelectedLocationId(p.locationId!);
                              setSelectedUserId(null);
                              setTab('home');
                            }}
                          >
                            {locations.find((l) => l.id === p.locationId)?.title ?? p.locationId}
                          </button>
                        </div>
                      )}

                      {/* Comments */}
                      <div className="mt-3 flex items-center gap-3">
                        <button className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-900" onClick={() => openComment(cKey)}>
                          Comment
                        </button>
                        <div className="text-xs text-neutral-500">{(comments[cKey]?.length ?? 0)} comments</div>
                      </div>

                      {comments[cKey]?.length ? (
                        <div className="mt-2 grid gap-2">
                          {comments[cKey].map((c) => (
                            <div key={c.id} className="rounded-md border border-neutral-800 bg-neutral-950 p-2">
                              <div className="flex items-center justify-between text-xs text-neutral-400">
                                <div>
                                  by <span className="text-cyan-300">{c.authorName}</span> • {new Date(c.createdAt).toLocaleString()}
                                </div>
                                {canEditComment(c) && (
                                  <button
                                    className="rounded border border-neutral-700 px-2 py-0.5 hover:bg-neutral-900"
                                    onClick={() => deleteComment(cKey, c.id)}
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                              <div className="mt-1 text-sm text-neutral-200">{c.text}</div>
                              {c.imageUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={c.imageUrl} alt="" className="mt-2 max-h-60 w-auto rounded-md border border-neutral-800" />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              {posts.length === 0 && (
                <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">No posts yet.</div>
              )}
            </div>
          )}

          {/* EVENTS */}
          {tab === 'events' && (
            <>
              <SectionDisclaimer>
                Parasphere does not organise, endorse, or guarantee any events listed here. Users should verify details, reputation, and any warranties independently.
              </SectionDisclaimer>

              <div className="mb-3">
                <button
                  onClick={() => setEventFormOpen(true)}
                  className="rounded-md border border-purple-400 bg-purple-500/10 px-3 py-1.5 text-sm text-purple-200 hover:bg-purple-500/20"
                >
                  + Add Event
                </button>
              </div>

              <div className="grid gap-4">
                {events
                  .sort((a, b) => a.startISO.localeCompare(b.startISO))
                  .map((ev) => {
                    const cKey = `event:${ev.id}`;
                    return (
                      <article key={ev.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-neutral-400">by {ev.postedBy.name}</div>
                          <StarBadge value={eventStars[ev.id] ?? 0} onClick={() => giveEventStar(ev.id)} />
                        </div>
                        <h3 className="text-lg font-semibold">{ev.title}</h3>
                        {ev.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={ev.imageUrl} alt="" className="mt-2 rounded-md border border-neutral-800" />
                        )}
                        {ev.description && <p className="mt-1 text-sm text-neutral-300">{ev.description}</p>}
                        <div className="mt-2 text-xs text-neutral-400">
                          🗓 {new Date(ev.startISO).toLocaleString()} {ev.endISO ? `— ${new Date(ev.endISO).toLocaleString()}` : ''}
                        </div>
                        {ev.locationText && <div className="text-xs text-neutral-400">📍 {ev.locationText}</div>}
                        {ev.priceText && <div className="text-xs text-neutral-400">💷 {ev.priceText}</div>}
                        {ev.link && (
                          <a className="mt-2 inline-block text-purple-200 hover:underline" href={ev.link} target="_blank" rel="noreferrer">
                            Tickets / Info
                          </a>
                        )}

                        <div className="mt-3 flex items-center gap-3">
                          <button className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-900" onClick={() => openComment(cKey)}>
                            Comment
                          </button>
                          <div className="text-xs text-neutral-500">{(comments[cKey]?.length ?? 0)} comments</div>
                        </div>
                      </article>
                    );
                  })}
                {events.length === 0 && (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">No events yet.</div>
                )}
              </div>
            </>
          )}

          {/* MARKETPLACE */}
          {tab === 'marketplace' && (
            <>
              <SectionDisclaimer>
                Marketplace listings are user-posted advertisements. Parasphere isn’t a party to any transaction and accepts no liability. Do your own checks, warranties, and payments externally.
              </SectionDisclaimer>

              <div className="mb-3 flex items-center gap-2">
                <Chip active={marketFilter === 'All'} onClick={() => setMarketFilter('All')}>
                  All
                </Chip>
                <Chip active={marketFilter === 'Product'} onClick={() => setMarketFilter('Product')}>
                  Products
                  </Chip>
                                  <Chip active={marketFilter === 'Service'} onClick={() => setMarketFilter('Service')}>
                  Services
                </Chip>
                <div className="grow" />
                <button
                  onClick={() => setListingFormOpen(true)}
                  className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300 hover:bg-cyan-500/20"
                >
                  + Add Listing
                </button>
              </div>

              <div className="grid gap-4">
                {market
                  .filter((m) => (marketFilter === 'All' ? true : m.kind === marketFilter))
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((m) => {
                    const cKey = `market:${m.id}`;
                    return (
                      <article key={m.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-neutral-400">
                            {m.kind} • by {m.postedBy.name}
                          </div>
                          <StarBadge value={marketStars[m.id] ?? 0} onClick={() => giveMarketStar(m.id)} />
                        </div>
                        <h3 className="text-lg font-semibold">{m.title}</h3>
                        {m.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.imageUrl} className="mt-2 rounded-md border border-neutral-800" alt="" />
                        )}
                        <p className="mt-1 text-sm text-neutral-300">{m.description}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-400">
                          {m.price && <span>£{m.price}</span>}
                          {m.locationText && <span>📍 {m.locationText}</span>}
                          {m.contactOrLink && (
                            <a className="text-cyan-300 hover:underline" href={m.contactOrLink} target="_blank" rel="noreferrer">
                              Contact / Link
                            </a>
                          )}
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                          <button className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-900" onClick={() => openComment(cKey)}>
                            Comment
                          </button>
                          <div className="text-xs text-neutral-500">{(comments[cKey]?.length ?? 0)} comments</div>
                        </div>
                      </article>
                    );
                  })}
                {market.length === 0 && (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">No listings yet.</div>
                )}
              </div>
            </>
          )}

          {/* COLLABORATION */}
          {tab === 'collaboration' && (
            <>
              <SectionDisclaimer>
                Collaboration posts are user-organised. Parasphere doesn’t mediate or guarantee any arrangement—please verify reputation, safety, and terms independently.
              </SectionDisclaimer>

              <div className="mb-3">
                <button
                  onClick={() => setCollabFormOpen(true)}
                  className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300 hover:bg-cyan-500/20"
                >
                  + Add Collaboration
                </button>
              </div>

              <div className="grid gap-4">
                {collabs
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((c) => {
                    const cKey = `collab:${c.id}`;
                    return (
                      <article key={c.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">{c.title}</h3>
                          <StarBadge value={collabStars[c.id] ?? 0} onClick={() => giveCollabStar(c.id)} />
                        </div>
                        {c.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.imageUrl} alt="" className="mt-2 rounded-md border border-neutral-800" />
                        )}
                        {c.description && <p className="text-sm text-neutral-300">{c.description}</p>}
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-400">
                          {c.dateISO && <span>🗓 {new Date(c.dateISO).toLocaleString()}</span>}
                          {c.locationText && <span>📍 {c.locationText}</span>}
                          {c.priceText && <span>£{c.priceText}</span>}
                          {c.contact && (
                            <a className="text-cyan-300 hover:underline" href={c.contact} target="_blank" rel="noreferrer">
                              Contact / Link
                            </a>
                          )}
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                          <button className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-900" onClick={() => openComment(cKey)}>
                            Comment
                          </button>
                          <div className="text-xs text-neutral-500">{(comments[cKey]?.length ?? 0)} comments</div>
                        </div>
                      </article>
                    );
                  })}
                {collabs.length === 0 && (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">No collaboration posts yet.</div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ------------------------------- MODALS ------------------------------- */}

      {/* Add Post (required location via type-ahead) */}
      <Modal open={postFormOpen} onClose={() => setPostFormOpen(false)}>
        <form onSubmit={handleAddPost} className="space-y-3">
          <h3 className="text-lg font-semibold">Add Post</h3>

          <input
            name="title"
            placeholder="Title"
            required
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />

          {/* Location (required) */}
          <div>
            <div className="mb-1 text-sm text-neutral-300">Location (required)</div>
            <input
              value={locQuery}
              onChange={(e) => {
                setLocQuery(e.target.value);
                setSelectedLocId('');
              }}
              placeholder="Start typing a location…"
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
            />
            {!!locQuery && (
              <div className="mt-2 max-h-44 overflow-auto rounded-md border border-neutral-800 bg-neutral-950">
                {locationOptions.length === 0 && (
                  <div className="px-3 py-2 text-sm text-neutral-500">No matches.</div>
                )}
                {locationOptions.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      setSelectedLocId(l.id);
                      setLocQuery(l.title);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-neutral-900 ${
                      selectedLocId === l.id ? 'bg-neutral-900' : ''
                    }`}
                  >
                    <span>{l.title}</span>
                    {selectedLocId === l.id && <span className="text-cyan-300">Selected</span>}
                  </button>
                ))}
              </div>
            )}
            <input type="hidden" name="locationId" value={selectedLocId} />
            {!selectedLocId && (
              <div className="mt-1 text-xs text-red-300">Pick a location from the list before posting.</div>
            )}
          </div>

          <textarea
            name="desc"
            placeholder="What happened? Evidence? Notes…"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />

          {/* Tag friends */}
          <div>
            <div className="mb-1 text-sm text-neutral-300">Tag friends</div>
            <div className="flex flex-wrap gap-2">
              {Object.values(usersById).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => toggle(postTagUsers, u.id, setPostTagUsers)}
                  className={`rounded-full border px-3 py-1 text-sm ${
                    postTagUsers.includes(u.id)
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                      : 'border-neutral-700 text-neutral-300'
                  }`}
                >
                  {u.name}
                </button>
              ))}
              {Object.values(usersById).length === 0 && (
                <span className="text-xs text-neutral-600">No users yet.</span>
              )}
            </div>
          </div>

          {/* Photo */}
          <div>
            <div className="mb-1 text-sm text-neutral-300">Photo (optional)</div>
            <input
              type="file"
              accept="image/*"
              onChange={postImgChange}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
            />
            {postImg && (
              <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-950 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={postImg} alt="preview" className="max-h-64 w-auto rounded-md border border-neutral-800" />
                <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                  <span className="truncate">{postImgName}</span>
                  <button type="button" onClick={postImgClear} className="text-neutral-300 hover:underline">
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Link */}
          <input
            name="link"
            placeholder="Link (FB, YouTube, TikTok)"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPostFormOpen(false)}
              className="rounded-md border border-neutral-700 px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedLocId}
              className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
            >
              Post
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Location */}
      <Modal open={locFormOpen} onClose={() => setLocFormOpen(false)}>
        <form onSubmit={handleAddLocation} className="space-y-3">
          <h3 className="text-lg font-semibold">Add Location</h3>
          <input name="title" placeholder="Location title" required className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <select name="type" className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2">
            <option value="HAUNTING">Haunting</option>
            <option value="UFO">UFO</option>
            <option value="CRYPTID">Cryptid</option>
            <option value="EVENT">Event</option>
          </select>
          <textarea name="summary" placeholder="Short summary (optional)" className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <input name="address" placeholder="Address (optional)" className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <input name="priceInfo" placeholder="Prices (optional)" className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <input name="website" placeholder="Website (optional)" className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />

          <div>
            <div className="mb-1 text-sm text-neutral-300">Main photo (optional)</div>
            <input type="file" accept="image/*" onChange={locImgChange} className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
            {locImg && (
              <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-950 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={locImg} alt="preview" className="max-h-64 w-auto rounded-md border border-neutral-800" />
                <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                  <span className="truncate">{locImgName}</span>
                  <button type="button" onClick={locImgClear} className="text-neutral-300 hover:underline">Remove</button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input name="lng" defaultValue={newLoc?.lng ?? -2.5} placeholder="Lng" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
            <input name="lat" defaultValue={newLoc?.lat ?? 54.3} placeholder="Lat" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setLocFormOpen(false)} className="rounded-md border border-neutral-700 px-3 py-1.5">Cancel</button>
            <button type="submit" className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-cyan-300 hover:bg-cyan-500/20">Save</button>
          </div>
        </form>
      </Modal>

      {/* Add Event */}
      <Modal open={eventFormOpen} onClose={() => setEventFormOpen(false)}>
        <form onSubmit={handleAddEvent} className="space-y-3">
          <h3 className="text-lg font-semibold">Add Event</h3>
          <input name="title" placeholder="Title" required className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <textarea name="desc" placeholder="Description (optional)" className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <input name="where" placeholder="Location (text)" className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="mb-1 text-xs text-neutral-400">From</div>
              <input type="datetime-local" name="start" required className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
            </div>
            <div>
              <div className="mb-1 text-xs text-neutral-400">To</div>
              <input type="datetime-local" name="end" className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
            </div>
          </div>

          <div>
            <div className="mb-1 text-sm text-neutral-300">Event photo (optional)</div>
            <input type="file" accept="image/*" onChange={evImgChange} className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
            {evImg && (
              <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-950 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={evImg} alt="" className="mt-2 rounded-md border border-neutral-800" />
                <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                  <span className="truncate">{evImgName}</span>
                  <button type="button" onClick={evImgClear} className="text-neutral-300 hover:underline">Remove</button>
                </div>
              </div>
            )}
          </div>

          <input name="price" placeholder="Price (optional)" className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <input name="link" placeholder="Ticket / Info link (optional)" className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setEventFormOpen(false)} className="rounded-md border border-neutral-700 px-3 py-1.5">Cancel</button>
            <button type="submit" className="rounded-md border border-purple-400 bg-purple-500/10 px-3 py-1.5 text-purple-200 hover:bg-purple-500/20">Save</button>
          </div>
        </form>
      </Modal>

      {/* Add Listing */}
      <Modal open={listingFormOpen} onClose={() => setListingFormOpen(false)}>
        <form onSubmit={handleAddListing} className="space-y-3">
          <h3 className="text-lg font-semibold">Add Listing</h3>
          <select name="kind" className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2">
            <option>Product</option>
            <option>Service</option>
          </select>
          <input name="title" placeholder="Title" required className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <textarea name="desc" placeholder="Description" required className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <div className="grid grid-cols-2 gap-2">
            <input name="price" placeholder="Price (optional)" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
            <input name="where" placeholder="Location (optional)" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          </div>

          <div>
            <div className="mb-1 text-sm text-neutral-300">Photos (optional)</div>
            <input type="file" accept="image/*" onChange={mkImgChange} className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
            {mkImg && (
              <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-950 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mkImg} className="mt-2 rounded-md border border-neutral-800" alt="" />
                <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                  <span className="truncate">{mkImgName}</span>
                  <button type="button" onClick={mkImgClear} className="text-neutral-300 hover:underline">Remove</button>
                </div>
              </div>
            )}
          </div>

          <input name="contact" placeholder="Contact or link" required className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setListingFormOpen(false)} className="rounded-md border border-neutral-700 px-3 py-1.5">Cancel</button>
            <button type="submit" className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-cyan-300 hover:bg-cyan-500/20">Save</button>
          </div>
        </form>
      </Modal>

      {/* Add Collaboration */}
      <Modal open={collabFormOpen} onClose={() => setCollabFormOpen(false)}>
        <form onSubmit={handleAddCollab} className="space-y-3">
          <h3 className="text-lg font-semibold">Add Collaboration</h3>
          <input name="title" placeholder="Title" required className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <textarea name="desc" placeholder="Details (optional)" className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <input type="datetime-local" name="date" className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <input name="where" placeholder="Location (optional)" className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <input name="price" placeholder="Price (optional)" className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <input name="contact" placeholder="Contact or link" className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />

          <div>
            <div className="mb-1 text-sm text-neutral-300">Photo (optional)</div>
            <input type="file" accept="image/*" onChange={cbImgChange} className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
            {cbImg && (
              <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-950 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cbImg} alt="" className="mt-2 rounded-md border border-neutral-800" />
                <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                  <span className="truncate">{cbImgName}</span>
                  <button type="button" onClick={cbImgClear} className="text-neutral-300 hover:underline">Remove</button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setCollabFormOpen(false)} className="rounded-md border border-neutral-700 px-3 py-1.5">Cancel</button>
            <button type="submit" className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-cyan-300 hover:bg-cyan-500/20">Save</button>
          </div>
        </form>
      </Modal>

      {/* Comment dialog (universal) */}
      <Modal open={commentOpen} onClose={() => { setCommentOpen(false); setCommentText(''); setCommentTags([]); cImgClear(); }}>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Add Comment</h3>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write your comment…"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <div>
           {/* Attach photo (optional) */}
<div>
  <div className="mb-1 text-sm text-neutral-300">Attach photo (optional)</div>
  <input
    type="file"
    accept="image/*"
    onChange={cImgChange}
    className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
  />
  {cImg && (
    <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-950 p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cImg}
        alt="preview"
        className="max-h-56 w-auto rounded-md border border-neutral-800"
      />
      <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
        <span className="truncate">{cImgName}</span>
        <button
          type="button"
          onClick={cImgClear}
          className="text-neutral-300 hover:underline"
        >
          Remove
        </button>
      </div>
    </div>
  )}
  </div>
</div> 

          {/* Tag friends (optional) */}
          <div>
            <div className="text-sm text-neutral-300 mb-1">Tag friends (optional)</div>
            <div className="flex flex-wrap gap-2">
              {Object.values(usersById).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() =>
                    setCommentTags((prev) => (prev.includes(u.id) ? prev.filter((x) => x !== u.id) : [...prev, u.id]))
                  }
                  className={`rounded-full border px-3 py-1 text-sm ${
                    commentTags.includes(u.id)
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                      : 'border-neutral-700 text-neutral-300'
                  }`}
                >
                  {u.name}
                </button>
              ))}
              {Object.values(usersById).length === 0 && (
                <span className="text-xs text-neutral-600">No users yet.</span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setCommentOpen(false);
                setCommentText('');
                setCommentTags([]);
                cImgClear();
              }}
              className="rounded-md border border-neutral-700 px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              onClick={submitComment}
              disabled={!commentKey || (!commentText.trim() && !cImg)}
              className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
            >
              Post comment
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Profile / Avatar Modal */}
      <Modal open={profileModalOpen} onClose={() => setProfileModalOpen(false)}>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Edit Profile</h3>
          <div className="flex items-center gap-3">
            {/* Avatar preview */}
            <div className="h-16 w-16 rounded-full overflow-hidden border border-neutral-700">
              {avatarPreview || currentUser.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview || currentUser.avatarUrl}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-600">No photo</div>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={avatarChange}
              className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setProfileModalOpen(false)}
              className="rounded-md border border-neutral-700 px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              onClick={saveAvatar}
              disabled={!avatarPreview}
              className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
}




                 
