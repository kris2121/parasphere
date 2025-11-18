'use client';

import React, {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ScopeProvider,
  useScope,
  useCountries,
} from '@/components/ParaverseScope';

import type {
  DemoPost,
  MarketplaceItem,
  EventItem,
  CollabItem,
  Comment,
  NotificationItem,
  DMMessage,
  DMThread,
  SocialLink,
} from '@/types/paraverse';

import type { TabKey } from '@/components/ParaverseTopBar';
import type { LocationData, LiveMapHandle } from '@/components/LiveMap';
import type { UserMini } from '@/components/UserDrawer';

import MapShell from '@/components/MapShell';
import ParaverseHeader from '@/components/ParaverseHeader';

import HomeSection from '@/components/sections/HomeSection';
import EventsSection from '@/components/sections/EventsSection';
import MarketplaceSection from '@/components/sections/MarketplaceSection';
import CollabSection from '@/components/sections/CollabSection';
import LocationsSection from '@/components/sections/LocationsSection';
import ProfileHubSection from '@/components/sections/ProfileHubSection';

import LocationForm from '@/components/modals/LocationForm';
import PostForm from '@/components/modals/PostForm';
import EventForm from '@/components/modals/EventForm';
import MarketplaceForm from '@/components/MarketplaceForm';
import CollaborationForm from '@/components/CollaborationForm';
import CommentForm from '@/components/modals/CommentForm';

import { useImagePreview } from '@/hooks/useImagePreview';
import Modal from '@/components/Modal';
import DMModal from '@/components/modals/DMModal';
import { geocodePostal } from '@/lib/geocodePostal';
import { minutesAgo, formatShortDate } from '@/lib/dateUtils';

/* ========================================================================== */
/*  MAIN PAGE WRAPPER                                                         */
/* ========================================================================== */

export default function Page() {
  return (
    <ScopeProvider>
      <PageInner />
    </ScopeProvider>
  );
}

/* ========================================================================== */
/*  PAGE INNER                                                                */
/* ========================================================================== */

