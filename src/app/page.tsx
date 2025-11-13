'use client';

import React, {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
  createContext,
  useContext,
} from 'react';
import ParaverseTopBar, { TabKey } from '@/components/ParaverseTopBar';
import ParaverseHeader from '@/components/ParaverseHeader';
import HomeFeed from '@/components/feed/HomeFeed';
import LiveMap, { LocationData, LiveMapHandle } from '@/components/LiveMap';
import LocationDrawer from '@/components/LocationDrawer';
import UserDrawer, { UserMini } from '@/components/UserDrawer';
import MapActions from '@/components/MapActions';
import EventsFeed, { EventsFeedEvent } from '@/components/EventsFeed';
import MarketplaceFeed from '@/components/MarketplaceFeed';

/* =========================== Country Scope Context =========================== */

type ScopeCtx = { country: string; setCountry: (c: string) => void };
const Scope = createContext<ScopeCtx | null>(null);

function ScopeProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(() => {
    if (typeof window === 'undefined') return 'GB';
    const url = new URL(window.location.href);
    const q = url.searchParams.get('country');
    const saved = localStorage.getItem('ps.country');
    const guess = (navigator.language || 'en-GB').split('-').pop() || 'GB';
    return (q || saved || guess).toUpperCase();
  }, []);
  const [country, setCountryState] = useState(initial);

  const setCountry = (c: string) => {
    const code = (c || 'GB').toUpperCase();
    setCountryState(code);
    try {
      localStorage.setItem('ps.country', code);
      const u = new URL(window.location.href);
      u.searchParams.set('country', code);
      history.replaceState({}, '', u.toString());
    } catch {}
  };

  useEffect(() => {
    try {
      localStorage.setItem('ps.country', country);
    } catch {}
  }, [country]);

  return <Scope.Provider value={{ country, setCountry }}>{children}</Scope.Provider>;
}

function useScope() {
  const v = useContext(Scope);
  if (!v) throw new Error('useScope used outside provider');
  return v;
}

/* ============================== Country helpers ============================== */

function useCountries() {
  const [countries, setCountries] = useState<
    Array<{ code: string; name: string; region?: string }>
  >([]);
  useEffect(() => {
    let ok = true;
    fetch('/countries.json')
      .then((r) => r.json())
      .then((list) => {
        if (ok) setCountries(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        setCountries([
          { code: 'EU', name: 'Europe (multi-country)', region: 'Region' },
          { code: 'US', name: 'United States', region: 'Americas' },
          { code: 'GB', name: 'United Kingdom', region: 'Europe' },
          { code: 'CA', name: 'Canada', region: 'Americas' },
          { code: 'AU', name: 'Australia', region: 'Oceania' },
        ]);
      });
    return () => {
      ok = false;
    };
  }, []);
  return countries;
}

function labelFor(code: string, all: Array<{ code: string; name: string }>) {
  const hit = all.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return hit ? `${hit.name} (${hit.code})` : code.toUpperCase();
}

function CountrySelect() {
  const { country, setCountry } = useScope();
  const countries = useCountries();

  const options = useMemo(() => {
    if (!countries.length) return [];
    const eu = countries.filter((c) => c.code.toUpperCase() === 'EU');
    const rest = countries
      .filter((c) => c.code.toUpperCase() !== 'EU')
      .sort((a, b) => a.name.localeCompare(b.name));
    return [...eu, ...rest];
  }, [countries]);

  function normalizeToCode(input: string) {
    const trimmed = (input || '').trim();
    if (!trimmed) return country;

    const exactCode = options.find(
      (o) => o.code.toUpperCase() === trimmed.toUpperCase(),
    );
    if (exactCode) return exactCode.code;

    const matchParen = trimmed.match(/\(([A-Za-z]{2,3})\)\s*$/);
    if (matchParen) {
      const c = matchParen[1].toUpperCase();
      if (options.some((o) => o.code.toUpperCase() === c)) return c;
    }

    const byName = options.find(
      (o) => o.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (byName) return byName.code;

    return country;
  }

  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setInputValue(labelFor(country, options));
  }, [country, options]);

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-zinc-800/60 px-2 py-1 text-xs">
      <span className="opacity-70">Show posts from</span>
      <input
        list="countries"
        className="bg-transparent text-neutral-100 outline-none placeholder-neutral-400"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={() => setCountry(normalizeToCode(inputValue))}
        placeholder="Type a country…"
      />
      <datalist id="countries">
        {options.map((o) => (
          <option key={o.code} value={`${o.name} (${o.code})`} />
        ))}
      </datalist>
    </div>
  );
}

