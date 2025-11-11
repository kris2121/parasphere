'use client';

import { useMemo, useRef, useState, FormEvent, useEffect } from "react";
import StickyNav from "@/components/StickyNav";
import SideDrawerNav from "@/components/SideDrawerNav";
import LiveMap, { LocationData, LiveMapHandle } from "@/components/LiveMap";
import LocationDrawer from "@/components/LocationDrawer";
import UserDrawer, { UserMini } from "@/components/UserDrawer";
import MapActions from "@/components/MapActions";

/* --------------------------------- UI bits -------------------------------- */
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

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/60" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[91] -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-xl rounded-xl border border-neutral-800 bg-neutral-950 p-4">
        {children}
      </div>
    </>
  );
}

function SectionDisclaimer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-lg border border-yellow-700/40 bg-yellow-900/10 text-yellow-200 text-sm px-3 py-2">
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm ${
        active
          ? "border-cyan-500 bg-cyan-500/10 text-cyan-300"
          : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
      }`}
    >
      {children}
    </button>
  );
}

/* --------------------------------- Types ---------------------------------- */
type DemoPost = {
  id: string;
  type: "Post • Haunting" | "Post • UFO" | "Post • Cryptid" | "Friend • Post";
  title: string;
  desc: string;
  locationId?: string;
  imageUrl?: string;      // local preview (ObjectURL) for demo
  linkUrl?: string;       // external (videos, websites, socials)
  authorId: string;
  authorName: string;
  tagUserIds?: string[];
  tagLocationIds?: string[];
  createdAt: number;
};

type MarketplaceItem = {
  id: string;
  kind: "Product" | "Service";
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

type CommentItem = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  imageUrl?: string;
  tagUserIds?: string[];
  createdAt: number;
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
export default function Home() {
  const currentUser = { id: "u_kris", name: "Kris" };

  /* ------------ NAV / MAP ------------ */
  const [tab, setTab] = useState<string>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<LiveMapHandle>(null);

  /* ------------ DRAWERS ------------ */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoc, setDrawerLoc] = useState<LocationData | undefined>(undefined);

  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [drawerUser, setDrawerUser] = useState<UserMini | undefined>(undefined);

  /* ------------ RATINGS ------------ */
  const [userStars, setUserStars] = useState<Record<string, number>>({
    u_kris: 5,
    u_scott: 3,
    u_jay: 4,
    u_andy: 2,
  });
  const [locationStars, setLocationStars] = useState<Record<string, number>>({
    pendle: 12,
    bodmin: 7,
    snowdonia: 5,
    ev_msb_overnight: 3,
  });

  // NEW: star maps for every card type
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

  /* ------------ DEMO USERS ------------ */
  const users: Record<string, UserMini> = {
    u_scott: { id: "u_scott", name: "Scott", team: "The Paranormal Project", location: "NW England" },
    u_jay: { id: "u_jay", name: "Jay", team: "The Paranormal Project", location: "NW England" },
    u_andy: { id: "u_andy", name: "Andy", team: "The Paranormal Project", location: "NW England" },
    u_kris: { id: "u_kris", name: "Kris", team: "The Paranormal Project", location: "NW England" },
  };

  /* ------------ LOCATIONS ------------ */
  const [locations, setLocations] = useState<LocationData[]>([
    {
      id: "pendle",
      title: "Pendle Hill",
      type: "HAUNTING",
      lat: 53.856,
      lng: -2.298,
      imageUrl:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
      summary: "Famous Lancashire haunting hotspot.",
      address: "Pendle Hill, Lancashire",
    },
    {
      id: "bodmin",
      title: "Beast of Bodmin",
      type: "CRYPTID",
      lat: 50.498,
      lng: -4.668,
      imageUrl:
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
      summary: "Large cat sightings reported.",
      address: "Bodmin Moor, Cornwall",
    },
    {
      id: "snowdonia",
      title: "Snowdonia Ridge Lights",
      type: "UFO",
      lat: 53.068,
      lng: -4.076,
      imageUrl:
        "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop",
      summary: "Fast zigzag lights, no sound.",
      address: "Snowdonia National Park, Wales",
    },
    {
      id: "ev_msb_overnight",
      title: "Mill Street Barracks — Overnight Investigation",
      type: "EVENT",
      lat: 53.389,
      lng: -2.881,
      imageUrl:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
      summary: "Small group ghost hunt.",
      address: "St Helens, WA10",
      priceInfo: "£35 pp",
      website: "https://example.com/tickets",
    },
  ]);

  /* ------------ POSTS ------------ */
  const [posts, setPosts] = useState<DemoPost[]>([
    {
      id: "hp1",
      type: "Post • Haunting",
      title: "Pendle stile shadow",
      desc: "Figure crossed footpath, EMF spike.",
      locationId: "pendle",
      authorId: "u_scott",
      authorName: "Scott",
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
    },
    {
      id: "up1",
      type: "Post • UFO",
      title: "Triangle over ridge",
      desc: "Three lights, silent, drift 12s.",
      locationId: "snowdonia",
      authorId: "u_jay",
      authorName: "Jay",
      createdAt: Date.now() - 1000 * 60 * 60 * 4,
    },
    {
      id: "cp1",
      type: "Post • Cryptid",
      title: "Fresh prints by stream",
      desc: "Large feline pads, 9cm width.",
      locationId: "bodmin",
      authorId: "u_andy",
      authorName: "Andy",
      createdAt: Date.now() - 1000 * 60 * 60 * 6,
    },
  ]);

  /* ------------ EVENTS / MARKET / COLLAB ------------ */
  const [events, setEvents] = useState<EventItem[]>([
    {
      id: "e1",
      title: "Mill Street Barracks — Overnight Investigation",
      description: "Guided sessions, small groups.",
      locationText: "St Helens, WA10",
      startISO: "2025-12-05T20:00",
      endISO: "2025-12-06T02:00",
      priceText: "£35 pp",
      link: "https://example.com/tickets",
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      postedBy: { id: "u_scott", name: "Scott" },
    },
  ]);
  const [market, setMarket] = useState<MarketplaceItem[]>([]);
  const [collabs, setCollabs] = useState<CollabItem[]>([]);
  const [marketFilter, setMarketFilter] = useState<"All" | "Product" | "Service">("All");

  /* ------------ COMMENTS (all entities) ------------ */
  // key pattern: post:<id> | event:<id> | market:<id> | collab:<id>
  const [comments, setComments] = useState<Record<string, CommentItem[]>>({});
  function addComment(key: string, c: CommentItem) {
    setComments((prev) => ({ ...prev, [key]: [c, ...(prev[key] ?? [])] }));
  }

  /* ------------ SELECTION ------------ */
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  /* ------------ FOLLOWING (persist) ------------ */
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [followedLocations, setFollowedLocations] = useState<string[]>([]);
  useEffect(() => {
    setFollowedUsers(JSON.parse(localStorage.getItem("ps_follow_users") || "[]"));
    setFollowedLocations(JSON.parse(localStorage.getItem("ps_follow_locs") || "[]"));
  }, []);
  useEffect(() => {
    localStorage.setItem("ps_follow_users", JSON.stringify(followedUsers));
  }, [followedUsers]);
  useEffect(() => {
    localStorage.setItem("ps_follow_locs", JSON.stringify(followedLocations));
  }, [followedLocations]);

  const toggleFollowUser = (userId: string) =>
    setFollowedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  const toggleFollowLocation = (locId: string) =>
    setFollowedLocations((prev) => (prev.includes(locId) ? prev.filter((id) => id !== locId) : [...prev, locId]));

  /* ------------ TAB / FILTER HELPERS ------------ */
  function handleSelectTab(next: string) {
    setTab(next);
    setSelectedUserId(null);
    setSelectedLocationId(null);
  }
  function goHome() {
    handleSelectTab("home");
  }

  function allowedTypesForTab(t: string): Array<LocationData["type"]> | null {
    if (t === "hauntings") return ["HAUNTING"];
    if (t === "ufos") return ["UFO"];
    if (t === "cryptids") return ["CRYPTID"];
    if (t === "events") return ["EVENT"];
    return null;
  }
  const allowed = allowedTypesForTab(tab);
  const matchesQuery = (s?: string) => !searchQuery || (s ?? "").toLowerCase().includes(searchQuery.toLowerCase());
  const filteredLocations = useMemo(() => {
    const byTab = allowed ? locations.filter((l) => allowed.includes(l.type)) : locations;
    return byTab.filter((l) => matchesQuery(l.title) || matchesQuery(l.summary));
  }, [allowed, locations, searchQuery]);

  /* ------------ OPENERS ------------ */
  function openFromPin(loc: LocationData) {
    setDrawerLoc(loc);
    setDrawerOpen(true);
    setSelectedLocationId(loc.id);
    setSelectedUserId(null);
  }
  function openUser(userId: string) {
    const u = users[userId] ?? { id: userId, name: "User" };
    setDrawerUser(u);
    setUserDrawerOpen(true);
    setSelectedUserId(userId);
    setSelectedLocationId(null);
    setTab("home");
  }

  /* ------------ FEEDS ------------ */
  const postsForFeed = useMemo(() => {
    const base = posts.filter(
      (p) =>
        (!selectedUserId || p.authorId === selectedUserId) &&
        (!selectedLocationId || p.locationId === selectedLocationId) &&
        (!searchQuery ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.desc.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    if (tab === "hauntings") return base.filter((p) => p.type.includes("Haunting"));
    if (tab === "ufos") return base.filter((p) => p.type.includes("UFO"));
    if (tab === "cryptids") return base.filter((p) => p.type.includes("Cryptid"));
    return base;
  }, [posts, tab, searchQuery, selectedUserId, selectedLocationId]);

  /* --------------------- ADD POST (image + tags universal) ----------------- */
  const [postFormOpen, setPostFormOpen] = useState(false);
  const { url: postImg, name: postImgName, onChange: postImgChange, clear: postImgClear } = useImagePreview();
  const [postTagUsers, setPostTagUsers] = useState<string[]>([]);
  const [postTagLocs, setPostTagLocs] = useState<string[]>([]);

  function AddPostForm({ onSubmit, onClose }: { onSubmit: (p: DemoPost) => void; onClose: () => void }) {
    const locationOptions = allowed ? locations.filter((l) => allowed!.includes(l.type)) : locations;
    function toggle(arr: string[], id: string, setter: (v: string[]) => void) {
      setter(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
    }
    function handle(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const locId = String(fd.get("locationId") || "");
      const typeFromLoc =
        locId && locations.find((l) => l.id === locId)?.type === "UFO"
          ? "Post • UFO"
          : locId && locations.find((l) => l.id === locId)?.type === "CRYPTID"
          ? "Post • Cryptid"
          : locId && locations.find((l) => l.id === locId)?.type === "EVENT"
          ? "Friend • Post"
          : "Post • Haunting";
      const p: DemoPost = {
        id: crypto.randomUUID(),
        type: typeFromLoc,
        title: String(fd.get("title") || "").trim(),
        desc: String(fd.get("desc") || "").trim(),
        locationId: locId || undefined,
        imageUrl: postImg,
        linkUrl: String(fd.get("link") || "").trim() || undefined,
        authorId: currentUser.id,
        authorName: currentUser.name,
        tagUserIds: postTagUsers,
        tagLocationIds: postTagLocs,
        createdAt: Date.now(),
      };
      onSubmit(p);
      onClose();
      postImgClear();
      setPostTagUsers([]);
      setPostTagLocs([]);
    }
    return (
      <form onSubmit={handle} className="space-y-3">
        <h3 className="text-lg font-semibold">Add Post</h3>
        <input name="title" placeholder="Title" required className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        <textarea name="desc" placeholder="What happened? Evidence? Notes…" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        <label className="text-sm text-neutral-300">Location (optional)</label>
        <select name="locationId" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2">
          <option value="">— none —</option>
          {locationOptions.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>

        {/* Tag friends */}
        <div>
          <div className="text-sm text-neutral-300 mb-1">Tag friends</div>
          <div className="flex flex-wrap gap-2">
            {Object.values(users).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => toggle(postTagUsers, u.id, setPostTagUsers)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  postTagUsers.includes(u.id) ? "border-cyan-500 bg-cyan-500/10 text-cyan-300" : "border-neutral-700 text-neutral-300"
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tag locations */}
        <div>
          <div className="text-sm text-neutral-300 mb-1">Tag locations</div>
          <div className="flex flex-wrap gap-2">
            {locations.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => toggle(postTagLocs, l.id, setPostTagLocs)}
                className={`rounded-full border px-3 py-1 text-sm ${
                  postTagLocs.includes(l.id) ? "border-cyan-500 bg-cyan-500/10 text-cyan-300" : "border-neutral-700 text-neutral-300"
                }`}
              >
                {l.title}
              </button>
            ))}
          </div>
        </div>

        {/* Photo (universal) */}
        <div>
          <div className="text-sm text-neutral-300 mb-1">Photo (optional)</div>
          <input type="file" accept="image/*" onChange={postImgChange} className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 w-full" />
          {postImg && (
            <div className="rounded-md border border-neutral-800 bg-neutral-950 p-2 mt-2">
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

        {/* External link only for videos/sites (no image URLs) */}
        <input name="link" placeholder="External link (YouTube, site, social — optional)" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border border-neutral-700 px-3 py-1.5">
            Cancel
          </button>
          <button type="submit" className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-cyan-300 hover:bg-cyan-500/20">
            Post
          </button>
        </div>
      </form>
    );
  }

  /* -------------------- ADD LOCATION (image upload too) -------------------- */
  const [locFormOpen, setLocFormOpen] = useState(false);
  const [newLoc, setNewLoc] = useState<{ lng: number; lat: number } | null>(null);
  const { url: locImg, name: locImgName, onChange: locImgChange, clear: locImgClear } = useImagePreview();

  function openAddLocation() {
    const center = mapRef.current?.getCenter();
    setNewLoc(center ? { lng: center[0], lat: center[1] } : { lng: -2.5, lat: 54.3 });
    setLocFormOpen(true);
  }

  function AddLocationForm({ onSubmit, onClose }: { onSubmit: (l: LocationData) => void; onClose: () => void }) {
    const [lng, setLng] = useState(newLoc?.lng ?? -2.5);
    const [lat, setLat] = useState(newLoc?.lat ?? 54.3);
    function useMyLocation() {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLng(pos.coords.longitude);
          setLat(pos.coords.latitude);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 7000 }
      );
    }
    function handle(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const type = String(fd.get("type")) as LocationData["type"];
      const l: LocationData = {
        id: crypto.randomUUID(),
        title: String(fd.get("title") || "").trim(),
        type,
        lat: Number(lat),
        lng: Number(lng),
        summary: String(fd.get("summary") || "").trim() || undefined,
        address: String(fd.get("address") || "").trim() || undefined,
        priceInfo: String(fd.get("priceInfo") || "").trim() || undefined,
        website: String(fd.get("website") || "").trim() || undefined,
        imageUrl: locImg, // local preview demo
      };
      onSubmit(l);
      onClose();
      locImgClear();
    }
    return (
      <form onSubmit={handle} className="space-y-3">
        <h3 className="text-lg font-semibold">Add Location</h3>
        <input name="title" placeholder="Location title" required className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        <select name="type" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2">
          <option value="HAUNTING">Haunting</option>
          <option value="UFO">UFO</option>
          <option value="CRYPTID">Cryptid</option>
          <option value="EVENT">Event</option>
        </select>
        <textarea name="summary" placeholder="Short summary (optional)" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        <input name="address" placeholder="Address (optional)" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        <input name="priceInfo" placeholder="Prices (optional)" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        <input name="website" placeholder="Website (optional)" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />

        {/* Photo for location */}
        <div>
          <div className="text-sm text-neutral-300 mb-1">Main photo (optional)</div>
          <input type="file" accept="image/*" onChange={locImgChange} className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 w-full" />
          {locImg && (
            <div className="rounded-md border border-neutral-800 bg-neutral-950 p-2 mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={locImg} alt="preview" className="max-h-64 w-auto rounded-md border border-neutral-800" />
              <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                <span className="truncate">{locImgName}</span>
                <button type="button" onClick={locImgClear} className="text-neutral-300 hover:underline">
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input value={lng} onChange={(e) => setLng(Number(e.target.value))} placeholder="Lng" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <input value={lat} onChange={(e) => setLat(Number(e.target.value))} placeholder="Lat" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => {
            const c = mapRef.current?.getCenter();
            if (c) { setLng(c[0]); setLat(c[1]); }
          }} className="rounded-md border border-neutral-700 px-3 py-1.5">Use map center</button>
          <button type="button" onClick={useMyLocation} className="rounded-md border border-neutral-700 px-3 py-1.5">Use my location</button>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border border-neutral-700 px-3 py-1.5">Cancel</button>
          <button type="submit" className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-cyan-300 hover:bg-cyan-500/20">Save</button>
        </div>
      </form>
    );
  }

  /* ------------------- ADD EVENT / LISTING / COLLAB (images) ------------------- */
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const { url: evImg, name: evImgName, onChange: evImgChange, clear: evImgClear } = useImagePreview();

  function AddEventForm({ onSubmit, onClose }: { onSubmit: (e: EventItem) => void; onClose: () => void }) {
    function handle(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      onSubmit({
        id: crypto.randomUUID(),
        title: String(fd.get("title") || "").trim(),
        description: String(fd.get("desc") || "").trim() || undefined,
        locationText: String(fd.get("where") || "").trim() || undefined,
        startISO: String(fd.get("start") || ""),
        endISO: String(fd.get("end") || "") || undefined,
        priceText: String(fd.get("price") || "").trim() || undefined,
        link: String(fd.get("link") || "").trim() || undefined,
        imageUrl: evImg,
        createdAt: Date.now(),
        postedBy: { id: currentUser.id, name: currentUser.name },
      });
      onClose();
      evImgClear();
    }
    return (
      <form onSubmit={handle} className="space-y-3">
        <h3 className="text-lg font-semibold">Add Event</h3>
        <input name="title" placeholder="Title" required className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        <textarea name="desc" placeholder="Description (optional)" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        <input name="where" placeholder="Location (text)" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-xs text-neutral-400 mb-1">From</div>
            <input type="datetime-local" name="start" required className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 w-full" />
          </div>
          <div>
            <div className="text-xs text-neutral-400 mb-1">To</div>
            <input type="datetime-local" name="end" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 w-full" />
          </div>
        </div>

        {/* Photo */}
        <div>
          <div className="text-sm text-neutral-300 mb-1">Event photo (optional)</div>
          <input type="file" accept="image/*" onChange={evImgChange} className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 w-full" />
          {evImg && (
            <div className="rounded-md border border-neutral-800 bg-neutral-950 p-2 mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={evImg} alt="preview" className="max-h-64 w-auto rounded-md border border-neutral-800" />
              <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                <span className="truncate">{evImgName}</span>
                <button type="button" onClick={evImgClear} className="text-neutral-300 hover:underline">Remove</button>
              </div>
            </div>
          )}
        </div>

        <input name="price" placeholder="Price (optional)" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        <input name="link" placeholder="Ticket / Info link (optional)" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-neutral-700 px-3 py-1.5">Cancel</button>
          <button type="submit" className="rounded-md border border-purple-400 bg-purple-500/10 px-3 py-1.5 text-purple-200 hover:bg-purple-500/20">Save</button>
        </div>
      </form>
    );
  }

  const [listingFormOpen, setListingFormOpen] = useState(false);
  const { url: mkImg, name: mkImgName, onChange: mkImgChange, clear: mkImgClear } = useImagePreview();

  function AddListingForm({ onSubmit, onClose }: { onSubmit: (m: MarketplaceItem) => void; onClose: () => void }) {
    function handle(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      onSubmit({
        id: crypto.randomUUID(),
        kind: (String(fd.get("kind")) as "Product" | "Service") || "Product",
        title: String(fd.get("title") || "").trim(),
        description: String(fd.get("desc") || "").trim(),
        price: Number(String(fd.get("price") || "").trim()) || undefined,
        locationText: String(fd.get("where") || "").trim() || undefined,
        imageUrl: mkImg,
        contactOrLink: String(fd.get("contact") || "").trim() || undefined,
        createdAt: Date.now(),
        postedBy: { id: currentUser.id, name: currentUser.name },
      });
      onClose();
      mkImgClear();
    }
    return (
      <form onSubmit={handle} className="space-y-3">
        <h3 className="text-lg font-semibold">Add Listing</h3>
        <select name="kind" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2">
          <option>Product</option>
          <option>Service</option>
        </select>
        <input name="title" placeholder="Title" required className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        <textarea name="desc" placeholder="Description" required className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        <div className="grid grid-cols-2 gap-2">
          <input name="price" placeholder="Price (optional)" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
          <input name="where" placeholder="Location (optional)" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        </div>

        {/* Photo */}
        <div>
          <div className="text-sm text-neutral-300 mb-1">Photos (optional)</div>
          <input type="file" accept="image/*" onChange={mkImgChange} className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 w-full" />
          {mkImg && (
            <div className="rounded-md border border-neutral-800 bg-neutral-950 p-2 mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mkImg} alt="preview" className="max-h-64 w-auto rounded-md border border-neutral-800" />
              <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                <span className="truncate">{mkImgName}</span>
                <button type="button" onClick={mkImgClear} className="text-neutral-300 hover:underline">Remove</button>
              </div>
            </div>
          )}
        </div>

        <input name="contact" placeholder="Contact or link" required className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-neutral-700 px-3 py-1.5">Cancel</button>
          <button type="submit" className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-cyan-300 hover:bg-cyan-500/20">Save</button>
        </div>
      </form>
    );
  }

  const [collabFormOpen, setCollabFormOpen] = useState(false);
  const { url: cbImg, name: cbImgName, onChange: cbImgChange, clear: cbImgClear } = useImagePreview();

  function AddCollabForm({ onSubmit, onClose }: { onSubmit: (c: CollabItem) => void; onClose: () => void }) {
    function handle(e: FormEvent<HTMLFormElement>) {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      onSubmit({
        id: crypto.randomUUID(),
        title: String(fd.get("title") || "").trim(),
        description: String(fd.get("desc") || "").trim() || undefined,
        dateISO: String(fd.get("date") || "") || undefined,
        locationText: String(fd.get("where") || "").trim() || undefined,
        priceText: String(fd.get("price") || "").trim() || undefined,
        contact: String(fd.get("contact") || "").trim() || undefined,
        imageUrl: cbImg,
        createdAt: Date.now(),
        postedBy: { id: currentUser.id, name: currentUser.name },
      });
      onClose();
      cbImgClear();
    }
    return (
      <form onSubmit={handle} className="space-y-3">
        <h3 className="text-lg font-semibold">Add Collaboration</h3>
        <input name="title" placeholder="Title" required className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        <textarea name="desc" placeholder="Details (optional)" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        <input type="datetime-local" name="date" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        <input name="where" placeholder="Location (optional)" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        <input name="price" placeholder="Price (optional)" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />
        <input name="contact" placeholder="Contact or link" className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2" />

        {/* Photo */}
        <div>
          <div className="text-sm text-neutral-300 mb-1">Photo (optional)</div>
          <input type="file" accept="image/*" onChange={cbImgChange} className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 w-full" />
          {cbImg && (
            <div className="rounded-md border border-neutral-800 bg-neutral-950 p-2 mt-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cbImg} alt="preview" className="max-h-64 w-auto rounded-md border border-neutral-800" />
              <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                <span className="truncate">{cbImgName}</span>
                <button type="button" onClick={cbImgClear} className="text-neutral-300 hover:underline">Remove</button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border border-neutral-700 px-3 py-1.5">Cancel</button>
          <button type="submit" className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-cyan-300 hover:bg-cyan-500/20">Save</button>
        </div>
      </form>
    );
  }

  /* --------------------- Comment modal (image + tags) ---------------------- */
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentKey, setCommentKey] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentTags, setCommentTags] = useState<string[]>([]);
  const { url: cImg, name: cImgName, onChange: cImgChange, clear: cImgClear } = useImagePreview();

  function openComment(forKey: string) {
    setCommentKey(forKey);
    setCommentOpen(true);
  }
  function submitComment() {
    if (!commentKey) return;
    const c: CommentItem = {
      id: crypto.randomUUID(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      text: commentText.trim(),
      imageUrl: cImg,
      tagUserIds: commentTags,
      createdAt: Date.now(),
    };
    addComment(commentKey, c);
    // (demo) notification: console log who was tagged
    if (commentTags.length) console.log("Notify tagged users:", commentTags);
    // reset
    setCommentOpen(false);
    setCommentText("");
    setCommentTags([]);
    cImgClear();
  }

  /* ---------------------------- RENDER START ------------------------------- */
  return (
    <main className="h-screen bg-[#0B0C0E] text-white flex flex-col">
      {/* Sticky header + map */}
      <div className="sticky top-0 z-40 bg-[#0B0C0E]">
        <StickyNav search={searchQuery} onSearchChange={setSearchQuery} onProfileClick={() => alert("(demo) Profile")} />
        <SideDrawerNav current={tab} onSelect={handleSelectTab} onSelectHome={goHome} />

        <div className="relative mx-auto max-w-6xl px-4 pb-3">
          <LiveMap
            ref={mapRef}
            initialCenter={[-2.5, 54.3]}
            overviewZoom={5.8}
            heightVh={{ desktop: 48, mobile: 40 }}
            locations={filteredLocations}
            onOpen={openFromPin}
          />
          <MapActions onAddLocation={openAddLocation} />
        </div>
      </div>

      {/* Drawers */}
      <LocationDrawer
        open={drawerOpen}
        location={drawerLoc}
        postsForLocation={posts.filter((p) => p.locationId === drawerLoc?.id).sort((a, b) => b.createdAt - a.createdAt)}
        locationStars={locationStars}
        onGiveLocationStar={giveLocationStar}
        onClickAuthor={(uid) => openUser(uid)}
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
        onMessage={(uid) => alert(`(demo) Open message composer to ${uid}`)}
        onBlock={(uid) => alert(`(demo) Blocked ${uid}`)}
        onReport={(uid) => alert(`(demo) Report submitted for ${uid}`)}
        onClose={() => setUserDrawerOpen(false)}
      />

      {/* Scrollable content */}
      <section className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-6">
          {/* HEADER */}
          <div className="mb-4">
            <h1 className="text-2xl font-semibold">
              {selectedLocationId
                ? locations.find((l) => l.id === selectedLocationId)?.title ?? "Location"
                : selectedUserId
                ? `${users[selectedUserId]?.name ?? "User"} — posts`
                : tab === "home"
                ? "HOME"
                : tab === "hauntings"
                ? "Hauntings — newest first"
                : tab === "ufos"
                ? "UFOs — newest first"
                : tab === "cryptids"
                ? "Cryptids — newest first"
                : tab === "events"
                ? "Events — upcoming first"
                : tab === "marketplace"
                ? "Marketplace — newest first"
                : tab === "collaboration"
                ? "Collaboration — latest"
                : "Feed"}
            </h1>
            {!selectedLocationId && !selectedUserId && tab === "home" && (
              <div className="mt-1 text-sm text-yellow-200">Now showing posts from your followed locations and friends.</div>
            )}

            {/* Follow filters (HOME) */}
            {tab === "home" && (
              <div className="mt-3 grid gap-3">
                <div>
                  <div className="mb-1 text-xs text-neutral-400">Followed users</div>
                  <div className="flex flex-wrap gap-2">
                    {followedUsers.length === 0 && <span className="text-xs text-neutral-500">You’re not following any users yet.</span>}
                    {followedUsers.map((uid) => (
                      <Chip
                        key={uid}
                        active={selectedUserId === uid}
                        onClick={() => {
                          setSelectedUserId(uid === selectedUserId ? null : uid);
                          setSelectedLocationId(null);
                        }}
                      >
                        {users[uid]?.name ?? uid}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-1 text-xs text-neutral-400">Followed locations</div>
                  <div className="flex flex-wrap gap-2">
                    {followedLocations.length === 0 && <span className="text-xs text-neutral-500">You’re not following any locations yet.</span>}
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

            {/* Add Post on feed tabs */}
            {["home", "hauntings", "ufos", "cryptids"].includes(tab) && (
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

          {/* --------------------------- FEEDS --------------------------- */}
          {["home", "hauntings", "ufos", "cryptids"].includes(tab) && (
            <div className="grid gap-4">
              {postsForFeed
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((p) => {
                  const cKey = `post:${p.id}`;
                  return (
                    <article key={p.id} className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-neutral-400 text-xs">
                          {p.type} • by{" "}
                          <button className="text-cyan-300 hover:underline" onClick={() => openUser(p.authorId)}>
                            {p.authorName}
                          </button>
                        </div>
                        <StarBadge value={postStars[p.id] ?? 0} onClick={() => givePostStar(p.id)} />
                      </div>
                      <h3 className="text-lg font-semibold mt-1">{p.title}</h3>
                      <p className="text-neutral-300 text-sm">{p.desc}</p>

                      {p.tagUserIds?.length ? (
                        <div className="mt-2 text-xs text-neutral-400">
                          Tagged:&nbsp;
                          {p.tagUserIds.map((uid) => (
                            <span key={uid} className="mr-2 text-cyan-300">
                              {users[uid]?.name ?? uid}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {p.tagLocationIds?.length ? (
                        <div className="mt-1 text-xs text-neutral-400">
                          At:&nbsp;
                          {p.tagLocationIds.map((lid) => (
                            <span key={lid} className="mr-2 text-cyan-300">
                              {locations.find((l) => l.id === lid)?.title ?? lid}
                            </span>
                          ))}
                        </div>
                      ) : null}

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
                              setTab("home");
                            }}
                          >
                            {locations.find((l) => l.id === p.locationId)?.title ?? p.locationId}
                          </button>
                        </div>
                      )}

                      {/* Comments */}
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-900"
                          onClick={() => openComment(cKey)}
                        >
                          Comment
                        </button>
                        <div className="text-xs text-neutral-500">{(comments[cKey]?.length ?? 0)} comments</div>
                      </div>
                      {comments[cKey]?.length ? (
                        <div className="mt-2 grid gap-2">
                          {comments[cKey].map((c) => (
                            <div key={c.id} className="rounded-md border border-neutral-800 bg-neutral-950 p-2">
                              <div className="text-xs text-neutral-400">
                                by <span className="text-cyan-300">{c.authorName}</span> • {new Date(c.createdAt).toLocaleString()}
                              </div>
                              <div className="text-sm text-neutral-200">{c.text}</div>
                              {c.imageUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={c.imageUrl} alt="" className="mt-2 rounded-md border border-neutral-800 max-h-60 w-auto" />
                              )}
                              {c.tagUserIds?.length ? (
                                <div className="mt-1 text-xs text-neutral-400">
                                  Tagged:&nbsp;
                                  {c.tagUserIds.map((uid) => (
                                    <span key={uid} className="mr-2 text-cyan-300">
                                      {users[uid]?.name ?? uid}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
            </div>
          )}

          {/* --------------------------- EVENTS --------------------------- */}
          {tab === "events" && (
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
                      <article key={ev.id} className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-neutral-400">by {ev.postedBy.name}</div>
                          <StarBadge value={eventStars[ev.id] ?? 0} onClick={() => giveEventStar(ev.id)} />
                        </div>
                        <h3 className="text-lg font-semibold">{ev.title}</h3>
                        {ev.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={ev.imageUrl} alt="" className="mt-2 rounded-md border border-neutral-800" />
                        )}
                        {ev.description && <p className="text-sm text-neutral-300 mt-1">{ev.description}</p>}
                        <div className="mt-2 text-xs text-neutral-400">
                          🗓 {new Date(ev.startISO).toLocaleString()} {ev.endISO ? `— ${new Date(ev.endISO).toLocaleString()}` : ""}
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
                        {comments[cKey]?.length ? (
                          <div className="mt-2 grid gap-2">
                            {comments[cKey].map((c) => (
                              <div key={c.id} className="rounded-md border border-neutral-800 bg-neutral-950 p-2">
                                <div className="text-xs text-neutral-400">
                                  by <span className="text-cyan-300">{c.authorName}</span> • {new Date(c.createdAt).toLocaleString()}
                                </div>
                                <div className="text-sm text-neutral-200">{c.text}</div>
                                {c.imageUrl && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={c.imageUrl} alt="" className="mt-2 rounded-md border border-neutral-800 max-h-60 w-auto" />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
              </div>
            </>
          )}

          {/* ------------------------- MARKETPLACE ------------------------ */}
          {tab === "marketplace" && (
            <>
              <SectionDisclaimer>
                Marketplace listings are user-posted advertisements. Parasphere isn’t a party to any transaction and accepts no liability. Do your own checks, warranties, and payments externally.
              </SectionDisclaimer>
              <div className="mb-3 flex items-center gap-2">
                <Chip active={marketFilter === "All"} onClick={() => setMarketFilter("All")}>
                  All
                </Chip>
                <Chip active={marketFilter === "Product"} onClick={() => setMarketFilter("Product")}>
                  Products
                </Chip>
                <Chip active={marketFilter === "Service"} onClick={() => setMarketFilter("Service")}>
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
                  .filter((m) => (marketFilter === "All" ? true : m.kind === marketFilter))
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((m) => {
                    const cKey = `market:${m.id}`;
                    return (
                      <article key={m.id} className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
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
                        <p className="text-sm text-neutral-300 mt-1">{m.description}</p>
                        <div className="mt-2 text-xs text-neutral-400 flex flex-wrap gap-3">
                          {m.price && <span>💷 £{m.price}</span>}
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
                        {comments[cKey]?.length ? (
                          <div className="mt-2 grid gap-2">
                            {comments[cKey].map((c) => (
                              <div key={c.id} className="rounded-md border border-neutral-800 bg-neutral-950 p-2">
                                <div className="text-xs text-neutral-400">
                                  by <span className="text-cyan-300">{c.authorName}</span> • {new Date(c.createdAt).toLocaleString()}
                                </div>
                                <div className="text-sm text-neutral-200">{c.text}</div>
                                {c.imageUrl && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={c.imageUrl} alt="" className="mt-2 rounded-md border border-neutral-800 max-h-60 w-auto" />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                {market.length === 0 && (
                  <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 text-neutral-400 text-sm">No listings yet.</div>
                )}
              </div>
            </>
          )}

          {/* ------------------------- COLLABORATION ----------------------- */}
          {tab === "collaboration" && (
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
                      <article key={c.id} className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">{c.title}</h3>
                          <StarBadge value={collabStars[c.id] ?? 0} onClick={() => giveCollabStar(c.id)} />
                        </div>
                        {c.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.imageUrl} alt="" className="mt-2 rounded-md border border-neutral-800" />
                        )}
                        {c.description && <p className="text-sm text-neutral-300">{c.description}</p>}
                        <div className="mt-2 text-xs text-neutral-400 flex flex-wrap gap-3">
                          {c.dateISO && <span>🗓 {new Date(c.dateISO).toLocaleString()}</span>}
                          {c.locationText && <span>📍 {c.locationText}</span>}
                          {c.priceText && <span>💷 {c.priceText}</span>}
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
                        {comments[cKey]?.length ? (
                          <div className="mt-2 grid gap-2">
                            {comments[cKey].map((cm) => (
                              <div key={cm.id} className="rounded-md border border-neutral-800 bg-neutral-950 p-2">
                                <div className="text-xs text-neutral-400">
                                  by <span className="text-cyan-300">{cm.authorName}</span> • {new Date(cm.createdAt).toLocaleString()}
                                </div>
                                <div className="text-sm text-neutral-200">{cm.text}</div>
                                {cm.imageUrl && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={cm.imageUrl} alt="" className="mt-2 rounded-md border border-neutral-800 max-h-60 w-auto" />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </article>
                    );
                  })}
                {collabs.length === 0 && (
                  <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 text-neutral-400 text-sm">No collaboration posts yet.</div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ------------------------------ MODALS ------------------------------- */}
      <Modal
        open={postFormOpen}
        onClose={() => {
          setPostFormOpen(false);
          postImgClear();
          setPostTagUsers([]);
          setPostTagLocs([]);
        }}
      >
        <AddPostForm onSubmit={(p) => setPosts((prev) => [p, ...prev])} onClose={() => setPostFormOpen(false)} />
      </Modal>

      <Modal open={locFormOpen} onClose={() => { setLocFormOpen(false); locImgClear(); }}>
        <AddLocationForm onSubmit={(l) => setLocations((prev) => [...prev, l])} onClose={() => setLocFormOpen(false)} />
      </Modal>

      <Modal open={eventFormOpen} onClose={() => { setEventFormOpen(false); evImgClear(); }}>
        <AddEventForm onSubmit={(e) => setEvents((prev) => [...prev, e])} onClose={() => setEventFormOpen(false)} />
      </Modal>

      <Modal open={listingFormOpen} onClose={() => { setListingFormOpen(false); mkImgClear(); }}>
        <AddListingForm onSubmit={(m) => setMarket((prev) => [m, ...prev])} onClose={() => setListingFormOpen(false)} />
      </Modal>

      <Modal open={collabFormOpen} onClose={() => { setCollabFormOpen(false); cbImgClear(); }}>
        <AddCollabForm onSubmit={(c) => setCollabs((prev) => [c, ...prev])} onClose={() => setCollabFormOpen(false)} />
      </Modal>

      {/* Comment dialog (universal) */}
      <Modal
        open={commentOpen}
        onClose={() => {
          setCommentOpen(false);
          setCommentText("");
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
            <div className="text-sm text-neutral-300 mb-1">Attach photo (optional)</div>
            <input type="file" accept="image/*" onChange={cImgChange} className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 w-full" />
            {cImg && (
              <div className="rounded-md border border-neutral-800 bg-neutral-950 p-2 mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cImg} alt="preview" className="max-h-56 w-auto rounded-md border border-neutral-800" />
                <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                  <span className="truncate">{cImgName}</span>
                  <button type="button" onClick={cImgClear} className="text-neutral-300 hover:underline">Remove</button>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="text-sm text-neutral-300 mb-1">Tag friends (optional)</div>
            <div className="flex flex-wrap gap-2">
              {Object.values(users).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() =>
                    setCommentTags((prev) => (prev.includes(u.id) ? prev.filter((x) => x !== u.id) : [...prev, u.id]))
                  }
                  className={`rounded-full border px-3 py-1 text-sm ${
                    commentTags.includes(u.id) ? "border-cyan-500 bg-cyan-500/10 text-cyan-300" : "border-neutral-700 text-neutral-300"
                  }`}
                >
                  {u.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setCommentOpen(false);
                setCommentText("");
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

/* ------------------------------ User Mini type ---------------------------- */
export type UserMini = {
  id: string;
  name: string;
  team?: string;
  location?: string;
};