function PageInner() {
  /* ------------------------------------------------------------------------ */
  /*  USER                                                                    */
  /* ------------------------------------------------------------------------ */

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    avatarUrl?: string;
  }>({
    id: 'u_current',
    name: 'You',
  });

  const [usersById, setUsersById] = useState<Record<string, UserMini>>({
    u_current: { id: 'u_current', name: 'You' },
  });

  /* ------------------------------------------------------------------------ */
  /*  GLOBAL IMAGE LIGHTBOX                                                   */
  /* ------------------------------------------------------------------------ */

  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /*  TABS, MAP, DRAWERS                                                      */
  /* ------------------------------------------------------------------------ */

  const [tab, setTab] = useState<TabKey>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef<LiveMapHandle>(null);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoc, setDrawerLoc] = useState<LocationData | undefined>(
    undefined,
  );
  const [drawerKind, setDrawerKind] = useState<
    'HAUNTING' | 'EVENT' | 'COLLAB' | null
  >(null);

  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [drawerUser, setDrawerUser] = useState<UserMini | undefined>(undefined);

  /* ------------------------------------------------------------------------ */
  /*  STAR COUNTS                                                             */
  /* ------------------------------------------------------------------------ */

  const [locationStars, setLocationStars] = useState<Record<string, number>>(
    {},
  );
  const [starredLocations, setStarredLocations] = useState<string[]>([]);

  const giveLocationStar = (locId: string) => {
    setStarredLocations((prev) => {
      if (prev.includes(locId)) return prev;

      setLocationStars((current) => ({
        ...current,
        [locId]: (current[locId] ?? 0) + 1,
      }));

      return [...prev, locId];
    });
  };

  const [userStars, setUserStars] = useState<Record<string, number>>({});
  const giveUserStar = (userId: string) =>
    setUserStars((prev) => ({
      ...prev,
      [userId]: (prev[userId] ?? 0) + 1,
    }));

  /* ------------------------------------------------------------------------ */
  /*  DATA ARRAYS                                                             */
  /* ------------------------------------------------------------------------ */

  const [locations, setLocations] = useState<LocationData[]>([]);
  const [posts, setPosts] = useState<DemoPost[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [market, setMarket] = useState<MarketplaceItem[]>([]);
  const [collabs, setCollabs] = useState<CollabItem[]>([]);

  function updateEvent(id: string, patch: Partial<EventItem>) {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev)),
    );
  }

  function deleteEvent(id: string) {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  }

  const [editingListing, setEditingListing] =
    useState<MarketplaceItem | null>(null);

  const [marketFilter, setMarketFilter] = useState<
    'All' | 'Product' | 'Service'
  >('Product');

  /* ------------------------------------------------------------------------ */
  /*  COMMENTS SYSTEM                                                         */
  /* ------------------------------------------------------------------------ */

  const [comments, setComments] = useState<Record<string, Comment[]>>({});

  function addComment(key: string, c: Comment) {
    setComments((prev) => ({ ...prev, [key]: [c, ...(prev[key] ?? [])] }));
  }

  function updateComment(key: string, id: string, patch: Partial<Comment>) {
    setComments((prev) => {
      const arr = prev[key] ?? [];
      return {
        ...prev,
        [key]: arr.map((c) => (c.id === id ? { ...c, ...patch } : c)),
      };
    });
  }

  function deleteComment(key: string, id: string) {
    setComments((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((x) => x.id !== id),
    }));
  }

  function canEditComment(c: Comment) {
    return c.authorId === currentUser.id;
  }

  const [commentOpen, setCommentOpen] = useState(false);
  const [commentKey, setCommentKey] = useState<string | null>(null);
  const [activeReplyParentId, setActiveReplyParentId] = useState<string | null>(
    null,
  );
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);

  const [commentText, setCommentText] = useState('');
  const [commentTags, setCommentTags] = useState<string[]>([]);

  const {
    url: cImg,
    name: cImgName,
    onChange: cImgChange,
    clear: cImgClear,
  } = useImagePreview();

  function openComment(forKey: string, parentId?: string) {
    setCommentKey(forKey);
    setActiveReplyParentId(parentId ?? null);
    setEditingCommentId(null);
    setCommentOpen(true);
    setCommentText('');
    setCommentTags([]);
    cImgClear();
  }

  function openEditComment(forKey: string, commentId: string) {
    const arr = comments[forKey] ?? [];
    const target = arr.find((c) => c.id === commentId) || null;

    setCommentKey(forKey);
    setActiveReplyParentId(null);
    setEditingCommentId(commentId);

    if (target) {
      setCommentText(target.text ?? '');
      setCommentTags(target.tagUserIds ?? []);
    } else {
      setCommentText('');
      setCommentTags([]);
    }

    cImgClear();
    setCommentOpen(true);
  }

  function resetCommentState() {
    setCommentOpen(false);
    setCommentKey(null);
    setActiveReplyParentId(null);
    setEditingCommentId(null);
    setCommentTags([]);
    setCommentText('');
    cImgClear();
  }

  function submitComment() {
    if (!commentKey) return;

    const trimmed = commentText.trim();
    if (!trimmed && !cImg) return;

    if (editingCommentId) {
      updateComment(commentKey, editingCommentId, {
        text: trimmed,
        imageUrl: cImg,
        tagUserIds: commentTags,
      });
    } else {
      addComment(commentKey, {
        id: crypto.randomUUID(),
        text: trimmed,
        authorId: currentUser.id,
        authorName: currentUser.name,
        createdAt: Date.now(),
        parentId: activeReplyParentId,
        imageUrl: cImg,
        tagUserIds: commentTags,
      });
    }

    resetCommentState();
  }

  const locationReviews = useMemo(() => {
    if (!drawerLoc) return [];
    const reviewKey = `loc:${drawerLoc.id}`;
    return comments[reviewKey] ?? [];
  }, [drawerLoc, comments]);

  /* ------------------------------------------------------------------------ */
  /*  DM SYSTEM                                                               */
  /* ------------------------------------------------------------------------ */

  const [dmOpen, setDmOpen] = useState(false);
  const [dmRecipientId, setDmRecipientId] = useState<string | null>(null);
  const [dmRecipientName, setDmRecipientName] = useState<string | null>(null);
  const [dmText, setDmText] = useState('');

  function markThreadRead(fromUserId: string) {
    setDmThreads((prev) =>
      prev.map((t) => {
        if (t.otherUser.id !== fromUserId) return t;
        return {
          ...t,
          messages: t.messages.map((m) =>
            m.fromUserId === fromUserId && m.toUserId === currentUser.id
              ? { ...m, read: true }
              : m,
          ),
        };
      }),
    );
  }

  function addDmMessage(toUserId: string, text: string) {
    const nowIso = new Date().toISOString();

    setDmThreads((prev) => {
      let found = false;

      const updated = prev.map((t) => {
        if (t.otherUser.id !== toUserId) return t;
        found = true;
        const msg: DMMessage = {
          id: crypto.randomUUID(),
          threadId: t.id,
          fromUserId: currentUser.id,
          toUserId,
          text,
          createdAt: nowIso,
          read: false,
        };
        return {
          ...t,
          lastMessageAt: nowIso,
          messages: [...t.messages, msg],
        };
      });

      if (found) return updated;

      const threadId = crypto.randomUUID();
      const other = usersById[toUserId] ?? { id: toUserId, name: 'User' };
      const msg: DMMessage = {
        id: crypto.randomUUID(),
        threadId,
        fromUserId: currentUser.id,
        toUserId,
        text,
        createdAt: nowIso,
        read: false,
      };

      return [
        ...updated,
        {
          id: threadId,
          otherUser: {
            id: other.id,
            name: other.name,
            avatarUrl: other.avatarUrl,
          },
          lastMessageAt: nowIso,
          messages: [msg],
        },
      ];
    });
  }

  function openDM(userId: string) {
    const u = usersById[userId];
    setDmRecipientId(userId);
    setDmRecipientName(u?.name ?? 'User');
    setDmText('');
    setDmOpen(true);
    markThreadRead(userId);
  }

  function resetDM() {
    setDmOpen(false);
    setDmRecipientId(null);
    setDmRecipientName(null);
    setDmText('');
  }

  function handleSendDM(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const t = dmText.trim();
    if (!t || !dmRecipientId) return;
    addDmMessage(dmRecipientId, t);
    resetDM();
  }

  /* ------------------------------------------------------------------------ */
  /*  FOLLOW / FAVS                                                           */
  /* ------------------------------------------------------------------------ */

  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [followedLocations, setFollowedLocations] = useState<string[]>([]);

  useEffect(() => {
    try {
      setFollowedUsers(
        JSON.parse(localStorage.getItem('ps_follow_users') || '[]'),
      );
      setFollowedLocations(
        JSON.parse(localStorage.getItem('ps_follow_locs') || '[]'),
      );
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ps_follow_users', JSON.stringify(followedUsers));
  }, [followedUsers]);

  useEffect(() => {
    localStorage.setItem('ps_follow_locs', JSON.stringify(followedLocations));
  }, [followedLocations]);

  const toggleFollowUser = (userId: string) =>
    setFollowedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );

  const toggleFollowLocation = (locId: string) =>
    setFollowedLocations((prev) =>
      prev.includes(locId)
        ? prev.filter((id) => id !== locId)
        : [...prev, locId],
    );

  /* ------------------------------------------------------------------------ */
  /*  FEED FILTER                                                             */
  /* ------------------------------------------------------------------------ */

  const [feedFilter, setFeedFilter] = useState<
    'favLocations' | 'favUsers' | 'all'
  >('all');

  const filteredPosts = useMemo(() => {
    switch (feedFilter) {
      case 'favLocations':
        return posts.filter(
          (p) => p.locationId && followedLocations.includes(p.locationId),
        );
      case 'favUsers':
        return posts.filter((p) => followedUsers.includes(p.authorId));
      default:
        return posts;
    }
  }, [feedFilter, posts, followedLocations, followedUsers]);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );

  const [profileFilter, setProfileFilter] = useState<
    'posts' | 'events' | 'marketplace' | 'collabs' | 'messages'
  >('posts');

  /* ------------------------------------------------------------------------ */
  /*  NOTIFICATIONS + MESSAGES STATE                                          */
  /* ------------------------------------------------------------------------ */

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      kind: 'comment_reply',
      createdAt: minutesAgo(5),
      read: false,
      actor: {
        id: 'u_demo_2',
        name: 'Haunted Helen',
      },
      text: 'replied to your post at Mill Street Barracks.',
      target: { type: 'post', id: 'post-demo-1' },
    },
    {
      id: 'n2',
      kind: 'tagged_in_comment',
      createdAt: minutesAgo(35),
      read: false,
      actor: {
        id: 'u_demo_3',
        name: 'GhostHunter99',
      },
      text: 'tagged you in a comment on a marketplace listing.',
      target: { type: 'marketplace', id: 'market-demo-1' },
    },
    {
      id: 'n3',
      kind: 'follow',
      createdAt: minutesAgo(120),
      read: true,
      actor: {
        id: 'u_demo_4',
        name: 'NightWatchTeam',
      },
      text: 'started following your profile.',
      target: { type: 'profile', id: 'u_current' },
    },
  ]);

  const [dmThreads, setDmThreads] = useState<DMThread[]>([
    {
      id: 't1',
      otherUser: {
        id: 'u_demo_5',
        name: 'Graveyard Shift',
      },
      lastMessageAt: minutesAgo(10),
      messages: [
        {
          id: 'm1',
          threadId: 't1',
          fromUserId: 'u_demo_5',
          toUserId: 'u_current',
          text: 'Hey, fancy teaming up at Newsham Park soon?',
          createdAt: minutesAgo(15),
          read: true,
        },
        {
          id: 'm2',
          threadId: 't1',
          fromUserId: 'u_current',
          toUserId: 'u_demo_5',
          text: 'Yeah, that sounds great – I’m free next month.',
          createdAt: minutesAgo(10),
          read: true,
        },
      ],
    },
    {
      id: 't2',
      otherUser: {
        id: 'u_demo_6',
        name: 'SpiritBoxTV',
      },
      lastMessageAt: minutesAgo(60),
      messages: [
        {
          id: 'm3',
          threadId: 't2',
          fromUserId: 'u_demo_6',
          toUserId: 'u_current',
          text: 'Can we cross-promote our events on Paraverse?',
          createdAt: minutesAgo(60),
          read: false,
        },
      ],
    },
  ]);

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const unreadDmCount = useMemo(
    () =>
      dmThreads.reduce((acc, t) => {
        const unreadInThread = t.messages.filter(
          (m) => !m.read && m.toUserId === currentUser.id,
        ).length;
        return acc + unreadInThread;
      }, 0),
    [dmThreads, currentUser.id],
  );

  const sortedNotifications = useMemo(
    () =>
      [...notifications].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [notifications],
  );

  const sortedDmThreads = useMemo(
    () =>
      [...dmThreads].sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() -
          new Date(a.lastMessageAt).getTime(),
      ),
    [dmThreads],
  );

  function handleNotificationClick(n: NotificationItem) {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === n.id ? { ...item, read: true } : item,
      ),
    );

    if (!n.target) return;

    switch (n.target.type) {
      case 'post':
        setTab('home');
        setSelectedUserId(null);
        break;
      case 'event':
        setTab('events');
        setSelectedUserId(null);
        break;
      case 'marketplace':
        setTab('marketplace');
        setSelectedUserId(null);
        break;
      case 'collab':
        setTab('collaboration');
        setSelectedUserId(null);
        break;
      case 'profile':
        openUser(n.target.id);
        break;
      default:
        break;
    }
  }

  /* ------------------------------------------------------------------------ */
  /*  TAB SWITCHING                                                           */
  /* ------------------------------------------------------------------------ */

  function handleSelectTab(next: TabKey) {
    if (next === 'profile') {
      openUser(currentUser.id);
      return;
    }
    setTab(next);
    setSelectedUserId(null);
  }

  /* ------------------------------------------------------------------------ */
  /*  MAP LOCATIONS                                                           */
  /* ------------------------------------------------------------------------ */

  const matchesQuery = (s?: string) =>
    !searchQuery ||
    (s || '').toLowerCase().includes(searchQuery.toLowerCase());

  const mapLocations = useMemo(
    () =>
      locations.filter((l) => {
        if (!(matchesQuery(l.title) || matchesQuery(l.summary))) {
          return false;
        }
        if (tab === 'events') return l.type === 'EVENT';
        if (tab === 'collaboration') return l.type === 'COLLAB';

        if (
          tab === 'home' ||
          tab === 'locations' ||
          tab === 'marketplace'
        ) {
          return l.type === 'HAUNTING';
        }

        return l.type === 'HAUNTING';
      }),
    [locations, tab, searchQuery],
  );

  /* ------------------------------------------------------------------------ */
  /*  MAP PIN HANDLERS                                                        */
  /* ------------------------------------------------------------------------ */

  function openFromPin(loc: LocationData) {
    setDrawerLoc(loc);
    setSelectedLocationId(loc.id);
    setSelectedUserId(null);

    if (loc.type === 'EVENT') {
      setDrawerKind('EVENT');
      setDrawerOpen(true);
    } else if (loc.type === 'COLLAB') {
      setDrawerKind('COLLAB');
      setDrawerOpen(true);
    } else {
      setDrawerKind('HAUNTING');
      setDrawerOpen(true);
    }

    if (mapRef.current?.focusOn) {
      mapRef.current.focusOn(loc.lng, loc.lat, 11);
    }
  }

  function focusLocationById(locId: string) {
    const loc = locations.find((l) => l.id === locId);
    if (!loc) return;

    setSelectedLocationId(loc.id);
    setDrawerLoc(loc);
    setDrawerOpen(false);

    if (mapRef.current?.focusOn) {
      mapRef.current.focusOn(loc.lng, loc.lat, 11);
    }
  }

  function openUser(userId: string) {
    const u = usersById[userId] ?? { id: userId, name: 'User' };
    setDrawerUser(u);
    setUserDrawerOpen(false);
    setSelectedUserId(userId);
    setTab('home');
  }

  function openEditProfile() {
    const u =
      usersById[currentUser.id] ?? {
        id: currentUser.id,
        name: currentUser.name,
        avatarUrl: currentUser.avatarUrl,
      };
    setDrawerUser(u);
    setUserDrawerOpen(true);
  }

  /* ------------------------------------------------------------------------ */
  /*  LOCATION FEED ACTIONS (edit/delete/message)                             */
  /* ------------------------------------------------------------------------ */

  function onEditLocation(locId: string) {
    const loc = locations.find((l) => l.id === locId);
    if (!loc) return;

    setEditingLocation(loc);
    setLocFormOpen(true);
    setSelectedUserId(null);
    setTab('locations');
  }

  function onDeleteLocation(locId: string) {
    if (!window.confirm('Delete this location? This cannot be undone.')) return;

    setLocations((prev) => prev.filter((l) => l.id !== locId));

    setComments((prev) => {
      const next = { ...prev };
      delete next[`loc:${locId}`];
      return next;
    });

    setStarredLocations((prev) => prev.filter((id) => id !== locId));
  }

  function onMessageLocationOwner(userId: string) {
    openDM(userId);
  }

  /* ------------------------------------------------------------------------ */
  /*  POST FORM                                                               */
  /* ------------------------------------------------------------------------ */

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

  function handleAddPost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const title = String(fd.get('title') || '').trim();
    const desc = String(fd.get('desc') || '').trim();

    const linkUrl = String(fd.get('link') || '').trim() || undefined;
    const rawLinkKind = String(fd.get('linkKind') || '').trim();

    const linkKind: DemoPost['linkKind'] =
      rawLinkKind === 'youtube' ||
      rawLinkKind === 'tiktok' ||
      rawLinkKind === 'instagram' ||
      rawLinkKind === 'facebook' ||
      rawLinkKind === 'other'
        ? rawLinkKind
        : linkUrl
        ? 'other'
        : undefined;

    const p: DemoPost = {
      id: crypto.randomUUID(),
      type: 'Post',
      title,
      desc,
      locationId: selectedLocId || undefined,
      imageUrl: postImg,
      linkUrl,
      linkKind,
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

  function editPost(id: string, patch: Partial<DemoPost>) {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function deletePost(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setComments((prev) => {
      const next = { ...prev };
      delete next[`post:${id}`];
      return next;
    });
  }

  function canEditPost(p: DemoPost) {
    return p.authorId === currentUser.id;
  }

  /* ------------------------------------------------------------------------ */
  /*  LOCATION FORM                                                           */
  /* ------------------------------------------------------------------------ */

  const [locFormOpen, setLocFormOpen] = useState(false);
  const [newLoc, setNewLoc] = useState<{ lng: number; lat: number } | null>(
    null,
  );
  const [editingLocation, setEditingLocation] =
    useState<LocationData | null>(null);

  const { url: locImg, onChange: locImgChange, clear: locImgClear } =
    useImagePreview();

  function openAddLocation() {
    const center = mapRef.current?.getCenter();
    setNewLoc(
      center ? { lng: center[0], lat: center[1] } : { lng: -2.5, lat: 54.3 },
    );

    setEditingLocation(null);
    setTab('locations');
    setSelectedUserId(null);
    setLocFormOpen(true);
  }

  /* ------------------------------------------------------------------------ */
  /*  EVENT & COUNTRY CONTEXT                                                 */
  /* ------------------------------------------------------------------------ */

  const { country } = useScope();
  const countries = useCountries();

  async function handleAddLocation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const title = String(fd.get('title') || '').trim();
    if (!title) return;

    const summary = String(fd.get('summary') || '').trim() || undefined;
    const address =
      String(fd.get('address') || '').trim() || undefined;

    // social links
    let socialLinks: SocialLink[] = [];
    const rawSocial = String(fd.get('socialLinks') || '[]');

    try {
      const parsed = JSON.parse(rawSocial);
      if (Array.isArray(parsed)) {
        socialLinks = parsed
          .filter(
            (x: any) =>
              x &&
              typeof x.platform === 'string' &&
              typeof x.url === 'string' &&
              x.url.trim(),
          )
          .map((x) => ({
            platform: x.platform as SocialLink['platform'],
            url: x.url.trim(),
          }));
      }
    } catch {
      // ignore
    }

    const primaryLink = socialLinks[0]?.url;
    const website =
      primaryLink ||
      (String(fd.get('website') || '').trim() || undefined);

    const countryCode = String(fd.get('country') || country).toUpperCase();
    const postalCodeRaw = String(fd.get('postal') || '').trim();

    if (!postalCodeRaw) return;
    const postalCode = postalCodeRaw;

    const editId = String(fd.get('id') || '').trim();
    const isEdit = !!editId;

    let lng = -2.5;
    let lat = 54.3;

    const geo = await geocodePostal(countryCode, postalCode);
    if (geo) {
      lng = geo.lng;
      lat = geo.lat;
    } else if (newLoc) {
      lng = newLoc.lng;
      lat = newLoc.lat;
    }

    const verifiedByOwner = fd.get('verifiedByOwner') === 'on';

    if (isEdit) {
      setLocations((prev) =>
        prev.map((l) =>
          l.id === editId
            ? ({
                ...l,
                title,
                summary,
                address,
                website,
                imageUrl: locImg || (l as any).imageUrl,
                verifiedByOwner,
                countryCode,
                postalCode,
                lat,
                lng,
                socialLinks,
              } as LocationData)
            : l,
        ),
      );
    } else {
      const id = crypto.randomUUID();

      const loc: LocationData = {
        id,
        title,
        type: 'HAUNTING',
        lat,
        lng,
        summary,
        address,
        website,
        imageUrl: locImg,
        verifiedByOwner,
        countryCode,
        postalCode,
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        createdAt: Date.now(),
        socialLinks,
      } as any;

      setLocations((prev) => [loc, ...prev]);

      setFollowedLocations((prev) =>
        prev.includes(id) ? prev : [id, ...prev],
      );
    }

    setSelectedUserId(null);
    setTab('locations');

    if (mapRef.current?.focusOn) {
      mapRef.current.focusOn(lng, lat, 11);
    }

    setLocFormOpen(false);
    locImgClear();
    setNewLoc(null);
    setEditingLocation(null);
  }

  /* ------------------------------------------------------------------------ */
  /*  EVENT FORM                                                              */
  /* ------------------------------------------------------------------------ */

  const [eventFormOpen, setEventFormOpen] = useState(false);
  const { url: evImg, onChange: evImgChange, clear: evImgClear } =
    useImagePreview();

  async function handleAddEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const title = String(fd.get('title') || '').trim();
    if (!title) return;

    const description = String(fd.get('desc') || '').trim() || undefined;

    let socialLinks: SocialLink[] = [];
    const rawSocial = String(fd.get('socialLinks') || '[]');

    try {
      const parsed = JSON.parse(rawSocial);
      if (Array.isArray(parsed)) {
        socialLinks = parsed
          .filter(
            (x: any) =>
              x &&
              typeof x.platform === 'string' &&
              typeof x.url === 'string' &&
              x.url.trim(),
          )
          .map((x) => ({
            platform: x.platform as SocialLink['platform'],
            url: x.url.trim(),
          }));
      }
    } catch {
      // ignore
    }

    const primaryLink = socialLinks[0]?.url;

    const countryCode = String(fd.get('country') || country).toUpperCase();
    const postalCode = String(fd.get('postal') || '').trim() || undefined;

    let lat: number;
    let lng: number;

    if (postalCode) {
      const geo = await geocodePostal(countryCode, postalCode);
      if (geo) {
        lng = geo.lng;
        lat = geo.lat;
      } else {
        lng = -2.5;
        lat = 54.3;
      }
    } else {
      lng = -2.5;
      lat = 54.3;
    }

    const locId = crypto.randomUUID();
    const eventLoc: LocationData = {
      id: locId,
      title,
      type: 'EVENT',
      lat,
      lng,
      summary: description,
      address: undefined,
      priceInfo: undefined,
      website: primaryLink,
      imageUrl: evImg,
      countryCode,
      postalCode,
      ownerId: currentUser.id,
    } as any;

    setLocations((prev) => [eventLoc, ...prev]);

    setEvents((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title,
        description,
        locationText: undefined,
        startISO: new Date().toISOString(),
        endISO: undefined,
        priceText: undefined,
        link: primaryLink,
        imageUrl: evImg,
        createdAt: Date.now(),
        postedBy: { id: currentUser.id, name: currentUser.name },
        countryCode,
        postalCode,
        locationId: locId,
        socialLinks,
      },
    ]);

    if (mapRef.current?.focusOn) {
      mapRef.current.focusOn(lng, lat, 10);
    }

    setEventFormOpen(false);
    evImgClear();
  }

  /* ------------------------------------------------------------------------ */
  /*  MARKETPLACE FORM                                                        */
  /* ------------------------------------------------------------------------ */

  const [listingFormOpen, setListingFormOpen] = useState(false);
  const { url: mkImg, onChange: mkImgChange, clear: mkImgClear } =
    useImagePreview();

  function startEditListing(item: MarketplaceItem) {
    setEditingListing(item);
    setListingFormOpen(true);
  }

  function handleAddListing(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const kind =
      (String(fd.get('kind')) as 'Product' | 'Service') || 'Product';

    const title = String(fd.get('title') || '').trim();
    const description = String(fd.get('desc') || '').trim();

    if (!title || !description) return;

    const editId = String(fd.get('id') || '').trim();
    const isEdit = !!editId;

    let socialLinks: SocialLink[] = [];
    const rawSocial = String(fd.get('socialLinks') || '[]');

    try {
      const parsed = JSON.parse(rawSocial);
      if (Array.isArray(parsed)) {
        socialLinks = parsed
          .filter(
            (x: any) =>
              x &&
              typeof x.platform === 'string' &&
              typeof x.url === 'string' &&
              x.url.trim(),
          )
          .map((x) => ({
            platform: x.platform as SocialLink['platform'],
            url: x.url.trim(),
          }));
      }
    } catch {
      // ignore
    }

    const primaryLink = socialLinks[0]?.url;

    const countryCode = String(fd.get('country') || country).toUpperCase();
    const postalCode = String(fd.get('postal') || '').trim() || undefined;

    const existingImage =
      isEdit && editingListing && editingListing.id === editId
        ? editingListing.imageUrl
        : undefined;

    const finalImage = mkImg || existingImage;

    if (isEdit) {
      setMarket((prev) =>
        prev.map((item) =>
          item.id === editId
            ? {
                ...item,
                kind,
                title,
                description,
                webLink: primaryLink,
                countryCode,
                postalCode,
                imageUrl: finalImage,
                socialLinks,
              }
            : item,
        ),
      );
    } else {
      setMarket((prev) => [
        {
          id: crypto.randomUUID(),
          kind,
          title,
          description,
          contactInfo: undefined,
          webLink: primaryLink,
          imageUrl: finalImage,
          createdAt: Date.now(),
          postedBy: { id: currentUser.id, name: currentUser.name },
          countryCode,
          postalCode,
          socialLinks,
        },
        ...prev,
      ]);
    }

    setEditingListing(null);
    setListingFormOpen(false);
    mkImgClear();
  }

  /* ------------------------------------------------------------------------ */
  /*  COLLAB FORM                                                             */
  /* ------------------------------------------------------------------------ */

  const [collabFormOpen, setCollabFormOpen] = useState(false);
  const [editingCollab, setEditingCollab] = useState<CollabItem | null>(null);

  const { url: cbImg, onChange: cbImgChange, clear: cbImgClear } =
    useImagePreview();

  async function handleAddCollab(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const title = String(fd.get('title') || '').trim();
    if (!title) return;

    const description = String(fd.get('desc') || '').trim() || undefined;

    const editId = String(fd.get('id') || '').trim();
    const isEdit = !!editId;

    let socialLinks: SocialLink[] = [];
    const rawSocial = String(fd.get('socialLinks') || '[]');

    try {
      const parsed = JSON.parse(rawSocial);
      if (Array.isArray(parsed)) {
        socialLinks = parsed
          .filter(
            (x: any) =>
              x &&
              typeof x.platform === 'string' &&
              typeof x.url === 'string' &&
              x.url.trim(),
          )
          .map((x) => ({
            platform: x.platform as SocialLink['platform'],
            url: x.url.trim(),
          }));
      }
    } catch {
      // ignore
    }

    const primaryLink = socialLinks[0]?.url;

    const countryCode = String(fd.get('country') || country).toUpperCase();
    const postalCode = String(fd.get('postal') || '').trim() || undefined;

    let lat: number;
    let lng: number;

    if (postalCode) {
      const geo = await geocodePostal(countryCode, postalCode);
      if (geo) {
        lng = geo.lng;
        lat = geo.lat;
      } else {
        lng = -2.5;
        lat = 54.3;
      }
    } else {
      lng = -2.5;
      lat = 54.3;
    }

    const existing = isEdit
      ? collabs.find((c) => c.id === editId) || null
      : null;

    const locId = isEdit
      ? existing?.locationId || crypto.randomUUID()
      : crypto.randomUUID();

    const finalImage = cbImg || (existing ? existing.imageUrl : undefined);

    const baseLoc: LocationData = {
      id: locId,
      title,
      type: 'COLLAB',
      lat,
      lng,
      summary: description,
      address: undefined,
      priceInfo: undefined,
      website: primaryLink,
      imageUrl: finalImage,
      countryCode,
      postalCode,
      ownerId: currentUser.id,
    } as any;

    setLocations((prev) => {
      const exists = prev.some((l) => l.id === locId);
      if (exists) {
        return prev.map((l) => (l.id === locId ? { ...l, ...baseLoc } : l));
      }
      return [baseLoc, ...prev];
    });

    if (isEdit && editId && existing) {
      setCollabs((prev) =>
        prev.map((c) =>
          c.id === editId
            ? {
                ...c,
                title,
                description,
                imageUrl: finalImage,
                countryCode,
                postalCode,
                locationId: locId,
                socialLinks,
              }
            : c,
        ),
      );
    } else {
      setCollabs((prev) => [
        {
          id: crypto.randomUUID(),
          title,
          description,
          dateISO: undefined,
          locationText: undefined,
          priceText: undefined,
          contact: undefined,
          imageUrl: finalImage,
          createdAt: Date.now(),
          postedBy: { id: currentUser.id, name: currentUser.name },
          countryCode,
          postalCode,
          locationId: locId,
          socialLinks,
        },
        ...prev,
      ]);
    }

    if (mapRef.current?.focusOn) {
      mapRef.current.focusOn(lng, lat, 10);
    }

    setCollabFormOpen(false);
    setEditingCollab(null);
    cbImgClear();
  }

  /* ------------------------------------------------------------------------ */
  /*  FILTERING & SORTING                                                     */
  /* ------------------------------------------------------------------------ */

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

  const sortPosts = (a: DemoPost, b: DemoPost) => b.createdAt - a.createdAt;

  const locationsByStars = useMemo(() => {
    const haunted = locations.filter((l) => l.type === 'HAUNTING');

    const scoped = haunted.filter((l) => {
      const c = (l as any).countryCode;
      if (!c) return true;
      if (!country) return true;
      if (country.toUpperCase() === 'EU') return true;
      return c.toUpperCase() === country.toUpperCase();
    });

    return [...scoped].sort((a, b) => {
      const sa = locationStars[a.id] ?? 0;
      const sb = locationStars[b.id] ?? 0;
      if (sb !== sa) return sb - sa;
      return a.title.localeCompare(b.title);
    });
  }, [locations, locationStars, country]);

  const userEventsForSelected = useMemo(
    () =>
      selectedUserId
        ? events.filter((e) => e.postedBy?.id === selectedUserId)
        : [],
    [events, selectedUserId],
  );

  const userMarketForSelected = useMemo(
    () =>
      selectedUserId
        ? market.filter((m) => m.postedBy?.id === selectedUserId)
        : [],
    [market, selectedUserId],
  );

  const userCollabsForSelected = useMemo(
    () =>
      selectedUserId
        ? collabs.filter((c) => c.postedBy?.id === selectedUserId)
        : [],
    [collabs, selectedUserId],
  );

  const postsForSelectedUser = useMemo(
    () =>
      selectedUserId
        ? posts.filter((p) => p.authorId === selectedUserId).sort(sortPosts)
        : [],
    [posts, selectedUserId],
  );

  /* ======================================================================== */
  /*  RENDER                                                                  */
  /* ======================================================================== */

  return (
    <main className="flex min-h-screen flex-col bg-[#0B0C0E] text-white">
      {/* HEADER */}
      <ParaverseHeader
        tab={tab}
        onSelectTab={handleSelectTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        unreadNotifications={unreadNotificationCount}
        unreadMessages={unreadDmCount}
        onOpenMessagesHub={() => {
          openUser(currentUser.id);
          setProfileFilter('messages');
        }}
      />

      {/* MAP */}
      <MapShell
        mapRef={mapRef}
        country={country}
        mapLocations={mapLocations}
        openFromPin={openFromPin}
        drawerOpen={drawerOpen}
        drawerKind={drawerKind}
        drawerLoc={drawerLoc}
        setDrawerOpen={setDrawerOpen}
        setDrawerKind={setDrawerKind}
        locationReviews={locationReviews}
        giveLocationStar={giveLocationStar}
        followedLocations={followedLocations}
        toggleFollowLocation={toggleFollowLocation}
        canEditComment={canEditComment}
        openComment={openComment}
        openEditComment={openEditComment}
        events={events}
        collabs={collabs}
        formatShortDate={formatShortDate}
        openDM={openDM}
        userDrawerOpen={userDrawerOpen}
        drawerUser={drawerUser}
        currentUser={currentUser}
        userStars={userStars}
        giveUserStar={giveUserStar}
        toggleFollowUser={toggleFollowUser}
        setUsersById={setUsersById}
        setCurrentUser={setCurrentUser}
        setDrawerUser={setDrawerUser}
        setUserDrawerOpen={setUserDrawerOpen}
      />

      {/* FEEDS */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-6">
          {/* USER PROFILE HUB VIEW */}
          {selectedUserId && (
            <div className="mb-6">
              <ProfileHubSection
                selectedUserId={selectedUserId}
                currentUser={currentUser}
                usersById={usersById}
                profileFilter={profileFilter}
                setProfileFilter={setProfileFilter}
                postsForSelectedUser={postsForSelectedUser}
                userEventsForSelected={userEventsForSelected}
                userMarketForSelected={userMarketForSelected}
                userCollabsForSelected={userCollabsForSelected}
                sortedNotifications={sortedNotifications}
                sortedDmThreads={sortedDmThreads}
                formatShortDate={formatShortDate}
                handleNotificationClick={handleNotificationClick}
                openDM={openDM}
                openEditProfile={openEditProfile}
              />
            </div>
          )}

          {/* HOME (no user selected) */}
          {!selectedUserId && tab === 'home' && (
            <HomeSection
              currentUser={currentUser}
              feedFilter={feedFilter}
              setFeedFilter={setFeedFilter}
              filteredPosts={filteredPosts}
              editPost={editPost}
              deletePost={deletePost}
              canEditPost={canEditPost}
              comments={comments}
              openComment={openComment}
              openEditComment={openEditComment}
              canEditComment={canEditComment}
              usersById={usersById}
              followedUsers={followedUsers}
              openUser={openUser}
              sortPosts={sortPosts}
              setPostFormOpen={setPostFormOpen}
              onOpenImage={(src) => setLightboxSrc(src)}
            />
          )}

          {/* LOCATIONS */}
    {!selectedUserId && tab === 'locations' && (
  <LocationsSection
    country={country}
    countries={countries}
    locationsByStars={locationsByStars}
    locationStars={locationStars}
    comments={comments}
    usersById={usersById}
    giveLocationStar={giveLocationStar}
    openAddLocation={openAddLocation}
    openFromPin={openFromPin}
    openComment={openComment}
    openEditComment={openEditComment}
    openUser={openUser}
    formatShortDate={formatShortDate}
    currentUserId={currentUser.id}
    // NEW: "View on map" should only move map, no drawer
    onViewOnMap={(locId) => focusLocationById(locId)}
    onEditLocation={onEditLocation}
    onDeleteLocation={onDeleteLocation}
    onMessageUser={onMessageLocationOwner}
  />
)}


          {/* EVENTS */}
          {tab === 'events' && (
            <EventsSection
              country={country}
              events={events}
              currentUserId={currentUser.id}
              setEventFormOpen={setEventFormOpen}
              onMessageUser={openDM}
              onOpenLocation={(locId) => focusLocationById(locId)}
              onUpdateEvent={updateEvent}
              onDeleteEvent={deleteEvent}
              onOpenImage={(src) => setLightboxSrc(src)}
              onOpenUser={openUser}
            />
          )}

          {/* MARKETPLACE */}
          {tab === 'marketplace' && (
            <MarketplaceSection
              country={country}
              items={market}
              marketFilter={marketFilter}
              setMarketFilter={setMarketFilter}
              currentUserId={currentUser.id}
              onOpenDM={openDM}
              onAddListing={() => {
                setEditingListing(null);
                setListingFormOpen(true);
              }}
              onEditListing={startEditListing}
              onDeleteListing={(id) =>
                setMarket((prev) => prev.filter((m) => m.id !== id))
              }
              onOpenImage={(src) => setLightboxSrc(src)}
              onOpenUser={openUser}
            />
          )}

          {/* COLLABORATION */}
          {tab === 'collaboration' && (
            <CollabSection
              country={country}
              items={activeCollabs}
              currentUserId={currentUser.id}
              onAddCollab={() => {
                setEditingCollab(null);
                cbImgClear();
                setCollabFormOpen(true);
              }}
              onOpenDM={openDM}
              onOpenLocation={(locId) => focusLocationById(locId)}
              onOpenUser={openUser}
              onOpenImage={(src) => setLightboxSrc(src)}
              onEditCollab={(id) => {
                const found = collabs.find((c) => c.id === id) || null;
                setEditingCollab(found);
                cbImgClear();
                setCollabFormOpen(true);
              }}
              onDeleteCollab={(id) => {
                setCollabs((prev) => prev.filter((c) => c.id !== id));
              }}
            />
          )}
        </div>
      </section>

      {/* ======================= MODALS ======================= */}

      {/* POST MODAL */}
      <Modal open={postFormOpen} onClose={() => setPostFormOpen(false)}>
        <PostForm
          handleAddPost={handleAddPost}
          postImg={postImg}
          postImgChange={postImgChange}
          postImgClear={postImgClear}
          postTagUsers={postTagUsers}
          setPostTagUsers={setPostTagUsers}
          selectedLocId={selectedLocId}
          setSelectedLocId={setSelectedLocId}
          locQuery={locQuery}
          setLocQuery={setLocQuery}
          locationOptions={locationOptions}
          hasLocations={locations.length > 0}
        />
      </Modal>

      {/* LOCATION MODAL */}
      <Modal
        open={locFormOpen}
        onClose={() => {
          setLocFormOpen(false);
          setEditingLocation(null);
          locImgClear();
        }}
      >
        <LocationForm
          mode={editingLocation ? 'edit' : 'create'}
          initialLocation={
            editingLocation
              ? {
                  id: editingLocation.id,
                  title: editingLocation.title,
                  summary: editingLocation.summary,
                  address: (editingLocation as any).address,
                  countryCode: (editingLocation as any).countryCode,
                  postalCode: (editingLocation as any).postalCode,
                  website: (editingLocation as any).website,
                  verifiedByOwner: (editingLocation as any).verifiedByOwner,
                  socialLinks: (editingLocation as any).socialLinks ?? [],
                }
              : undefined
          }
          handleAddLocation={handleAddLocation}
          locImg={locImg}
          locImgChange={locImgChange}
          country={country}
          countries={countries}
          onCancel={() => {
            setLocFormOpen(false);
            setEditingLocation(null);
            locImgClear();
          }}
        />
      </Modal>

      {/* EVENT MODAL */}
      <Modal open={eventFormOpen} onClose={() => setEventFormOpen(false)}>
        <EventForm
          handleAddEvent={handleAddEvent}
          evImg={evImg}
          evImgChange={evImgChange}
          country={country}
          countries={countries}
          onCancel={() => setEventFormOpen(false)}
        />
      </Modal>

      {/* MARKETPLACE MODAL */}
      <Modal
        open={listingFormOpen}
        onClose={() => {
          setListingFormOpen(false);
          setEditingListing(null);
        }}
      >
        <MarketplaceForm
          mode={editingListing ? 'edit' : 'create'}
          initialItem={editingListing ?? undefined}
          handleAddListing={handleAddListing}
          mkImg={mkImg}
          mkImgChange={mkImgChange}
          mkImgClear={mkImgClear}
          country={country}
          countries={countries}
          onCancel={() => {
            setListingFormOpen(false);
            setEditingListing(null);
          }}
        />
      </Modal>

      {/* COLLAB MODAL */}
      <Modal
        open={collabFormOpen}
        onClose={() => {
          setCollabFormOpen(false);
          setEditingCollab(null);
          cbImgClear();
        }}
      >
        <CollaborationForm
          mode={editingCollab ? 'edit' : 'create'}
          initialCollab={
            editingCollab
              ? {
                  id: editingCollab.id,
                  title: editingCollab.title,
                  description: editingCollab.description,
                  countryCode: editingCollab.countryCode,
                  postalCode: editingCollab.postalCode,
                  socialLinks: (editingCollab as any).socialLinks ?? [],
                }
              : undefined
          }
          handleAddCollab={handleAddCollab}
          cbImg={cbImg}
          cbImgChange={cbImgChange}
          country={country}
          countries={countries}
          onCancel={() => {
            setCollabFormOpen(false);
            setEditingCollab(null);
            cbImgClear();
          }}
        />
      </Modal>

      {/* COMMENT MODAL */}
      <Modal open={commentOpen} onClose={resetCommentState}>
        <CommentForm
          text={commentText}
          setText={setCommentText}
          img={cImg}
          imgName={cImgName}
          imgChange={cImgChange}
          imgClear={cImgClear}
          tags={commentTags}
          setTags={setCommentTags}
          usersById={usersById}
          canSubmit={!!commentKey && (!!commentText.trim() || !!cImg)}
          onCancel={resetCommentState}
          onSubmit={submitComment}
        />
      </Modal>

      {/* DM MODAL */}
      <DMModal
        open={dmOpen}
        onClose={resetDM}
        dmRecipientName={dmRecipientName}
        dmText={dmText}
        setDmText={setDmText}
        onSend={handleSendDM}
      />

      {/* GLOBAL IMAGE LIGHTBOX */}
      {lightboxSrc && (
        <>
          <div
            className="fixed inset-0 z-[95] bg-black/80"
            onClick={() => setLightboxSrc(null)}
          />
          <div className="fixed inset-0 z-[96] flex items-center justify-center p-4">
            <div className="relative max-h-full max-w-3xl">
              <button
                type="button"
                onClick={() => setLightboxSrc(null)}
                className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-sm font-bold text-white"
              >
                ×
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxSrc}
                alt="Full view"
                className="max-h-[80vh] w-auto rounded-lg border border-neutral-800 shadow-xl"
              />
            </div>
          </div>
        </>
      )}
    </main>
  );
}

