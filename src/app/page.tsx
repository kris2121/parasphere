'use client';

import { useMemo, useRef, useState } from "react";
import StickyNav from "@/components/StickyNav";
import FilterBar from "@/components/FilterBar";
import LiveMap, { LocationData, LiveMapHandle } from "@/components/LiveMap";
import LocationDrawer from "@/components/LocationDrawer";
import PostCard, { DemoPost, Comment as PostComment } from "@/components/PostCard";
import AddPostModal from "@/components/AddPostModal";
import AddLocationModal from "@/components/AddLocationModal";
import AddEventModal from "@/components/AddEventModal";
import EventCard from "@/components/EventCard";
import AddListingModal from "@/components/AddListingModal";

export default function Home() {
  const currentUser = { id: 'u_kris', name: 'Kris' };

  const [tab, setTab] = useState<string>("home");
  const [centerSignal, setCenterSignal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [homeView, setHomeView] = useState<'locations' | 'friends'>('locations');

  const mapRef = useRef<LiveMapHandle>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoc, setDrawerLoc] = useState<LocationData | undefined>(undefined);

  // Pins: Hauntings/UFO/Cryptid + Events (type === 'EVENT')
  const [locations, setLocations] = useState<LocationData[]>([
    {
      id: "pendle",
      title: "Pendle Hill",
      type: "HAUNTING",
      lat: 53.856, lng: -2.298,
      imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
      summary: "Famous Lancashire haunting hotspot. Whispers, footsteps, cold spots.",
      address: "Pendle Hill, Lancashire BB7",
      what3words: "witches.shadows.whispers",
      openingHours: "Open 24/7",
      priceInfo: "Free",
      website: "https://www.visitlancashire.com/",
      uploader: { id: "u_scott", name: "Scott" },
    },
    {
      id: "bodmin",
      title: "Beast of Bodmin",
      type: "CRYPTID",
      lat: 50.498, lng: -4.668,
      imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
      summary: "Large cat sightings and tracks reported on the moor.",
      openingHours: "Open 24/7",
      priceInfo: "Free",
      uploader: { id: "u_andy", name: "Andy" },
    },
    {
      id: "snowdonia",
      title: "Snowdonia Ridge Lights",
      type: "UFO",
      lat: 53.068, lng: -4.076,
      imageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop",
      summary: "Fast zigzag lights, no sound. Multiple witnesses.",
      uploader: { id: "u_jay", name: "Jay" },
    },
    // Demo event
    {
      id: "ev_msb_overnight",
      title: "Mill Street Barracks — Overnight Investigation",
      type: "EVENT",
      lat: 53.389, lng: -2.881,
      imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
      summary: "Small group ghost hunt with guided sessions and free roam.",
      address: "Mill St, St Helens, WA10",
      eventStartISO: "2025-12-05T20:00:00",
      eventEndISO: "2025-12-06T02:00:00",
      priceInfo: "£35 pp",
      website: "https://example.com/tickets",
      uploader: { id: "u_kris", name: "Kris" },
      stars: 3,
      myStarred: false,
      comments: [
        { id: 'ec1', authorId: 'u_scott', authorName: 'Scott', text: 'Great hosts, lots of activity near the cells.' }
      ],
    },
  ]);

  const demoFriends = ['Scott', 'Jay', 'Andy', 'Ian', 'Kris'];

  // Posts include normal posts, plus Marketplace using type: "For Sale" | "Wanted" | "Service"
  const [posts, setPosts] = useState<DemoPost[]>([
    {
      id: 'p1',
      authorId: 'u_scott',
      authorName: 'Scott',
      type: "Post • Haunting",
      title: "Pendle Hill Shadow Figure",
      desc: "While filming near the stile at Pendle Hill, a dark shape crossed the path and vanished into the mist. EMF spiked to 8.7mG.",
      evidence: "K2 meter spike, captured still image shows faint silhouette.",
      locationId: "pendle",
      imageDataUrl: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?q=80&w=800&auto=format&fit=crop",
      videoUrls: ["https://youtu.be/0e3GPea1Tyg"],
      taggedFriends: ["Jay"],
      stars: 12,
      myStarred: false,
      comments: [
        { id: 'c1', authorId: 'u_jay',   authorName: 'Jay',   text: 'I saw the same shape near the stile last month.' },
        { id: 'c2', authorId: 'u_kris',  authorName: 'Kris',  text: 'EMF 8.7mG is wild. Any temperature drop?' },
      ],
    },
    // Marketplace demo listing:
    {
      id: 'm1',
      authorId: 'u_andy',
      authorName: 'Andy',
      type: "For Sale",
      title: "SB7 Spirit Box — mint condition",
      desc: "Lightly used, includes earbud and case. Collection preferred, can post for extra.",
      evidence: "Excellent • Boxed",          // using 'evidence' as 'condition' for demo
      imageDataUrl: "https://images.unsplash.com/photo-1520894787417-1a8a3dd4a37b?q=80&w=800&auto=format&fit=crop",
      videoUrls: ["mailto:andy@example.com"], // contact link (email/URL)
      taggedFriends: ["andy@example.com"],    // display contact text
      stars: 85,                              // using 'stars' to display £ price (demo)
      myStarred: false,
      comments: [],
    },
    {
      id: 'm2',
      authorId: 'u_jay',
      authorName: 'Jay',
      type: "Service",
      title: "Paranormal Video Editing (DaVinci / Premiere)",
      desc: "Fast turnaround, noise reduction, titles, YouTube optimization. UK based, remote available.",
      evidence: "Service • Video Editing",
      imageDataUrl: "https://images.unsplash.com/photo-1552858725-0319de85f3fb?q=80&w=800&auto=format&fit=crop",
      videoUrls: ["mailto:jay@example.com"],
      taggedFriends: ["jay@example.com"],
      stars: 0,
      myStarred: false,
      comments: [],
    },
    {
      id: 'm3',
      authorId: 'u_andy',
      authorName: 'Andy',
      type: "Wanted",
      title: "Looking for FLIR One thermal cam",
      desc: "UK seller preferred. Budget up to £150 depending on condition.",
      evidence: "Any working condition",
      videoUrls: ["mailto:andy@example.com"],
      taggedFriends: ["andy@example.com"],
      stars: 0,
      myStarred: false,
      comments: [],
    },
  ]);

  const matchesQuery = (s?: string) =>
    !searchQuery || (s ?? '').toLowerCase().includes(searchQuery.toLowerCase());

  // Map filters per tab
  function allowedTypesForTab(t: string): Array<LocationData['type']> | null {
    if (t === 'hauntings') return ['HAUNTING'];
    if (t === 'ufos') return ['UFO'];
    if (t === 'cryptids') return ['CRYPTID'];
    if (t === 'events') return ['EVENT'];
    return null; // home/marketplace/collab show all pins
  }
  const allowed = allowedTypesForTab(tab);

  const filteredLocations = useMemo(() => {
    const byTab = allowed ? locations.filter(l => allowed.includes(l.type)) : locations;
    return byTab.filter(l =>
      matchesQuery(l.title) || matchesQuery(l.summary) || matchesQuery(l.address)
    );
  }, [allowed, locations, searchQuery]);

  function openFromPin(loc: LocationData) { setDrawerLoc(loc); setDrawerOpen(true); }
  function viewOnMap(locationId?: string) {
    if (!locationId) return;
    const loc = locations.find(l => l.id === locationId); if (!loc) return;
    mapRef.current?.focusOn(loc.lng, loc.lat, 9);
    openFromPin(loc);
  }

  // Feed: select posts per tab
  const visiblePosts = useMemo(() => {
    let list = posts;
    if (tab === 'hauntings') list = list.filter(p => p.type.includes('Haunting'));
    else if (tab === 'ufos') list = list.filter(p => p.type.toLowerCase().includes('ufo'));
    else if (tab === 'cryptids') list = list.filter(p => p.type.toLowerCase().includes('cryptid'));
    else if (tab === 'marketplace') list = list.filter(p => p.type === 'For Sale' || p.type === 'Wanted' || p.type === 'Service');
    else if (tab === 'collaboration') list = list.filter(p => p.type === 'Friend • Post');
    else if (tab === 'home')
      list = list.filter(p => (homeView === 'locations' ? Boolean(p.locationId) : p.type.toLowerCase().includes('friend')));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.desc?.toLowerCase().includes(q) ||
        p.taggedFriends?.some(n => n.toLowerCase().includes(q)) ||
        p.authorName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [posts, tab, homeView, searchQuery]);

  // Events list for Events tab feed (sorted: upcoming first, ended sink)
  const now = new Date();
  const eventCards = useMemo(() => {
    const evs = locations.filter(l => l.type === 'EVENT').filter(l =>
      matchesQuery(l.title) || matchesQuery(l.summary) || matchesQuery(l.address)
    );
    const toTime = (iso?: string) => (iso ? new Date(iso).getTime() : 0);
    return evs.sort((a, b) => {
      const aStart = toTime(a.eventStartISO);
      const bStart = toTime(b.eventStartISO);
      const aEnded = (a.eventEndISO ? toTime(a.eventEndISO) : aStart) < now.getTime();
      const bEnded = (b.eventEndISO ? toTime(b.eventEndISO) : bStart) < now.getTime();
      if (aEnded !== bEnded) return aEnded ? 1 : -1;
      return aStart - bStart;
    });
  }, [locations, searchQuery]);

  // Post creation/edit
  const [postOpen, setPostOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  function addOrEditPost(data: {
    locationId: string;
    title: string;
    whatHappened: string;
    evidence?: string;
    imageDataUrl?: string;
    videoUrls: string[];
    taggedFriends: string[];
  }) {
    const loc = locations.find(l => l.id === data.locationId);
    const typeLabel =
      loc?.type === 'HAUNTING' ? 'Post • Haunting' :
      loc?.type === 'UFO'      ? 'Post • UFO' :
      loc?.type === 'CRYPTID'  ? 'Post • Cryptid' :
      'Friend • Post';

    const base: DemoPost = {
      id: crypto.randomUUID(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      type: typeLabel as DemoPost['type'],
      title: data.title,
      desc: data.whatHappened,
      evidence: data.evidence,
      locationId: data.locationId,
      imageDataUrl: data.imageDataUrl,
      videoUrls: data.videoUrls,
      taggedFriends: data.taggedFriends,
      stars: 0,
      myStarred: false,
      comments: [],
    };

    setPosts(prev => {
      if (editIndex !== null) {
        const arr = [...prev];
        const keep = arr[editIndex];
        arr[editIndex] = { ...base, id: keep.id, stars: keep.stars, myStarred: keep.myStarred, comments: keep.comments };
        return arr;
      }
      return [base, ...prev];
    });

    setEditIndex(null);
    viewOnMap(data.locationId);
  }
  function startEdit(index: number) {
    if (posts[index].authorId !== currentUser.id) return; // only author can edit (demo)
    setEditIndex(index);
    setPostOpen(true);
  }

  // Stars & comments for posts
  function toggleStarPost(index: number) {
    setPosts(prev => {
      const arr = [...prev];
      const p = { ...arr[index] };
      const on = !!p.myStarred;
      p.myStarred = !on;
      p.stars = Math.max(0, (p.stars ?? 0) + (on ? -1 : 1));
      arr[index] = p;
      return arr;
    });
  }
  function addCommentPost(index: number, text: string) {
    setPosts(prev => {
      const arr = [...prev];
      const p = { ...arr[index] };
      const c: PostComment = { id: crypto.randomUUID(), authorId: currentUser.id, authorName: currentUser.name, text };
      p.comments = [...(p.comments ?? []), c];
      arr[index] = p;
      return arr;
    });
  }
  function deleteCommentPost(index: number, commentId: string) {
    setPosts(prev => {
      const arr = [...prev];
      const p = { ...arr[index] };
      const c = (p.comments ?? []).find(x => x.id === commentId);
      if (!c) return prev;
      if (c.authorId !== currentUser.id && p.authorId !== currentUser.id) return prev;
      p.comments = (p.comments ?? []).filter(x => x.id !== commentId);
      arr[index] = p;
      return arr;
    });
  }

  // Stars & comments for events (stored on the location item)
  function toggleStarEvent(evId: string) {
    setLocations(prev => prev.map(l => {
      if (l.id !== evId) return l;
      const on = !!l.myStarred;
      const stars = Math.max(0, (l.stars ?? 0) + (on ? -1 : 1));
      return { ...l, myStarred: !on, stars };
    }));
  }
  function addCommentEvent(evId: string, text: string) {
    setLocations(prev => prev.map(l => {
      if (l.id !== evId) return l;
      const comments = [...(l.comments ?? []), { id: crypto.randomUUID(), authorId: currentUser.id, authorName: currentUser.name, text }];
      return { ...l, comments };
    }));
  }
  function deleteCommentEvent(evId: string, commentId: string) {
    setLocations(prev => prev.map(l => {
      if (l.id !== evId) return l;
      const c = (l.comments ?? []).find(x => x.id === commentId);
      if (!c) return l;
      if (c.authorId !== currentUser.id && l.uploader?.id !== currentUser.id) return l;
      return { ...l, comments: (l.comments ?? []).filter(x => x.id !== commentId) };
    }));
  }

  // Add Location / Event / Listing modals
  const [addLocOpen, setAddLocOpen] = useState(false);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [addListingOpen, setAddListingOpen] = useState(false);

  function addLocation(loc: LocationData) { setLocations(prev => [loc, ...prev]); }
  function addEvent(ev: LocationData) { setLocations(prev => [ev, ...prev]); }
  function addListing(data: {
    type: 'For Sale' | 'Wanted' | 'Service';
    title: string;
    description: string;
    price?: number;
    condition?: string;
    imageDataUrl?: string;
    contactText?: string;
    contactLink?: string;
    locationId?: string;
  }) {
    setPosts(prev => [{
      id: crypto.randomUUID(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      type: data.type,
      title: data.title,
      desc: data.description,
      evidence: data.condition,
      imageDataUrl: data.imageDataUrl,
      videoUrls: data.contactLink ? [data.contactLink] : [],
      taggedFriends: data.contactText ? [data.contactText] : [],
      locationId: data.locationId,
      stars: typeof data.price === 'number' ? data.price : 0, // price shown as £ in UI
      myStarred: false,
      comments: [],
    }, ...prev]);
  }

  // Drawer helpers
  const postsForDrawer = useMemo(
    () => posts.filter(p => p.locationId && drawerLoc && p.locationId === drawerLoc.id),
    [posts, drawerLoc]
  );

  function handleMessageUploader(uploaderId: string) { alert(`(demo) Message to uploader id: ${uploaderId}`); }
  function handleReport(locationId: string) { alert(`(demo) Report submitted for location: ${locationId}`); }
  function handleBlock(uploaderId: string) { alert(`(demo) Blocked uploader: ${uploaderId}`); }

  return (
    <main className="min-h-screen bg-[#0B0C0E] text-white">
      <StickyNav search={searchQuery} onSearchChange={setSearchQuery} />
      <FilterBar current={tab} onSelect={setTab} />

      {/* Map + overlay actions */}
      <div className="relative">
        <LiveMap
          ref={mapRef}
          centerSignal={centerSignal}
          locations={filteredLocations}
          onOpen={openFromPin}
        />

        {/* TOP-RIGHT overlay buttons */}
        <div className="absolute right-3 top-3 z-[60] flex flex-col items-end gap-2 pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <button
              onClick={() => setCenterSignal(n => n + 1)}
              className="rounded-full border border-cyan-500 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300 hover:bg-cyan-500/20"
              title="Center on me"
            >
              ⦿ Center
            </button>
            <button
              onClick={() => setAddLocOpen(true)}
              className="rounded-full border border-yellow-400 bg-yellow-400/10 px-4 py-2 text-sm text-yellow-300 hover:bg-yellow-400/20"
              title="Add a new location"
            >
              + Add location
            </button>
            <button
              onClick={() => setAddEventOpen(true)}
              className="rounded-full border border-purple-500 bg-purple-500/10 px-4 py-2 text-sm text-purple-300 hover:bg-purple-500/20"
              title="Add an event"
            >
              + Add event
            </button>
          </div>
        </div>
      </div>

      <LocationDrawer
        open={drawerOpen}
        location={drawerLoc}
        postsForLocation={postsForDrawer}
        onClose={() => setDrawerOpen(false)}
        onMessageUploader={handleMessageUploader}
        onReport={handleReport}
        onBlock={handleBlock}
      />

      {/* FEED */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        {tab === 'home' && (
          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={() => setHomeView('locations')}
              className={`rounded-md border px-3 py-1 text-sm ${homeView === 'locations'
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-neutral-700 hover:border-neutral-600'}`}
            >
              ❤️ Locations
            </button>
            <button
              onClick={() => setHomeView('friends')}
              className={`rounded-md border px-3 py-1 text-sm ${homeView === 'friends'
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-neutral-700 hover:border-neutral-600'}`}
            >
              👋 Friends
            </button>
          </div>
        )}

        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            {tab === 'home'
              ? homeView === 'locations'
                ? '❤️ Favourite Locations — newest first'
                : '👋 Friends Activity — newest first'
              : tab === 'events'
                ? '🟣 Events — upcoming first'
                : tab === 'marketplace'
                ? '🛒 Marketplace — community listings'
                : tabLabel(tab)}
          </h1>

          {tab === 'marketplace' ? (
            <button
              onClick={() => setAddListingOpen(true)}
              className="rounded-md border border-yellow-500 bg-yellow-500/10 px-3 py-1.5 text-sm text-yellow-300 hover:bg-yellow-500/20"
            >
              + New listing
            </button>
          ) : (
            <button
              onClick={() => { setEditIndex(null); setPostOpen(true); }}
              className="rounded-md border border-cyan-600 bg-cyan-500/10 px-3 py-1.5 text-sm hover:bg-cyan-500/20"
            >
              + New post
            </button>
          )}
        </div>

        <div className="grid gap-4">
          {tab === 'events' ? (
            // EVENTS FEED
            eventCards.length === 0 ? (
              <div className="text-sm text-neutral-400 border border-neutral-800 rounded-lg px-4 py-6">
                No events yet. Add one with the button on the map.
              </div>
            ) : (
              eventCards.map((ev) => (
                <EventCard
                  key={ev.id}
                  ev={ev}
                  currentUserId={currentUser.id}
                  onViewOnMap={viewOnMap}
                  onToggleStar={() => toggleStarEvent(ev.id)}
                  onAddComment={(text) => addCommentEvent(ev.id, text)}
                  onDeleteComment={(cid) => deleteCommentEvent(ev.id, cid)}
                />
              ))
            )
          ) : tab === 'marketplace' ? (
            // MARKETPLACE FEED
            <div className="space-y-4">
              {/* Disclaimer */}
              <div className="rounded-lg border border-yellow-600 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
                ⚠️ <strong>Disclaimer:</strong> Parasphere provides this marketplace solely for community listings.
                All sales, trades, and purchases are handled privately between users. Parasphere assumes no liability
                for transactions, product authenticity, payment disputes, or delivery issues. Do your own due diligence.
              </div>

              {/* Listings */}
              {visiblePosts.length === 0 ? (
                <div className="text-sm text-neutral-400 border border-neutral-800 rounded-lg px-4 py-6">
                  No marketplace listings yet. Be the first to post equipment, services, or wanted ads.
                </div>
              ) : (
                visiblePosts.map((post, i) => (
                  <div
                    key={post.id ?? i}
                    className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 hover:border-neutral-700 transition"
                  >
                    <div className="flex flex-col sm:flex-row gap-3">
                      {post.imageDataUrl && (
                        <img
                          src={post.imageDataUrl}
                          alt=""
                          className="w-full sm:w-48 h-40 object-cover rounded-md border border-neutral-800"
                        />
                      )}
                      <div className="flex-1">
                        <div className="text-xs text-yellow-300">{post.type}</div>
                        <h3 className="text-lg font-semibold text-neutral-100">{post.title}</h3>
                        <p className="text-neutral-300 text-sm mt-1">{post.desc}</p>

                        {/* Condition/Category + Price + Contact/Link */}
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          {post.evidence && (
                            <span className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1">
                              {post.type === 'Service' ? 'Category' : 'Condition'}: {post.evidence}
                            </span>
                          )}
                          {post.type !== 'Service' && post.stars ? (
                            <span className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1">
                              💰 Price: £{post.stars}
                            </span>
                          ) : null}
                          {post.videoUrls?.[0] && (
                            <a
                              href={post.videoUrls[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-cyan-300 hover:border-neutral-600"
                            >
                              🔗 Contact / Link
                            </a>
                          )}
                          {post.locationId && (
                            <button
                              onClick={() => viewOnMap(post.locationId)}
                              className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 hover:border-neutral-600"
                            >
                              📍 View on Map
                            </button>
                          )}
                        </div>

                        {/* Comments + edit/star kept consistent via PostCard */}
                        <div className="mt-3">
                          <PostCard
                            post={post}
                            currentUserId={currentUser.id}
                            onViewOnMap={viewOnMap}
                            onEdit={() => startEdit(i)}
                            onToggleStar={() => toggleStarPost(i)}
                            onAddComment={(text) => addCommentPost(i, text)}
                            onDeleteComment={(commentId) => deleteCommentPost(i, commentId)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // OTHER TABS FEED
            visiblePosts.length === 0 ? (
              <div className="text-sm text-neutral-400 border border-neutral-800 rounded-lg px-4 py-6">
                No results. Try a different search.
              </div>
            ) : (
              visiblePosts.map((post, i) => (
                <PostCard
                  key={post.id ?? i}
                  post={post}
                  currentUserId={currentUser.id}
                  onViewOnMap={viewOnMap}
                  onEdit={() => startEdit(i)}
                  onToggleStar={() => toggleStarPost(i)}
                  onAddComment={(text) => addCommentPost(i, text)}
                  onDeleteComment={(commentId) => deleteCommentPost(i, commentId)}
                />
              ))
            )
          )}
        </div>
      </section>

      {/* Modals */}
      {postOpen && (
        <AddPostModal
          open={postOpen}
          onClose={() => { setPostOpen(false); setEditIndex(null); }}
          onSubmit={addOrEditPost}
          locations={locations}
          friends={demoFriends}
          {...(editIndex !== null ? { existing: posts[editIndex] } : {})}
        />
      )}
      {addLocOpen && (
        <AddLocationModal
          open={addLocOpen}
          onClose={() => setAddLocOpen(false)}
          onSubmit={addLocation}
          currentUserId={currentUser.id}
          currentUserName={currentUser.name}
          defaultCenter={{ lat: 54.3, lng: -2.5 }}
        />
      )}
      {addEventOpen && (
        <AddEventModal
          open={addEventOpen}
          onClose={() => setAddEventOpen(false)}
          onSubmit={addEvent}
          currentUserId={currentUser.id}
          currentUserName={currentUser.name}
          defaultCenter={{ lat: 54.3, lng: -2.5 }}
        />
      )}
      {addListingOpen && (
        <AddListingModal
          open={addListingOpen}
          onClose={() => setAddListingOpen(false)}
          onSubmit={addListing}
          locations={locations}
        />
      )}
    </main>
  );
}

function tabLabel(t: string) {
  const labels: Record<string, string> = {
    hauntings: "Hauntings — newest first",
    ufos: "UFOs — newest first",
    cryptids: "Cryptids — newest first",
    events: "Events near you",
    marketplace: "Marketplace — latest posts",
    collaboration: "Collaboration — teams & shared projects",
    search: "Search results",
    profile: "Your profile",
  };
  return labels[t] ?? "Feed";
}