const byCountry =
  <T extends { countryCode?: string }>(code: string) =>
  (x: T) =>
    (x.countryCode?.toUpperCase() || '') === code;

/* ================================= UI bits ================================= */

function TranslatePost({ text }: { text?: string }) {
  const [showTranslated, setShowTranslated] = useState(false);
  if (!text) return null;
  return (
    <div className="mt-1">
      <p className="text-sm text-neutral-300">{showTranslated ? text : text}</p>
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

function StarBadge({ value, onClick }: { value: number; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border border-yellow-600/60 bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-200 hover:bg-yellow-500/20"
      title="Give a star"
    >
      <span>★</span>{' '}
      <span className="min-w-[1.2rem] text-center">{value}</span>
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
      <div
        className={`fixed left-1/2 top-1/2 z-[91] w-[92vw] -translate-x-1/2 -translate-y-1/2 ${maxW} rounded-xl border border-neutral-800 bg-neutral-950 p-4`}
      >
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

/* ================================== Types ================================== */

type DemoPost = {
  id: string;
  type: 'Post';
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
  countryCode?: string;
  postalCode?: string;
};

type EventItem = EventsFeedEvent;


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
  countryCode?: string;
  postalCode?: string;
};

/* =============================== Image preview ============================== */

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
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );

  return { url, name, onChange, clear };
}

/* ================================ Page Inner ================================ */

export default function Page() {
  return (
    <ScopeProvider>
      <PageInner />
    </ScopeProvider>
  );
}

function PageInner() {
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    avatarUrl?: string;
  }>({
    id: 'u_current',
    name: 'You',
    avatarUrl: undefined,
  });

  const [usersById, setUsersById] = useState<Record<string, UserMini>>({
    u_current: { id: 'u_current', name: 'You' },
  });

  const [tab, setTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef<LiveMapHandle>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoc, setDrawerLoc] = useState<LocationData | undefined>(undefined);

  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [drawerUser, setDrawerUser] = useState<UserMini | undefined>(undefined);

  const [userStars, setUserStars] = useState<Record<string, number>>({});
  const [locationStars, setLocationStars] = useState<Record<string, number>>({});
  const [postStars, setPostStars] = useState<Record<string, number>>({});
  const [eventStars, setEventStars] = useState<Record<string, number>>({});
  const [marketStars, setMarketStars] = useState<Record<string, number>>({});
  const [collabStars, setCollabStars] = useState<Record<string, number>>({});

  const inc = (setter: (f: (p: any) => any) => void, id: string) =>
    setter((prev: Record<string, number>) => ({
      ...prev,
      [id]: (prev[id] ?? 0) + 1,
    }));

  const giveUserStar = (userId: string) =>
    setUserStars((prev) => ({ ...prev, [userId]: (prev[userId] ?? 0) + 1 }));
  const giveLocationStar = (locId: string) =>
    inc(setLocationStars as any, locId);
  const givePostStar = (id: string) => inc(setPostStars, id);
  const giveEventStar = (id: string) => inc(setEventStars, id);
  const giveMarketStar = (id: string) => inc(setMarketStars, id);
  const giveCollabStar = (id: string) => inc(setCollabStars, id);

  const [locations, setLocations] = useState<LocationData[]>([]);
  const [posts, setPosts] = useState<DemoPost[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [market, setMarket] = useState<MarketplaceItem[]>([]);
  const [collabs, setCollabs] = useState<CollabItem[]>([]);
  const [marketFilter, setMarketFilter] = useState<'All' | 'Product' | 'Service'>(
    'All',
  );

  const [comments, setComments] = useState<Record<string, any[]>>({});
  function addComment(key: string, c: any) {
    setComments((prev) => ({ ...prev, [key]: [c, ...(prev[key] ?? [])] }));
  }
  function canEditComment(c: any) {
    return c.authorId === currentUser.id;
  }
  function deleteComment(key: string, id: string) {
    setComments((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((x: any) => x.id !== id),
    }));
  }

  const [commentOpen, setCommentOpen] = useState(false);
  const [commentKey, setCommentKey] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [commentTags, setCommentTags] = useState<string[]>([]);
  const {
    url: cImg,
    name: cImgName,
    onChange: cImgChange,
    clear: cImgClear,
  } = useImagePreview();
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

  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [followedLocations, setFollowedLocations] = useState<string[]>([]);
  useEffect(() => {
    setFollowedUsers(JSON.parse(localStorage.getItem('ps_follow_users') || '[]'));
    setFollowedLocations(
      JSON.parse(localStorage.getItem('ps_follow_locs') || '[]'),
    );
  }, []);
  useEffect(() => {
    localStorage.setItem('ps_follow_users', JSON.stringify(followedUsers));
  }, [followedUsers]);
  useEffect(() => {
    localStorage.setItem('ps_follow_locs', JSON.stringify(followedLocations));
  }, [followedLocations]);

  const toggleFollowUser = (userId: string) =>
    setFollowedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  const toggleFollowLocation = (locId: string) =>
    setFollowedLocations((prev) =>
      prev.includes(locId) ? prev.filter((id) => id !== locId) : [...prev, locId],
    );

  // HOME FEED FILTER (fav locations, fav users, all)
  const [feedFilter, setFeedFilter] = useState<'favLocations' | 'favUsers' | 'all'>(
    'all',
  );

  const filteredPosts = useMemo(() => {
    switch (feedFilter) {
      case 'favLocations':
        return posts.filter(
          (p) => p.locationId && followedLocations.includes(p.locationId),
        );
      case 'favUsers':
        return posts.filter((p) => followedUsers.includes(p.authorId));
      case 'all':
      default:
        return posts;
    }
  }, [feedFilter, posts, followedLocations, followedUsers]);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  function handleSelectTab(next: TabKey) {
  if (next === 'profile') {
    openUser(currentUser.id);
    return;
  }
  setTab(next);
  setSelectedUserId(null);
  setSelectedLocationId(null);
}


  // Map visibility:
  // - home / marketplace / profile => HAUNTING
  // - events                      => EVENT
  // - collaboration               => COLLAB
  function allowedTypesForTab(t: string): Array<LocationData['type']> | null {
    if (t === 'events') return ['EVENT'];
    if (t === 'collaboration') return ['COLLAB'];
    return ['HAUNTING'];
  }

  const matchesQuery = (s?: string) =>
    !searchQuery || (s ?? '').toLowerCase().includes(searchQuery.toLowerCase());

  const filteredLocations = useMemo(() => {
    const allowed = allowedTypesForTab(tab);
    const byType = allowed
      ? locations.filter((l) => allowed.includes(l.type))
      : locations;
    return byType.filter(
      (l) => matchesQuery(l.title) || matchesQuery(l.summary),
    );
  }, [locations, searchQuery, tab]);

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

  const { url: postImg, onChange: postImgChange, clear: postImgClear } =
    useImagePreview();
  const [postFormOpen, setPostFormOpen] = useState(false);
  const [postTagUsers, setPostTagUsers] = useState<string[]>([]);
  const [selectedLocId, setSelectedLocId] = useState<string>('');
  const [locQuery, setLocQuery] = useState('');

  const locationOptions = useMemo(() => {
    const base = locations;
    const q = locQuery.trim().toLowerCase();
    return q
      ? base.filter((l) => l.title.toLowerCase().includes(q)).slice(0, 20)
      : base.slice(0, 12);
  }, [locations, locQuery]);

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

    const p: DemoPost = {
      id: crypto.randomUUID(),
      type: 'Post',
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

  const [locFormOpen, setLocFormOpen] = useState(false);
  const [newLoc, setNewLoc] = useState<{ lng: number; lat: number } | null>(null);
  const { url: locImg, onChange: locImgChange, clear: locImgClear } =
    useImagePreview();

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

  const { country } = useScope();
  const countries = useCountries();

  const [eventFormOpen, setEventFormOpen] = useState(false);
  const { url: evImg, onChange: evImgChange, clear: evImgClear } =
    useImagePreview();
  function handleAddEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const countryCode = String(fd.get('country') || country).toUpperCase();
    const postalCode = String(fd.get('postal') || '').trim() || undefined;

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
        countryCode,
        postalCode,
      },
    ]);
    setEventFormOpen(false);
    evImgClear();
  }

  const [listingFormOpen, setListingFormOpen] = useState(false);
  const { url: mkImg, onChange: mkImgChange, clear: mkImgClear } =
    useImagePreview();
  function handleAddListing(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const countryCode = String(fd.get('country') || country).toUpperCase();
    const postalCode = String(fd.get('postal') || '').trim() || undefined;

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
        countryCode,
        postalCode,
      },
      ...prev,
    ]);
    setListingFormOpen(false);
    mkImgClear();
  }

  const [collabFormOpen, setCollabFormOpen] = useState(false);
  const { url: cbImg, onChange: cbImgChange, clear: cbImgClear } =
    useImagePreview();
  function handleAddCollab(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const countryCode = String(fd.get('country') || country).toUpperCase();
    const postalCode = String(fd.get('postal') || '').trim() || undefined;

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
        countryCode,
        postalCode,
      },
      ...prev,
    ]);
    setCollabFormOpen(false);
    cbImgClear();
  }

  // Auto-prune expired events & collabs (based on end/date)
  const now = Date.now();

  const activeCollabs = useMemo(
    () =>
      collabs.filter((c) => {
        if (!c.dateISO) return true;
        const d = new Date(c.dateISO).getTime();
        return d >= now;
      }),
    [collabs, now],
  );

  // sorters
  const sortPosts = (a: DemoPost, b: DemoPost) => {
    const sa = postStars[a.id] ?? 0;
    const sb = postStars[b.id] ?? 0;
    if (sb !== sa) return sb - sa;
    return b.createdAt - a.createdAt;
  };
 
  const sortMarket = (a: MarketplaceItem, b: MarketplaceItem) =>
    b.createdAt - a.createdAt;
  const sortCollab = (a: CollabItem, b: CollabItem) => {
    const da = a.dateISO ? new Date(a.dateISO).getTime() : a.createdAt;
    const db = b.dateISO ? new Date(b.dateISO).getTime() : b.createdAt;
    return db - da;
  };

  return (
    <main className="flex min-h-screen flex-col bg-[#0B0C0E] text-white">
<ParaverseHeader
  tab={tab}
  onSelectTab={handleSelectTab}
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  currentUser={currentUser}
/>


      {/* MAP */}
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

          {/* Drawers overlay */}
          <div className="pointer-events-none absolute inset-0 z-50 flex items-start justify-center p-3 md:p-4">
            <div className="pointer-events-auto w-full max-w-xl">
              <LocationDrawer
                variant="center"
                open={drawerOpen}
                location={drawerLoc}
                onGiveLocationStar={giveLocationStar}
                onClickLocationTitle={() =>
                  drawerLoc && setSelectedLocationId(drawerLoc.id)
                }
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
                onSave={(next) => {
                  setUsersById((prev) => ({ ...prev, [next.id]: next }));
                  if (next.id === currentUser.id) {
                    setCurrentUser((u) => ({
                      ...u,
                      name: next.name,
                      avatarUrl: next.avatarUrl,
                    }));
                  }
                  setDrawerUser(next);
                }}
                onClose={() => setUserDrawerOpen(false)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEEDS */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-6">
          {/* Title row + country selector where relevant */}
          <div className="mb-4">
            <h1 className="text-2xl font-semibold">
              {selectedLocationId
                ? locations.find((l) => l.id === selectedLocationId)?.title ??
                  'Location'
                : selectedUserId
                ? `${usersById[selectedUserId]?.name ?? 'User'} — posts`
                : tab === 'home'
                ? 'Home'
                : tab === 'events'
                ? 'Events'
                : tab === 'marketplace'
                ? 'Marketplace'
                : tab === 'collaboration'
                ? 'Collaboration'
                : 'Feed'}
            </h1>

            {!selectedLocationId && !selectedUserId && tab === 'home' && (
              <div className="mt-1 text-sm text-yellow-200">
                Now showing posts by stars. Filter between favourite locations, favourite
                users, or all posts.
              </div>
            )}

            {tab === 'home' && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Chip
                  active={feedFilter === 'all'}
                  onClick={() => setFeedFilter('all')}
                >
                  All
                </Chip>
                <Chip
                  active={feedFilter === 'favLocations'}
                  onClick={() => setFeedFilter('favLocations')}
                >
                  Favourites • Locations
                </Chip>
                <Chip
                  active={feedFilter === 'favUsers'}
                  onClick={() => setFeedFilter('favUsers')}
                >
                  Favourites • Users
                </Chip>
              </div>
            )}

            {tab === 'home' && (
              <div className="mt-3 grid gap-3">
                <div>
                  <div className="mb-1 text-xs text-neutral-400">Followed users</div>
                  <div className="flex flex-wrap gap-2">
                    {followedUsers.length === 0 && (
                      <span className="text-xs text-neutral-500">
                        You are not following any users yet.
                      </span>
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
                  <div className="mb-1 text-xs text-neutral-400">
                    Followed locations
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {followedLocations.length === 0 && (
                      <span className="text-xs text-neutral-500">
                        You are not following any locations yet.
                      </span>
                    )}
                    {followedLocations.map((lid) => (
                      <Chip
                        key={lid}
                        active={selectedLocationId === lid}
                        onClick={() => {
                          setSelectedLocationId(
                            lid === selectedLocationId ? null : lid,
                          );
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

            {tab === 'home' && (
              <div className="mt-3">
                <button
                  onClick={() => setPostFormOpen(true)}
                  className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300 hover:bg-cyan-500/20"
                >
                  + Add Post
                </button>
              </div>
            )}

            {['events', 'marketplace', 'collaboration'].includes(tab) && (
              <div className="mt-3">
                <CountrySelect />
              </div>
            )}
          </div>

          {/* POSTS */}
          {tab === 'home' && (
            <HomeFeed
              tab={tab}
              posts={posts}
              filteredPosts={filteredPosts}
              searchQuery={searchQuery}
              selectedUserId={selectedUserId}
              selectedLocationId={selectedLocationId}
              setSelectedLocationId={setSelectedLocationId}
              setSelectedUserId={setSelectedUserId}
              usersById={usersById}
              locations={locations}
              postStars={postStars}
              givePostStar={givePostStar}
              comments={comments}
              canEditPost={canEditPost}
              editPost={editPost}
              deletePost={deletePost}
              canEditComment={canEditComment}
              deleteComment={deleteComment}
              openComment={openComment}
              sortPosts={sortPosts}
            />
          )}


         {/* EVENTS */}
{tab === 'events' && (
  <EventsFeed
    events={events}
    comments={comments}
    setComments={setComments}
    country={country}
    countries={countries}
    eventStars={eventStars}
    giveEventStar={giveEventStar}
    setEventFormOpen={setEventFormOpen}
  />
)}


         {/* MARKETPLACE */}
{tab === 'marketplace' && (
  <MarketplaceFeed
    items={market}
    comments={comments}
    country={country}
    marketStars={marketStars}
    onGiveStar={giveMarketStar}
    onOpenComment={openComment}
    marketFilter={marketFilter}
    setMarketFilter={setMarketFilter}
    onOpenListingForm={() => setListingFormOpen(true)}
  />
)}


          {/* COLLABORATION */}
          {tab === 'collaboration' && (
            <>
              <SectionDisclaimer>
                Collaboration posts are user-organised. Paraverse does not mediate or
                guarantee any arrangement—please verify reputation, safety, and terms
                independently.
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
                {activeCollabs
                  .filter(byCountry<CollabItem>(country))
                  .sort(sortCollab)
                  .map((c) => {
                    const cKey = `collab:${c.id}`;
                    return (
                      <article
                        key={c.id}
                        className="rounded-xl border border-neutral-800 bg-neutral-900 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">{c.title}</h3>
                          <StarBadge
                            value={collabStars[c.id] ?? 0}
                            onClick={() => giveCollabStar(c.id)}
                          />
                        </div>
                        {c.imageUrl && (
                          <img
                            src={c.imageUrl}
                            alt=""
                            className="mt-2 rounded-md border border-neutral-800"
                          />
                        )}
                        {c.description && <TranslatePost text={c.description} />}
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-400">
                          {c.dateISO && (
                            <span>Date: {new Date(c.dateISO).toLocaleString()}</span>
                          )}
                          {c.locationText && (
                            <span>Location: {c.locationText}</span>
                          )}
                          {c.countryCode && (
                            <span>Country: {c.countryCode}</span>
                          )}
                          {c.postalCode && (
                            <span>Post code: {c.postalCode}</span>
                          )}
                          {c.priceText && <span>Price: {c.priceText}</span>}
                          {c.contact && (
                            <a
                              className="text-cyan-300 hover:underline"
                              href={c.contact}
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
                            onClick={() => openComment(cKey)}
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
                {activeCollabs.filter(byCountry<CollabItem>(country)).length === 0 && (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
                    No collaboration posts yet.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* MODALS */}
      <Modal open={postFormOpen} onClose={() => setPostFormOpen(false)}>
        <form onSubmit={handleAddPost} className="space-y-3">
          <h3 className="text-lg font-semibold">Add Post</h3>
          <input
            name="title"
            placeholder="Title"
            required
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
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
                  <div className="px-3 py-2 text-sm text-neutral-500">
                    No matches.
                  </div>
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
                    {selectedLocId === l.id && (
                      <span className="text-cyan-300">Selected</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            <input type="hidden" name="locationId" value={selectedLocId} />
            {!selectedLocId && (
              <div className="mt-1 text-xs text-red-300">
                Pick a location from the list before posting.
              </div>
            )}
          </div>

          <textarea
            name="desc"
            placeholder="What happened? Evidence? Notes…"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />

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

          <div>
            <div className="mb-1 text-sm text-neutral-300">Photo (optional)</div>
            <input
              type="file"
              accept="image/*"
              onChange={postImgChange}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
            />
          </div>

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

      <Modal open={locFormOpen} onClose={() => setLocFormOpen(false)}>
        <form onSubmit={handleAddLocation} className="space-y-3">
          <h3 className="text-lg font-semibold">Add Location</h3>
          <input
            name="title"
            placeholder="Location title"
            required
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <select
            name="type"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          >
            <option value="HAUNTING">Haunting</option>
            <option value="EVENT">Event</option>
            <option value="COLLAB">Collaboration</option>
          </select>
          <textarea
            name="summary"
            placeholder="Short summary (optional)"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <input
            name="address"
            placeholder="Address (optional)"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <input
            name="priceInfo"
            placeholder="Prices (optional)"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <input
            name="website"
            placeholder="Website (optional)"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              name="lng"
              defaultValue={newLoc?.lng ?? -2.5}
              placeholder="Lng"
              className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
            />
            <input
              name="lat"
              defaultValue={newLoc?.lat ?? 54.3}
              placeholder="Lat"
              className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setLocFormOpen(false)}
              className="rounded-md border border-neutral-700 px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-cyan-300 hover:bg-cyan-500/20"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={eventFormOpen} onClose={() => setEventFormOpen(false)}>
        <form onSubmit={handleAddEvent} className="space-y-3">
          <h3 className="text-lg font-semibold">Add Event</h3>
          <input
            name="title"
            placeholder="Title"
            required
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <textarea
            name="desc"
            placeholder="Description (optional)"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <input
            name="where"
            placeholder="Location (text)"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />

          {/* Country + Postal */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <div className="mb-1 text-xs text-neutral-400">Country</div>
              <select
                name="country"
                defaultValue={country}
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-1 text-xs text-neutral-400">ZIP / Post code</div>
              <input
                name="postal"
                placeholder="e.g. M1 1AE or 90210"
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="mb-1 text-xs text-neutral-400">From</div>
              <input
                type="datetime-local"
                name="start"
                required
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
              />
            </div>
            <div>
              <div className="mb-1 text-xs text-neutral-400">To</div>
              <input
                type="datetime-local"
                name="end"
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 text-sm text-neutral-300">
              Event photo (optional)
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={evImgChange}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
            />
          </div>

          <input
            name="price"
            placeholder="Price (optional)"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <input
            name="link"
            placeholder="Ticket / Info link (optional)"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEventFormOpen(false)}
              className="rounded-md border border-neutral-700 px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md border border-purple-400 bg-purple-500/10 px-3 py-1.5 text-purple-200 hover:bg-purple-500/20"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={listingFormOpen} onClose={() => setListingFormOpen(false)}>
        <form onSubmit={handleAddListing} className="space-y-3">
          <h3 className="text-lg font-semibold">Add Listing</h3>
          <select
            name="kind"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          >
            <option>Product</option>
            <option>Service</option>
          </select>
          <input
            name="title"
            placeholder="Title"
            required
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <textarea
            name="desc"
            placeholder="Description"
            required
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              name="price"
              placeholder="Price (optional)"
              className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
            />
            <input
              name="where"
              placeholder="Location (optional)"
              className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
            />
          </div>

          {/* Country + Postal */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <div className="mb-1 text-xs text-neutral-400">Country</div>
              <select
                name="country"
                defaultValue={country}
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-1 text-xs text-neutral-400">ZIP / Post code</div>
              <input
                name="postal"
                placeholder="e.g. M1 1AE or 90210"
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 text-sm text-neutral-300">Photos (optional)</div>
            <input
              type="file"
              accept="image/*"
              onChange={mkImgChange}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
            />
          </div>

          <input
            name="contact"
            placeholder="Contact or link"
            required
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setListingFormOpen(false)}
              className="rounded-md border border-neutral-700 px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-cyan-300 hover:bg-cyan-500/20"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={collabFormOpen} onClose={() => setCollabFormOpen(false)}>
        <form onSubmit={handleAddCollab} className="space-y-3">
          <h3 className="text-lg font-semibold">Add Collaboration</h3>
          <input
            name="title"
            placeholder="Title"
            required
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <textarea
            name="desc"
            placeholder="Details (optional)"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <input
            type="datetime-local"
            name="date"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <input
            name="where"
            placeholder="Location (optional)"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <input
            name="price"
            placeholder="Price (optional)"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <input
            name="contact"
            placeholder="Contact or link"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />

          {/* Country + Postal */}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <div className="mb-1 text-xs text-neutral-400">Country</div>
              <select
                name="country"
                defaultValue={country}
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-1 text-xs text-neutral-400">ZIP / Post code</div>
              <input
                name="postal"
                placeholder="e.g. M1 1AE or 90210"
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <div className="mb-1 text-sm text-neutral-300">Photo (optional)</div>
            <input
              type="file"
              accept="image/*"
              onChange={cbImgChange}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCollabFormOpen(false)}
              className="rounded-md border border-neutral-700 px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-cyan-300 hover:bg-cyan-500/20"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      {/* Comment dialog */}
      <Modal
        open={commentOpen}
        onClose={() => {
          setCommentOpen(false);
          setCommentText('');
          setCommentTags([]);
          cImgClear();
        }}
      >
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Add Comment</h3>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write your comment…"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />
          <div>
            <div className="mb-1 text-sm text-neutral-300">
              Attach photo (optional)
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={cImgChange}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
            />
            {cImg && (
              <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-950 p-2">
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

          <div>
            <div className="mb-1 text-sm text-neutral-300">
              Tag friends (optional)
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.values(usersById).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() =>
                    setCommentTags((prev) =>
                      prev.includes(u.id)
                        ? prev.filter((x) => x !== u.id)
                        : [...prev, u.id],
                    )
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
    </main>
  );
}
