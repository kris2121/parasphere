'use client';

import React, {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  loadLocations,
  createLocation,
  createLocationWithImage,
  updateLocation as dbUpdateLocation,
  deleteLocationDoc,
} from '@/lib/db/locations';

import {
  loadEvents,
  createEvent,
  updateEventDoc,
  deleteEventDoc,
} from '@/lib/db/events';

import {
  loadMarketplace,
  createMarketplaceItem,
  updateMarketplaceDoc,
  deleteMarketplaceDoc,
} from '@/lib/db/marketplace';

import {
  loadCollabs,
  createCollab,
  updateCollabDoc,
  deleteCollabDoc,
} from '@/lib/db/collabs';

import {
  loadPosts,
  createPost,
  updatePostDoc,
  deletePostDoc,
} from '@/lib/db/posts';

import {
  createComment,
  updateComment as updateCommentDoc,
  deleteCommentDoc,
  loadCommentsByKey,
  type CommentDB,
} from '@/lib/db/comments';

import {
  loadCreatorPosts,
  createCreatorPostDoc,
  updateCreatorPostDoc,
  deleteCreatorPostDoc,
} from '@/lib/db/creators';

import {
  ScopeProvider,
  useScope,
  useCountries,
} from '@/components/ParaverseScope';

import { useRouter } from 'next/navigation';

import { loadAdminRoles, setUserAdminRole } from '@/lib/db/adminRoles';

import type {
  DemoPost,
  MarketplaceItem,
  EventItem,
  CollabItem,
  Comment,
  NotificationItem,
  NotificationKind,
  DMMessage,
  DMThread,
} from '@/types/paraverse';


// Local SocialLink type for feeds & forms
type SocialLink = {
  platform: 'YouTube' | 'TikTok' | 'Instagram' | 'Facebook' | 'Link';
  url: string;
};



import type { TabKey } from '@/components/ParaverseHeader';
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
import { createUser, updateUserDoc, loadUser } from '@/lib/db/users';

import { useImagePreview } from '@/hooks/useImagePreview';
import Modal from '@/components/Modal';
import DMModal from '@/components/modals/DMModal';
import { geocodePostal } from '@/lib/geocodePostal';
import { minutesAgo, formatShortDate } from '@/lib/dateUtils';

import CreatorsSection from '@/components/sections/CreatorsSection';
import type { CreatorPost } from '@/components/feed/CreatorsFeed';
import CreatorForm from '@/components/modals/CreatorForm';

import { auth, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
// Normalise marketplace item into the form shape
function mapMarketplaceItemToForm(item: any): {
  id: string;
  kind: 'For Sale' | 'Wanted';
  title: string;
  description: string;
  imageUrl?: string;
  countryCode?: string;
  postalCode?: string;
  socialLinks?: SocialLink[];
} {
  const rawKind = item?.kind as string | undefined;

  // Handle both old ("Product"/"Service") and new ("For Sale"/"Wanted") values gracefully
  const kind: 'For Sale' | 'Wanted' =
    rawKind === 'Product' || rawKind === 'For Sale'
      ? 'For Sale'
      : 'Wanted';

  return {
    id: item.id,
    kind,
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
    countryCode: item.countryCode,
    postalCode: item.postalCode,
    socialLinks: item.socialLinks ?? [],
  };
}

/* ========================================================================== */
/*  MAIN PAGE WRAPPER                                                         */
/* ========================================================================== */
const ADMIN_USER_ID = 'paraverse_admin';

export default function Page() {
  return (
    <ScopeProvider>
      <PageInner />
    </ScopeProvider>
  );
}

const SUPERADMIN_EMAILS = [
  'northwestboilers@gmail.com', // 👈 replace with your Google sign-in email
];

/* ========================================================================== */
/*  PAGE INNER                                                                */
/* ========================================================================== */

function PageInner() {
  const router = useRouter();

  /* ------------------------------------------------------------------------ */
  /*  USER + MASTER ADMIN (DEFAULT FALLBACK BEFORE AUTH)                      */
  /* ------------------------------------------------------------------------ */

  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    avatarUrl?: string;
    role: 'user' | 'admin' | 'superadmin';
  }>({
    id: ADMIN_USER_ID,
    name: 'Paraverse Admin',
    avatarUrl: undefined,
    role: 'superadmin',
  });

  const [usersById, setUsersById] = useState<Record<string, UserMini>>({
    [ADMIN_USER_ID]: {
      id: ADMIN_USER_ID,
      name: 'Paraverse Admin',
      avatarUrl: undefined,
      role: 'superadmin',
    },

    u_demo_2: {
      id: 'u_demo_2',
      name: 'Haunted Helen',
      avatarUrl:
        'https://ui-avatars.com/api/?name=Haunted+Helen&background=111827&color=ffffff',
      role: 'user',
    },
  });

  /* ------------------------------------------------------------------------ */
  /*  PERMISSION HELPERS + ADMIN ROLE TOGGLE                                  */
  /* ------------------------------------------------------------------------ */

  // Basic role flags from the current user
  const isSuperAdmin = currentUser.role === 'superadmin';
  const isAdmin = isSuperAdmin || currentUser.role === 'admin';

  function canManageByOwnerId(ownerId?: string | null) {
    if (isAdmin) return true;
    if (!ownerId) return false;
    return ownerId === currentUser.id;
  }

  function ensureCanManage(ownerId?: string | null) {
    if (canManageByOwnerId(ownerId)) return true;
    window.alert('You can only manage your own content.');
    return false;
  }

  // Superadmin-only: toggle another user's admin role
  async function handleToggleAdminRole(
    userId: string,
    nextRole: 'user' | 'admin',
  ) {
    // Only superadmin can change roles
    if (!isSuperAdmin) {
      window.alert('Only the Paraverse superadmin can change admin roles.');
      return;
    }

    // Never allow changing your own role from the UI
    if (userId === currentUser.id) {
      window.alert('You cannot change your own admin role.');
      return;
    }

    const makeAdmin = nextRole === 'admin';

    try {
      // 1) Persist to Firestore (adminRoles collection)
      await setUserAdminRole(userId, makeAdmin);

      // 2) Reflect in local user map so the drawer updates immediately
      setUsersById((prev) => ({
        ...prev,
        [userId]: {
          ...(prev[userId] ?? { id: userId, name: 'User' }),
          role: nextRole,
        },
      }));

      console.log(
        `[Admin] Updated role for ${userId}: ${makeAdmin ? 'admin' : 'user'}`,
      );
    } catch (err) {
      console.error('[Admin] Failed to update admin role', err);
      window.alert('Failed to update admin role. Please try again.');
    }
  }

  /* ------------------------------------------------------------------------ */
  /*  AUTH: GOOGLE SIGN-IN + LISTENER + ROLES                                */
  /* ------------------------------------------------------------------------ */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (!fbUser) {
        // Logged out → boot them to the login page
        router.push('/login');
        return;
      }

      (async () => {
        const name =
          fbUser.displayName ||
          fbUser.email ||
          'Paraverse user';

        // Default role
        let role: 'user' | 'admin' | 'superadmin' = 'user';

        try {
          const roles = await loadAdminRoles();
          const email = (fbUser.email || '').toLowerCase();

          const docSupers = roles.superadmins.map((e) =>
            String(e).toLowerCase(),
          );
          const fallbackSupers = SUPERADMIN_EMAILS.map((e) =>
            e.toLowerCase(),
          );

          if (
            email &&
            (docSupers.includes(email) || fallbackSupers.includes(email))
          ) {
            role = 'superadmin';
          } else if (roles.admins.includes(fbUser.uid)) {
            role = 'admin';
          }
        } catch (err) {
          console.error(
            '[Auth] Failed to load admin roles, using default user role',
            err,
          );
        }

        // Switch to the real Firebase user with resolved role
        setCurrentUser({
          id: fbUser.uid,
          name,
          avatarUrl: fbUser.photoURL || undefined,
          role,
        });

        // Make sure they exist in usersById so DMs / tags work
        setUsersById((prev) => ({
          ...prev,
          [fbUser.uid]: {
            ...(prev[fbUser.uid] ?? { id: fbUser.uid }),
            id: fbUser.uid,
            name,
            avatarUrl: fbUser.photoURL || prev[fbUser.uid]?.avatarUrl,
            role,
          },
        }));
      })();
    });

    return () => unsubscribe();
  }, [router]);
  /* ------------------------------------------------------------------------ */
  /*  ADMIN ROLES → HYDRATE INTO usersById (FOR DRAWER LABELS)               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    async function hydrateAdminRoles() {
      try {
        const roles = await loadAdminRoles();

        // Mark all admin userIds as role: 'admin' in usersById
        setUsersById((prev) => {
          const next = { ...prev };

          (roles.admins || []).forEach((uid) => {
            const existing = next[uid] ?? { id: uid, name: 'User' };
            next[uid] = {
              ...existing,
              role: 'admin',
            };
          });

          return next;
        });
      } catch (err) {
        console.error('[Admin] Failed to hydrate admin roles from Firestore', err);
      }
    }

    hydrateAdminRoles();
  }, []);

  /* ------------------------------------------------------------------------ */
  /*  LOGIN / LOGOUT ACTIONS (LISTENER HANDLES REDIRECTS)                     */
  /* ------------------------------------------------------------------------ */

  async function handleLoginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // listener will update state
    } catch (err) {
      console.error('[Auth] Google sign-in failed', err);
      window.alert('Google sign-in failed. Please try again.');
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth);
      // listener will redirect to /login
    } catch (err) {
      console.error('[Auth] Sign-out failed', err);
    }
  }


  /* ------------------------------------------------------------------------ */
  /*  REPORT NOTIFICATIONS (CONTENT + USER)                                   */
  /* ------------------------------------------------------------------------ */

  function pushReportNotification(opts: {
    kind: 'report_creator' | 'report_user';
    targetType: 'creator' | 'profile';
    targetId: string;
    actorId: string;
    actorName: string;
    extraLabel?: string;
  }) {
    const { kind, targetType, targetId, actorId, actorName, extraLabel } = opts;

    const text =
      kind === 'report_creator'
        ? `reported a creator video${extraLabel ? `: "${extraLabel}"` : ''}.`
        : `reported a user${extraLabel ? `: "${extraLabel}"` : ''}.`;

    const notification: any = {
      id: crypto.randomUUID(),
      kind,
      createdAt: new Date().toISOString(),
      read: false,
      actor: {
        id: actorId,
        name: actorName,
      },
      text,
      target: {
        type: targetType === 'creator' ? 'creator' : 'profile',
        id: targetId,
      },
    };

    setNotifications((prev) => [notification, ...prev]);
  }





  /* ------------------------------------------------------------------------ */
  /*  LOAD USER PROFILE (FIRESTORE)                                           */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const user = await loadUser(currentUser.id);

        if (!user) {
          console.log(
            `[User] No Firestore profile found for ${currentUser.id}`,
          );
          return;
        }

// Determine role from our local usersById map → fallback
const effectiveRole: 'user' | 'admin' | 'superadmin' =
  (usersById[user.id]?.role as 'user' | 'admin' | 'superadmin' | undefined) ??
  'user';

// Normalise Firestore socialLinks → UserMini.socialLinks shape
const safeSocialLinks = Array.isArray(user.socialLinks)
  ? user.socialLinks.map((link: any, index: number) => ({
      id: link.id ?? `${user.id}-link-${index}`,
      label: link.label ?? link.platform ?? 'Link',
      platform: (link.platform ?? 'Link') as any,
      url: link.url ?? '',
    }))
  : [];

const mini: UserMini = {
  id: user.id,
  name: user.name,
  avatarUrl: user.avatarUrl ?? undefined,
  bio: user.bio ?? undefined,
  country: user.country ?? undefined,
  socialLinks: safeSocialLinks,
  role: effectiveRole,
};


        // Update currentUser, but never override superadmin privilege
        setCurrentUser((prev) => ({
          ...prev,
          name: mini.name,
          avatarUrl: mini.avatarUrl,
          role:
            prev.role === 'superadmin'
              ? prev.role
              : effectiveRole,
        }));

        // Store in usersById
        setUsersById((prev) => ({
          ...prev,
          [mini.id]: {
            ...(prev[mini.id] ?? { id: mini.id }),
            ...mini,
          },
        }));

        console.log('[User] Loaded Firestore profile:', mini);
      } catch (err) {
        console.error('[User] Failed to load profile on mount', err);
      }
    }

    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  /* ------------------------------------------------------------------------ */
  /*  GLOBAL IMAGE LIGHTBOX                                                   */
  /* ------------------------------------------------------------------------ */

  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /*  TABS, MAP, DRAWERS, PROFILE HUB                                         */
  /* ------------------------------------------------------------------------ */

  const [tab, setTab] = useState<TabKey>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef<LiveMapHandle | null>(null);



  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoc, setDrawerLoc] = useState<LocationData | undefined>(
    undefined,
  );
  const [drawerKind, setDrawerKind] = useState<
    'HAUNTING' | 'EVENT' | 'COLLAB' | null
  >(null);

  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [drawerUser, setDrawerUser] = useState<UserMini | undefined>(undefined);

  // 🔴 profile hub is *only* for the current user
  const [profileHubOpen, setProfileHubOpen] = useState(false);

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
  /*  EVENT & COUNTRY CONTEXT                                                 */
  /* ------------------------------------------------------------------------ */

  const { country } = useScope();
  const countries = useCountries();

  /* ------------------------------------------------------------------------ */
  /*  DATA ARRAYS + HELPERS                                                   */
  /* ------------------------------------------------------------------------ */

  const [locations, setLocations] = useState<LocationData[]>([]);
  const [posts, setPosts] = useState<DemoPost[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [editingPost, setEditingPost] = useState<DemoPost | null>(null);

  // Helper: remove undefined values before sending to Firestore
  const stripUndefined = (obj: Record<string, any>) =>
    Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

  // Upload image to Firebase Storage
  async function uploadImageToStorage(file: File, path: string): Promise<string> {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  }

  function dataUrlToFile(dataUrl: string, filename: string): File {
    const [header, base64] = dataUrl.split(',');
    const match = header.match(/data:(.*?);base64/);
    const mime = match?.[1] || 'image/png';

    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);

    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return new File([bytes], filename, { type: mime });
  }

  const [market, setMarket] = useState<MarketplaceItem[]>([]);
  const [collabs, setCollabs] = useState<CollabItem[]>([]);

  // existing creator state
  const [creatorPosts, setCreatorPosts] = useState<CreatorPost[]>([]);
  const [creatorFormOpen, setCreatorFormOpen] = useState(false);
  const [editingCreator, setEditingCreator] =
    useState<CreatorPost | null>(null);

  // Load locations whenever country changes
  useEffect(() => {
    let cancelled = false;

    async function fetchLocations() {
      try {
        const data = await loadLocations(country);
        if (!cancelled) {
          setLocations(data);
        }
      } catch (err) {
        console.error('Error loading locations', err);
      }
    }

    fetchLocations();

    return () => {
      cancelled = true;
    };
  }, [country]);

  useEffect(() => {
    let cancelled = false;

    async function fetchMarketplace() {
      try {
        const items = await loadMarketplace();
        if (cancelled) return;
        setMarket(items);
      } catch (err) {
        console.error('Failed to load marketplace items', err);
      }
    }

    fetchMarketplace();

    return () => {
      cancelled = true;
    };
  }, []);

  // LOAD POSTS FROM FIRESTORE
  useEffect(() => {
    loadPosts()
      .then((loaded) => {
        setPosts(loaded);
        console.log('Loaded posts:', loaded.length);
      })
      .catch((err) => console.error('Error loading posts', err));
  }, []);

  // Load events from Firestore whenever country changes
  useEffect(() => {
    let cancelled = false;

async function fetchEvents() {
  try {
    const data = await loadEvents();
    if (!cancelled) {
      setEvents(data);
    }
  } catch (err) {
    console.error('Failed to load events', err);
  }
}


    fetchEvents();

    return () => {
      cancelled = true;
    };
  }, [country]);

  // TEMPORARY CLEANUP – remove orphan EVENT locations
  useEffect(() => {
    async function cleanupOrphanEventLocations() {
      if (!locations.length) return;

      const eventLocIds = new Set(
        events
          .map((e) => e.locationId)
          .filter((id): id is string => !!id),
      );

      const orphans = locations.filter(
        (l) => l.type === 'EVENT' && !eventLocIds.has(l.id),
      );

      if (!orphans.length) return;

      console.log('[Cleanup] Found orphan event locations:', orphans.length);

      for (const loc of orphans) {
        try {
          await deleteLocationDoc(loc.id);
          console.log('[Cleanup] Deleted orphan event location', loc.id);
        } catch (err) {
          console.error('[Cleanup] Failed to delete location', loc.id, err);
        }
      }
    }

    cleanupOrphanEventLocations();
  }, [locations, events]);

  // Continue as normal…
  async function updateEvent(id: string, patch: Partial<EventItem>) {
    setEvents((prev) =>
      prev.map((ev) => (ev.id === id ? ({ ...ev, ...patch } as EventItem) : ev)),
    );

    try {
      await updateEventDoc(id, stripUndefined(patch as any));
      console.log('[Event] Firestore update OK', id);
    } catch (err) {
      console.error('[Event] Firestore update FAILED', err);
    }
  }

  async function deleteEvent(id: string) {
    // Find the event so we know which location it was using
    const target = events.find((ev) => ev.id === id) || null;
    if (!target) return;

    if (!ensureCanManage(target.postedBy?.id)) {
      return;
    }

    const locId = target.locationId;

    // Optimistic UI update: remove event from local state
    setEvents((prev) => prev.filter((ev) => ev.id !== id));

    // Also remove its location locally so the pin disappears
    if (locId) {
      setLocations((prev) => prev.filter((l) => l.id !== locId));
    }

    try {
      // Delete event doc in Firestore
      await deleteEventDoc(id);
      console.log('[Event] Firestore delete OK', id);

      // Delete linked location doc in Firestore (if we had one)
      if (locId) {
        await deleteLocationDoc(locId);
        console.log('[Event] linked location deleted OK', locId);
      }
    } catch (err) {
      console.error('[Event] Firestore delete FAILED', err);
    }
  }

  const [editingListing, setEditingListing] =
    useState<MarketplaceItem | null>(null);

  const [marketFilter, setMarketFilter] = useState<
    'All' | 'Product' | 'Service'
  >('Product');

  // LOAD CREATOR POSTS
  useEffect(() => {
    loadCreatorPosts()
      .then((loaded) => {
        setCreatorPosts(loaded);
        console.log('Loaded creator posts:', loaded.length);
      })
      .catch((err) => console.error('Error loading creator posts', err));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchCollabs() {
      try {
        const items = await loadCollabs();
        if (cancelled) return;
        setCollabs(items);
      } catch (err) {
        console.error('Failed to load collaborations', err);
      }
    }

    fetchCollabs();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /*  COMMENTS SYSTEM                                                         */
  /* ------------------------------------------------------------------------ */

  const [comments, setComments] = useState<Record<string, Comment[]>>({});

// Make sure this matches your CommentDB type shape from lib/db/comments.ts
function mapDBToComment(row: CommentDB): Comment {
  return {
    id: row.id,
    key: row.key,                          // ✅ add this
    text: row.text,
    authorId: row.authorId,
    authorName: row.authorName,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt ?? row.createdAt, // ✅ add this (fallback if needed)
    imageUrl: row.imageUrl,
    parentId: row.parentId ?? null,
    tagUserIds: row.tagUserIds ?? [],
  };
}


  useEffect(() => {
    async function fetchAllComments() {
      try {
        const keys: string[] = [
          ...posts.map((p) => `post:${p.id}`),
          ...locations.map((l) => `loc:${l.id}`),
        ];

        const uniqueKeys = Array.from(new Set(keys));
        if (uniqueKeys.length === 0) {
          console.log('[Comments] fetchAllComments: no keys');
          setComments({});
          return;
        }

        console.log(
          '[Comments] fetchAllComments: keys =',
          uniqueKeys.join(', '),
        );

        const all: Record<string, Comment[]> = {};

        for (const key of uniqueKeys) {
          const list = await loadCommentsByKey(key);
          all[key] = list.map(mapDBToComment);
        }

        console.log('[Comments] fetchAllComments: done');
        setComments(all);
      } catch (err) {
        console.error('[Comments] Failed to load comments', err);
      }
    }

    if (posts.length || locations.length) {
      fetchAllComments();
    }
  }, [posts, locations]);

  function upsertLocalComment(key: string, comment: Comment) {
    setComments((prev) => {
      const arr = prev[key] ?? [];
      const existingIndex = arr.findIndex((c) => c.id === comment.id);
      let next: Comment[];

      if (existingIndex === -1) {
        next = [...arr, comment];
      } else {
        next = [...arr];
        next[existingIndex] = comment;
      }

      next.sort((a, b) => a.createdAt - b.createdAt);

      return { ...prev, [key]: next };
    });
  }

  function removeLocalComment(key: string, id: string) {
    setComments((prev) => ({
      ...prev,
      [key]: (prev[key] ?? []).filter((c) => c.id !== id),
    }));
  }

  async function addCommentForKey(key: string, c: Comment) {
    const row: CommentDB = {
      id: c.id,
      key,
      text: c.text,
      authorId: c.authorId,
      authorName: c.authorName,
      parentId: c.parentId ?? null,
      imageUrl: c.imageUrl,
      tagUserIds: c.tagUserIds ?? [],
      createdAt: c.createdAt,
      updatedAt: c.createdAt,
    };

    try {
      await createComment(row);
    } catch (err) {
      console.error(
        '[Comments] Firestore create failed – keeping local only',
        err,
      );
    }

    upsertLocalComment(key, c);
  }

  async function updateCommentForKey(
    key: string,
    id: string,
    patch: Partial<Comment>,
  ) {
    setComments((prev) => {
      const arr = prev[key] ?? [];
      const next = arr.map((c) => (c.id === id ? { ...c, ...patch } : c));
      return { ...prev, [key]: next };
    });

    const dbPatch: Partial<CommentDB> = {};
    if (patch.text !== undefined) dbPatch.text = patch.text;
    if (patch.imageUrl !== undefined) dbPatch.imageUrl = patch.imageUrl;
    if (patch.tagUserIds !== undefined) dbPatch.tagUserIds = patch.tagUserIds;
    if (patch.parentId !== undefined) dbPatch.parentId = patch.parentId;

    try {
      await updateCommentDoc(id, dbPatch);
    } catch (err) {
      console.error('[Comments] Firestore update failed', err);
    }
  }

  async function deleteCommentForKey(key: string, id: string) {
    removeLocalComment(key, id);

    try {
      await deleteCommentDoc(id);
    } catch (err) {
      console.error('[Comments] Firestore delete failed', err);
    }
  }

  // 🔑 MASTER ADMIN: can edit any comment
  function canEditComment(c: Comment) {
    return c.authorId === currentUser.id || isAdmin;
  }

  const [commentOpen, setCommentOpen] = useState(false);
  const [commentKey, setCommentKey] = useState<string | null>(null);
  const [activeReplyParentId, setActiveReplyParentId] =
    useState<string | null>(null);
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

async function submitComment() {
  if (!commentKey) return;

  const trimmed = commentText.trim();
  if (!trimmed && !cImg) return;

  if (editingCommentId) {
    await updateCommentForKey(commentKey, editingCommentId, {
      text: trimmed,
      imageUrl: cImg,
      tagUserIds: commentTags,
      updatedAt: Date.now(),      // ensure edit timestamp
    });
  } else {
    const now = Date.now();

    const newComment: Comment = {
      id: crypto.randomUUID(),
      key: commentKey,            // REQUIRED
      text: trimmed,
      authorId: currentUser.id,
      authorName: currentUser.name,
      createdAt: now,
      updatedAt: now,             // REQUIRED
      parentId: activeReplyParentId ?? null,
      imageUrl: cImg ?? undefined,
      tagUserIds: commentTags ?? [],
    };

    await addCommentForKey(commentKey, newComment);
  }

  resetCommentState();
}


  const locationReviews = useMemo(() => {
    if (!drawerLoc) return [];
    const reviewKey = `loc:${drawerLoc.id}`;
    return comments[reviewKey] ?? [];
  }, [drawerLoc, comments]);

  function onDeleteComment(key: string, id: string) {
    void deleteCommentForKey(key, id);
  }

  /* ------------------------------------------------------------------------ */
  /*  DM SYSTEM                                                               */
  /* ------------------------------------------------------------------------ */

  const [dmOpen, setDmOpen] = useState(false);
  const [dmRecipientId, setDmRecipientId] = useState<string | null>(null);
  const [dmRecipientName, setDmRecipientName] = useState<string | null>(null);
  const [dmText, setDmText] = useState('');

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
          toUserId: ADMIN_USER_ID,
          text: 'Hey, fancy teaming up at Newsham Park soon?',
          createdAt: minutesAgo(15),
          read: true,
        },
        {
          id: 'm2',
          threadId: 't1',
          fromUserId: ADMIN_USER_ID,
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
          toUserId: ADMIN_USER_ID,
          text: 'Can we cross-promote our events on Paraverse?',
          createdAt: minutesAgo(60),
          read: false,
        },
      ],
    },
  ]);

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
    if (userId === currentUser.id) {
      return; // no DM to self
    }

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

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );

  const [profileFilter, setProfileFilter] = useState<
    'posts' | 'events' | 'marketplace' | 'collabs' | 'messages' | 'creators'
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
      target: { type: 'profile', id: ADMIN_USER_ID },
    },
    // 🔔 New notification that points to another user's profile
    {
      id: 'n4',
      kind: 'follow',
      createdAt: minutesAgo(20),
      read: false,
      actor: {
        id: 'u_demo_2',
        name: 'Haunted Helen',
      },
      text: 'updated their profile.',
      target: { type: 'profile', id: 'u_demo_2' },
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
      prev.map((item) => (item.id === n.id ? { ...item, read: true } : item)),
    );

    if (!n.target) return;

    switch (n.target.type) {
      case 'post':
        setTab('home');
        setProfileHubOpen(false);
        break;
      case 'event':
        setTab('events');
        setProfileHubOpen(false);
        break;
      case 'marketplace':
        setTab('marketplace');
        setProfileHubOpen(false);
        break;
      case 'collab':
        setTab('collaboration');
        setProfileHubOpen(false);
        break;
      case 'profile':
        // If it's *your* profile, open your hub, otherwise open their drawer
        if (n.target.id === currentUser.id) {
          setTab('home');
          setProfileHubOpen(true);
          setProfileFilter('posts');
        } else {
          openUser(n.target.id);
        }
        break;
      default:
        break;
    }
  }

  function handleLogoClick() {
    if (currentUser.id === ADMIN_USER_ID) {
      // Admin clicking logo → open own hub on posts
      setTab('home');
      setProfileFilter('posts');
      setProfileHubOpen(true);
    } else {
      // Normal user → open Paraverse Admin drawer (support)
      openUser(ADMIN_USER_ID);
    }
  }

  /* ------------------------------------------------------------------------ */
  /*  TAB SWITCHING                                                           */
  /* ------------------------------------------------------------------------ */

  function handleSelectTab(next: TabKey) {
    if (next === 'profile') {
      // 🔴 Profile tab always opens YOUR hub
      setProfileHubOpen(true);
      setProfileFilter('posts');
      return;
    }
    setTab(next);
    setProfileHubOpen(false);
  }

  function openPostFromProfile(postId: string) {
    setProfileHubOpen(false);
    setTab('home');
  }

  function openEventFromProfile(eventId: string) {
    setProfileHubOpen(false);
    setTab('events');
  }

  function openMarketFromProfile(itemId: string) {
    setProfileHubOpen(false);
    setTab('marketplace');
  }

  function openCollabFromProfile(collabId: string) {
    setProfileHubOpen(false);
    setTab('collaboration');
  }

  function openCreatorFromProfile(creatorPostId: string) {
    setProfileHubOpen(false);
    setTab('creators');
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

        if (tab === 'home' || tab === 'locations' || tab === 'marketplace') {
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

  // openUser now ONLY opens the User Drawer (never the hub)
  function openUser(userId: string) {
    const u = usersById[userId] ?? { id: userId, name: 'User' };
    setDrawerUser(u);
    setUserDrawerOpen(true);
    setProfileHubOpen(false);
  }

  async function handleSaveUserProfile(next: UserMini) {
    try {
      const exists = !!usersById[next.id];

      // Resolve avatar URL (upload if data URL)
      let finalAvatarUrl: string | null = next.avatarUrl ?? null;

      if (finalAvatarUrl && finalAvatarUrl.startsWith('data:image')) {
        try {
          const file = dataUrlToFile(
            finalAvatarUrl,
            `avatar_${next.id}_${Date.now()}.png`,
          );

          const path = `avatars/${next.id}/${file.name}`;
          finalAvatarUrl = await uploadImageToStorage(file, path);
          console.log('[User] uploaded avatar to Storage:', finalAvatarUrl);
        } catch (err) {
          console.error('[User] avatar upload failed, keeping null', err);
          finalAvatarUrl = null;
        }
      }

      const payload: any = {
        name: next.name,
        bio: next.bio ?? null,
        country: next.country ?? null,
        avatarUrl: finalAvatarUrl,
        socialLinks: next.socialLinks ?? [],
        // role will be wired later via admin tools / Firestore rules
      };

      if (exists) {
        await updateUserDoc(next.id, payload);
      } else {
        await createUser({
          id: next.id,
          ...payload,
        });
      }

      const updatedMini: UserMini = {
        ...next,
        avatarUrl: finalAvatarUrl ?? undefined,
      };

      setUsersById((prev) => ({
        ...prev,
        [updatedMini.id]: {
          ...(prev[updatedMini.id] ?? { id: updatedMini.id }),
          ...updatedMini,
        },
      }));

      if (updatedMini.id === currentUser.id) {
        setCurrentUser((prev) => ({
          ...prev,
          name: updatedMini.name,
          avatarUrl: updatedMini.avatarUrl,
        }));
      }

      setDrawerUser(updatedMini);
      setUserDrawerOpen(false);
    } catch (err) {
      console.error('[User] Failed to save profile', err);
    }
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
  /*  LOCATION FEED ACTIONS                                                   */
  /* ------------------------------------------------------------------------ */

  function onEditLocation(locId: string) {
    const loc = locations.find((l) => l.id === locId);
    if (!loc) return;

    if (!ensureCanManage((loc as any).ownerId)) return;

    setEditingLocation(loc);
    setLocFormOpen(true);
  }

  function onDeleteLocation(locId: string) {
    const loc = locations.find((l) => l.id === locId);
    if (!loc) return;

    if (!ensureCanManage((loc as any).ownerId)) return;

    if (!window.confirm('Delete this location? This cannot be undone.')) return;

    setLocations((prev) => prev.filter((l) => l.id !== locId));

    setComments((prev) => {
      const next = { ...prev };
      delete next[`loc:${locId}`];
      return next;
    });

    setStarredLocations((prev) => prev.filter((id) => id !== locId));

    deleteLocationDoc(locId).catch((err) => {
      console.error('Failed to delete location from Firestore', err);
    });
  }

  function onMessageLocationOwner(userId: string) {
    openDM(userId);
  }

  /* ------------------------------------------------------------------------ */
  /*  POST FORM + HELPERS                                                     */
  /* ------------------------------------------------------------------------ */

  const {
    url: postImg,
    file: postFile,
    onChange: postImgChange,
    clear: postImgClear,
  } = useImagePreview();
  const [postFormOpen, setPostFormOpen] = useState(false);
  const [postTagUsers, setPostTagUsers] = useState<string[]>([]);
  const [selectedLocId, setSelectedLocId] = useState<string>('');
  const [locQuery, setLocQuery] = useState('');

  const locationOptions = useMemo(() => {
    const base = locations.filter((l) => l.type === 'HAUNTING');
    const q = locQuery.trim().toLowerCase();

    const filtered = q
      ? base.filter((l) => l.title.toLowerCase().includes(q))
      : base;

    return filtered.slice(0, 20);
  }, [locations, locQuery]);

  const creatorLocationOptions = useMemo(
    () =>
      locations
        .filter((l) => l.type === 'HAUNTING')
        .map((l) => ({ id: l.id, name: l.title })),
    [locations],
  );

  async function handleAddPost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);

    const id = String(fd.get('id') || '').trim();
    const isEdit = !!id;

    const title = String(fd.get('title') || '').trim();
    const desc = String(fd.get('desc') || '').trim();
    const linkUrlRaw = String(fd.get('link') || '').trim();
    const linkUrl = linkUrlRaw || undefined;
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

    if (!title) return;

    let uploadedImageUrl: string | undefined;

    if (postFile) {
      try {
        const safeName = postFile.name.replace(/\s+/g, '_');
        const path = `posts/${currentUser.id}/${Date.now()}_${safeName}`;
        uploadedImageUrl = await uploadImageToStorage(postFile, path);
        console.log('[Post] image uploaded:', uploadedImageUrl);
      } catch (err) {
        console.error('[Post] image upload failed', err);
      }
    }

    if (isEdit) {
      const patch: Partial<DemoPost> = {
        title,
        desc,
      };

      if (selectedLocId) patch.locationId = selectedLocId;
      if (uploadedImageUrl) {
        (patch as any).imageUrl = uploadedImageUrl;
      }
      if (linkUrl !== undefined) (patch as any).linkUrl = linkUrl;
      if (linkKind !== undefined) (patch as any).linkKind = linkKind;
      if (postTagUsers.length) (patch as any).tagUserIds = [...postTagUsers];

      await editPost(id, patch);

      postImgClear();
      setPostTagUsers([]);
      setSelectedLocId('');
      setLocQuery('');
      setPostFormOpen(false);
      setEditingPost(null);
      return;
    }

    const data: any = {
      type: 'Post',
      title,
      desc,
      authorId: currentUser.id,
      authorName: currentUser.name,
      createdAt: Date.now(),
    };

    if (selectedLocId) data.locationId = selectedLocId;

    if (uploadedImageUrl) {
      data.imageUrl = uploadedImageUrl;
    } else if (postImg) {
      data.imageUrl = postImg;
    }

    if (linkUrl) data.linkUrl = linkUrl;
    if (linkKind) data.linkKind = linkKind;
    if (postTagUsers.length) data.tagUserIds = [...postTagUsers];

    try {
      const saved = await createPost(data);
      setPosts((prev) => [saved, ...prev]);
    } catch (err) {
      console.error('Error creating post:', err);
    }

    postImgClear();
    setPostTagUsers([]);
    setSelectedLocId('');
    setLocQuery('');
    setPostFormOpen(false);
  }

  async function editPost(id: string, patch: Partial<DemoPost>) {
    try {
      const safePatch: Record<string, any> = {};
      Object.entries(patch).forEach(([k, v]) => {
        if (v !== undefined) safePatch[k] = v;
      });

      await updatePostDoc(id, safePatch);

      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...safePatch } : p)),
      );
    } catch (err) {
      console.error('Error editing post:', err);
    }
  }

  async function deletePost(id: string) {
    const target = posts.find((p) => p.id === id);
    if (!target) return;

    if (!canManageByOwnerId(target.authorId)) {
      window.alert('You can only delete your own posts.');
      return;
    }

    try {
      await deletePostDoc(id);
    } catch (err) {
      console.error('Error deleting post from Firestore:', err);
    }

    setPosts((prev) => prev.filter((p) => p.id !== id));
    setComments((prev) => {
      const next = { ...prev };
      delete next[`post:${id}`];
      return next;
    });
  }

  // 🔑 MASTER ADMIN: can edit ANY post
  function canEditPost(p: DemoPost) {
    return canManageByOwnerId(p.authorId);
  }

  function startEditPost(post: DemoPost) {
    setEditingPost(post);
    setPostFormOpen(true);

    setSelectedLocId(post.locationId || '');
    setPostTagUsers(post.tagUserIds ?? []);
    setLocQuery('');
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

  const {
    url: locImg,
    file: locImgFile,
    onChange: locImgChange,
    clear: locImgClear,
  } = useImagePreview();

  function openAddLocation() {
    const center = mapRef.current?.getCenter();
    setNewLoc(
      center ? { lng: center[0], lat: center[1] } : { lng: -2.5, lat: 54.3 },
    );

    setEditingLocation(null);
    setTab('locations');
    setLocFormOpen(true);
  }

  async function handleAddLocation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log('[Location] submit started');

    const fd = new FormData(e.currentTarget);

    const title = String(fd.get('title') || '').trim();
    if (!title) {
      console.warn('[Location] missing title');
      return;
    }

    const summary = String(fd.get('summary') || '').trim() || undefined;
    const address = String(fd.get('address') || '').trim() || undefined;

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
    } catch (err) {
      console.warn('[Location] bad socialLinks JSON', err);
    }

    const primaryLink = socialLinks[0]?.url;
    const website =
      primaryLink || (String(fd.get('website') || '').trim() || undefined);

    const countryCode = String(fd.get('country') || country).toUpperCase();
    const postalCodeRaw = String(fd.get('postal') || '').trim();

    if (!postalCodeRaw) {
      console.warn('[Location] missing postal code');
      return;
    }
    const postalCode = postalCodeRaw;

    const editId = String(fd.get('id') || '').trim();
    const isEdit = !!editId;

    let lng = -2.5;
    let lat = 54.3;

    try {
      const geo = await geocodePostal(countryCode, postalCode);
      if (geo) {
        lng = geo.lng;
        lat = geo.lat;
        console.log('[Location] geocode result', geo);
      } else if (newLoc) {
        lng = newLoc.lng;
        lat = newLoc.lat;
        console.log('[Location] using newLoc fallback', newLoc);
      } else {
        console.log('[Location] using default coords');
      }
    } catch (err) {
      console.error('[Location] geocode failed, using default coords', err);
    }

    const verifiedByOwner = fd.get('verifiedByOwner') === 'on';

    try {
      if (isEdit) {
        console.log('[Location] editing existing location', editId);

        let uploadedImageUrl: string | undefined;

        if (locImgFile) {
          try {
            const safeName = locImgFile.name.replace(/\s+/g, '_');
            const path = `locations/${editId}_${Date.now()}_${safeName}`;
            uploadedImageUrl = await uploadImageToStorage(locImgFile, path);
            console.log(
              '[Location] uploaded new image for edit',
              uploadedImageUrl,
            );
          } catch (err) {
            console.error('[Location] image upload failed for edit', err);
          }
        }

        setLocations((prev) =>
          prev.map((l) =>
            l.id === editId
              ? ({
                  ...l,
                  title,
                  summary,
                  address,
                  website,
                  imageUrl: uploadedImageUrl ?? (l as any).imageUrl,
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

        const patch = stripUndefined({
          title,
          summary,
          address,
          website,
          imageUrl: uploadedImageUrl,
          verifiedByOwner,
          countryCode,
          postalCode,
          lat,
          lng,
          socialLinks,
        });

        try {
          await dbUpdateLocation(editId, patch as any);
          console.log('[Location] Firestore update OK');
        } catch (err) {
          console.error('[Location] Firestore update FAILED', err);
        }
      } else {
        console.log('[Location] creating new location');

        const baseWithoutId = {
          title,
          type: 'HAUNTING' as const,
          lat,
          lng,
          summary,
          address,
          website,
          verifiedByOwner,
          countryCode,
          postalCode,
          ownerId: currentUser.id,
          ownerName: currentUser.name,
          socialLinks,
        };

        const cleanBase = stripUndefined(baseWithoutId);

        let created: LocationData;

        try {
          created = await createLocationWithImage(
            cleanBase as any,
            locImgFile ?? null,
          );
          console.log('[Location] Firestore create OK, id:', created.id);
        } catch (err) {
          console.error(
            '[Location] Firestore create FAILED – falling back to local only',
            err,
          );
          created = {
            id: crypto.randomUUID(),
            ...(baseWithoutId as any),
          } as LocationData;
        }

        setLocations((prev) => [created, ...prev]);

        setFollowedLocations((prev) =>
          prev.includes(created.id) ? prev : [created.id, ...prev],
        );
      }
    } catch (err) {
      console.error('[Location] handleAddLocation fatal error', err);
    }

    setTab('locations');

    if (mapRef.current?.focusOn) {
      mapRef.current.focusOn(lng, lat, 11);
    }

    setLocFormOpen(false);
    locImgClear();
    setNewLoc(null);
    setEditingLocation(null);

    console.log('[Location] submit finished');
  }

  /* ------------------------------------------------------------------------ */
  /*  EVENT FORM                                                              */
  /* ------------------------------------------------------------------------ */

  const [eventFormOpen, setEventFormOpen] = useState(false);
  const {
    url: evImg,
    file: evImgFile,
    onChange: evImgChange,
    clear: evImgClear,
  } = useImagePreview();

  async function handleAddEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const id = String(fd.get('id') || '').trim();
    const isEdit = !!id;

    const title = String(fd.get('title') || '').trim();
    if (!title) return;

    const description =
      String(fd.get('desc') || '').trim() || undefined;

    // SOCIAL LINKS
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
      // ignore – stay with empty/socialLinks
    }

    const primaryLink = socialLinks[0]?.url;

    const countryCode = String(fd.get('country') || country).toUpperCase();
    const postalCode = String(fd.get('postal') || '').trim() || undefined;

    // upload new image file (if any) to Storage
    let uploadedImageUrl: string | undefined;
    if (evImgFile) {
      try {
        const safeName = evImgFile.name.replace(/\s+/g, '_');
        const path = `events/${id || 'new'}_${Date.now()}_${safeName}`;
        uploadedImageUrl = await uploadImageToStorage(evImgFile, path);
        console.log('[Event] uploaded image:', uploadedImageUrl);
      } catch (err) {
        console.error('[Event] image upload failed', err);
      }
    }

    // EDIT PATH
    if (isEdit) {
      const existing = events.find((ev) => ev.id === id) || null;
      if (!existing) {
        console.warn('[Event] edit requested for missing id', id);
      }

      const patchBase: Partial<EventItem> = {
        title,
        description,
        link: primaryLink,
        imageUrl: uploadedImageUrl ?? existing?.imageUrl,
        countryCode,
        postalCode,
        socialLinks,
      };

      const patch = stripUndefined(patchBase as any);

      // Optimistic UI
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === id ? ({ ...ev, ...patch } as EventItem) : ev,
        ),
      );

      try {
        await updateEventDoc(id, patch as any);
        console.log('[Event] Firestore update OK', id);
      } catch (err) {
        console.error('[Event] Firestore update FAILED', err);
      }

      setEventFormOpen(false);
      setEditingEvent(null);
      evImgClear();
      return;
    }

    // CREATE PATH
    let lat = 54.3;
    let lng = -2.5;

    if (postalCode) {
      try {
        const geo = await geocodePostal(countryCode, postalCode);
        if (geo) {
          lng = geo.lng;
          lat = geo.lat;
          console.log('[Event] geocode result', geo);
        } else {
          console.log('[Event] geocode returned no result, using default');
        }
      } catch (err) {
        console.error('[Event] geocode failed, using default coords', err);
      }
    }

    const now = Date.now();

    try {
      console.log('[Event] creating event location');

      const locBaseWithoutId = {
        title,
        type: 'EVENT' as const,
        lat,
        lng,
        summary: description,
        address: undefined,
        priceInfo: undefined,
        website: primaryLink,
        imageUrl: uploadedImageUrl,
        countryCode,
        postalCode,
        ownerId: currentUser.id,
        ownerName: currentUser.name,
        socialLinks,
      };

      const cleanLoc = stripUndefined(locBaseWithoutId);
      let loc: LocationData;

      try {
        loc = await createLocation(cleanLoc as any);
        console.log('[Event] Firestore create location OK, id:', loc.id);
      } catch (err) {
        console.error(
          '[Event] Firestore create location FAILED – local only',
          err,
        );
        loc = {
          id: crypto.randomUUID(),
          ...(locBaseWithoutId as any),
        } as LocationData;
      }

      setLocations((prev) => [loc, ...prev]);

      const eventBase = {
        title,
        description,
        locationText: undefined,
        startISO: new Date().toISOString(),
        endISO: undefined,
        priceText: undefined,
        link: primaryLink,
        imageUrl: uploadedImageUrl,
        createdAt: now,
        postedBy: { id: currentUser.id, name: currentUser.name },
        countryCode,
        postalCode,
        locationId: loc.id,
        socialLinks,
      };

      const cleanEvent = stripUndefined(eventBase);
      let createdEvent: EventItem;

      try {
        createdEvent = await createEvent(cleanEvent as any);
        console.log('[Event] Firestore create event OK, id:', createdEvent.id);
      } catch (err) {
        console.error(
          '[Event] Firestore create event FAILED – local only',
          err,
        );
        createdEvent = {
          id: crypto.randomUUID(),
          ...(eventBase as any),
        } as EventItem;
      }

      setEvents((prev) => [...prev, createdEvent]);

      if (mapRef.current?.focusOn) {
        mapRef.current.focusOn(loc.lng, loc.lat, 10);
      }

      setEventFormOpen(false);
      setEditingEvent(null);
      evImgClear();
    } catch (err) {
      console.error('[Event] handleAddEvent fatal error', err);
    }
  }

  /* ------------------------------------------------------------------------ */
  /*  MARKETPLACE FORM                                                        */
  /* ------------------------------------------------------------------------ */

  const [listingFormOpen, setListingFormOpen] = useState(false);
  const {
    url: mkImg,
    file: mkImgFile,
    onChange: mkImgChange,
    clear: mkImgClear,
  } = useImagePreview();

  function startEditListing(item: MarketplaceItem) {
    setEditingListing(item);
    setListingFormOpen(true);
  }

  async function handleAddListing(e: FormEvent<HTMLFormElement>) {
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
      // ignore bad JSON
    }

    const primaryLink = socialLinks[0]?.url;

    const countryCode = String(fd.get('country') || country).toUpperCase();
    const postalCode = String(fd.get('postal') || '').trim() || undefined;

    const existingImage =
      isEdit && editingListing && editingListing.id === editId
        ? editingListing.imageUrl
        : undefined;

    let uploadedImageUrl: string | undefined;
    if (mkImgFile) {
      try {
        const safeName = mkImgFile.name.replace(/\s+/g, '_');
        const path = `marketplace/${editId || 'new'}_${Date.now()}_${safeName}`;
        uploadedImageUrl = await uploadImageToStorage(mkImgFile, path);
        console.log('[Marketplace] uploaded image:', uploadedImageUrl);
      } catch (err) {
        console.error('[Marketplace] image upload failed', err);
      }
    }

    const finalImage = uploadedImageUrl ?? existingImage;

    try {
      if (isEdit) {
        const patch: any = {
          kind,
          title,
          description,
          countryCode,
        };

        if (primaryLink) patch.webLink = primaryLink;
        if (postalCode) patch.postalCode = postalCode;
        if (finalImage) patch.imageUrl = finalImage;
        if (socialLinks.length) patch.socialLinks = socialLinks;

        await updateMarketplaceDoc(editId, patch);

        setMarket((prev) =>
          prev.map((item) =>
            item.id === editId
              ? {
                  ...item,
                  ...patch,
                }
              : item,
          ),
        );
      } else {
        const data: any = {
          kind,
          title,
          description,
          createdAt: Date.now(),
          postedBy: { id: currentUser.id, name: currentUser.name },
          countryCode,
        };

        if (primaryLink) data.webLink = primaryLink;
        if (postalCode) data.postalCode = postalCode;
        if (finalImage) data.imageUrl = finalImage;
        if (socialLinks.length) data.socialLinks = socialLinks;

        const created = await createMarketplaceItem(data);
        setMarket((prev) => [created, ...prev]);
      }
    } catch (err) {
      console.error('Failed to save marketplace listing', err);
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

  const {
    url: cbImg,
    file: cbImgFile,
    onChange: cbImgChange,
    clear: cbImgClear,
  } = useImagePreview();

  async function handleAddCollab(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    type SocialLinkLocal = { platform: string; url: string };

    const title = String(fd.get('title') || '').trim();
    const description = String(fd.get('desc') || '').trim();

    if (!title) return;

    const editId = String(fd.get('id') || '').trim();
    const isEdit = !!editId;

    const hiddenLocationId =
      String(fd.get('locationId') || '').trim() || undefined;

    let socialLinks: SocialLinkLocal[] = [];
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
            platform: String(x.platform),
            url: x.url.trim(),
          }));
      }
    } catch {
      // ignore
    }

    const primaryContact = socialLinks[0]?.url;

    const countryCode = String(fd.get('country') || country).toUpperCase();
    const postalCode = String(fd.get('postal') || '').trim() || undefined;

    const existingImage =
      isEdit && editingCollab && editingCollab.id === editId
        ? editingCollab.imageUrl
        : undefined;

    let uploadedImageUrl: string | undefined;
    if (cbImgFile) {
      try {
        const safeName = cbImgFile.name.replace(/\s+/g, '_');
        const path = `collabs/${editId || 'new'}_${Date.now()}_${safeName}`;
        uploadedImageUrl = await uploadImageToStorage(cbImgFile, path);
        console.log('[Collab] uploaded image:', uploadedImageUrl);
      } catch (err) {
        console.error('[Collab] image upload failed', err);
      }
    }

    const finalImage = uploadedImageUrl ?? existingImage;

    try {
      if (isEdit) {
        const patch: any = {
          title,
          countryCode,
        };

        if (description) patch.description = description;
        if (primaryContact) patch.contact = primaryContact;
        if (postalCode) patch.postalCode = postalCode;
        if (finalImage) patch.imageUrl = finalImage;
        if (socialLinks.length) patch.socialLinks = socialLinks;
        if (hiddenLocationId) patch.locationId = hiddenLocationId;

        await updateCollabDoc(editId, patch);

        setCollabs((prev) =>
          prev.map((c) =>
            c.id === editId
              ? {
                  ...c,
                  ...patch,
                }
              : c,
          ),
        );
      } else {
        let lat = 54.3;
        let lng = -2.5;

        if (postalCode) {
          try {
            const geo = await geocodePostal(countryCode, postalCode);
            if (geo) {
              lng = geo.lng;
              lat = geo.lat;
              console.log('[Collab] geocode result', geo);
            } else {
              console.log(
                '[Collab] geocode returned no result, using default',
              );
            }
          } catch (err) {
            console.error('[Collab] geocode failed, using default coords', err);
          }
        }

        const locBaseWithoutId = {
          title,
          type: 'COLLAB' as const,
          lat,
          lng,
          summary: description,
          imageUrl: finalImage || undefined,
          countryCode,
          postalCode,
          ownerId: currentUser.id,
          ownerName: currentUser.name,
          socialLinks,
        };

        const cleanLoc = stripUndefined(locBaseWithoutId);
        let loc: LocationData;

        try {
          loc = await createLocation(cleanLoc as any);
          console.log('[Collab] Firestore create location OK, id:', loc.id);
        } catch (err) {
          console.error(
            '[Collab] Firestore create location FAILED – local only',
            err,
          );
          loc = {
            id: crypto.randomUUID(),
            ...(locBaseWithoutId as any),
          } as LocationData;
        }

        setLocations((prev) => [loc, ...prev]);

        const data: any = {
          title,
          createdAt: Date.now(),
          postedBy: { id: currentUser.id, name: currentUser.name },
          countryCode,
          locationId: loc.id,
        };

        if (description) data.description = description;
        if (primaryContact) data.contact = primaryContact;
        if (postalCode) data.postalCode = postalCode;
        if (finalImage) data.imageUrl = finalImage;
        if (socialLinks.length) data.socialLinks = socialLinks;

        const created = await createCollab(data);
        setCollabs((prev) => [created, ...prev]);

        if (mapRef.current?.focusOn) {
          mapRef.current.focusOn(loc.lng, loc.lat, 10);
        }
      }
    } catch (err) {
      console.error('Failed to save collaboration', err);
    }

    setEditingCollab(null);
    setCollabFormOpen(false);
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

  const sortCreatorPosts = (a: CreatorPost, b: CreatorPost) =>
    b.createdAt - a.createdAt;

  const creatorPostsByLocation = useMemo(() => {
    const map: Record<string, CreatorPost[]> = {};

    for (const cp of creatorPosts) {
      if (!cp.locationId) continue;
      if (!map[cp.locationId]) map[cp.locationId] = [];
      map[cp.locationId].push(cp);
    }

    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => b.createdAt - a.createdAt),
    );

    return map;
  }, [creatorPosts]);

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

  // these are now always for the *current user* (hub is self-only)
  const userEventsForSelected = useMemo(
    () => events.filter((e) => e.postedBy?.id === currentUser.id),
    [events, currentUser.id],
  );

  const userMarketForSelected = useMemo(
    () => market.filter((m) => m.postedBy?.id === currentUser.id),
    [market, currentUser.id],
  );

  const userCollabsForSelected = useMemo(
    () => collabs.filter((c) => c.postedBy?.id === currentUser.id),
    [collabs, currentUser.id],
  );

  const postsForSelectedUser = useMemo(
    () => posts.filter((p) => p.authorId === currentUser.id).sort(sortPosts),
    [posts, currentUser.id],
  );

  const userCreatorsForSelected = useMemo(
    () =>
      creatorPosts
        .filter((p) => p.postedBy.id === currentUser.id)
        .sort(sortCreatorPosts),
    [creatorPosts, currentUser.id],
  );

  /* ------------------------------------------------------------------------ */
  /*  CREATOR POSTS HELPERS                                                   */
  /* ------------------------------------------------------------------------ */

  async function createCreatorPost(input: {
    title: string;
    description?: string;
    youtubeUrl: string;
    locationId: string;
  }) {
    const loc = locations.find((l) => l.id === input.locationId);
    const locationText = loc?.title ?? 'Unknown location';

    const postedBy: any = {
      id: currentUser.id,
      name: currentUser.name,
    };
    if (currentUser.avatarUrl) {
      postedBy.avatarUrl = currentUser.avatarUrl;
    }

    const data: any = {
      title: input.title,
      youtubeUrl: input.youtubeUrl,
      locationId: input.locationId,
      locationText,
      createdAt: Date.now(),
      postedBy,
    };

    if (input.description) {
      data.description = input.description;
    }

    try {
      const saved = await createCreatorPostDoc(data);
      setCreatorPosts((prev) => [saved, ...prev]);
    } catch (err) {
      console.error('Error creating creator post:', err);
    }
  }

  async function handleAddCreator(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const title = String(fd.get('title') || '').trim();
    const description =
      String(fd.get('desc') || '').trim() || undefined;
    const youtubeUrl = String(fd.get('youtubeUrl') || '').trim();
    const locationId = String(fd.get('locationId') || '').trim();

    if (!title || !youtubeUrl || !locationId) return;

    await createCreatorPost({
      title,
      description,
      youtubeUrl,
      locationId,
    });

    setEditingCreator(null);
    setCreatorFormOpen(false);
  }

  /* ======================================================================== */
  /*  RENDER                                                                  */
  /* ======================================================================== */

  return (
    <main className="flex min-h-screen flex-col bg-[#0B0C0E] text-white">
      {/* HEADER */}
<ParaverseHeader
  tab={tab}
  onSelectTab={handleSelectTab}
  currentUser={currentUser}
  unreadNotifications={unreadNotificationCount}
  unreadMessages={unreadDmCount}
  onOpenMessagesHub={() => {
    setProfileHubOpen(true);
    setProfileFilter('messages');
  }}
  onLogoClick={handleLogoClick}
  onLogout={handleLogout}
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
        locationStars={locationStars}
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
        followedUsers={followedUsers}
        toggleFollowUser={toggleFollowUser}
        setUsersById={setUsersById}
        setCurrentUser={setCurrentUser}
        setDrawerUser={setDrawerUser}
        setUserDrawerOpen={setUserDrawerOpen}
        creatorPostsByLocation={creatorPostsByLocation}
        onSaveUserProfile={handleSaveUserProfile}
        isAdmin={isAdmin}
        onEditLocation={onEditLocation}
        onDeleteLocation={onDeleteLocation}
        onToggleAdminRole={handleToggleAdminRole}
      />



      {/* FEEDS */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-6">
          {/* PROFILE HUB – SELF ONLY */}
          {profileHubOpen && (
            <div className="mb-6">
              <ProfileHubSection
                selectedUserId={currentUser.id}
                currentUser={currentUser}
                usersById={usersById}
                profileFilter={profileFilter}
                setProfileFilter={setProfileFilter}
                postsForSelectedUser={postsForSelectedUser}
                userEventsForSelected={userEventsForSelected}
                userMarketForSelected={userMarketForSelected}
                userCollabsForSelected={userCollabsForSelected}
                userCreatorsForSelected={userCreatorsForSelected}
                sortedNotifications={sortedNotifications}
                sortedDmThreads={sortedDmThreads}
                formatShortDate={formatShortDate}
                handleNotificationClick={handleNotificationClick}
                openDM={openDM}
                openEditProfile={openEditProfile}
                onOpenPostFromProfile={openPostFromProfile}
                onOpenEventFromProfile={openEventFromProfile}
                onOpenMarketFromProfile={openMarketFromProfile}
                onOpenCollabFromProfile={openCollabFromProfile}
                onOpenCreatorFromProfile={openCreatorFromProfile}
              />
            </div>
          )}

          {/* When profile hub is open, hide all the tab feeds */}
          {!profileHubOpen && (
            <>
              {/* HOME */}
     {tab === 'home' && (
  <HomeSection
    currentUser={currentUser}
    feedFilter={feedFilter}
    setFeedFilter={setFeedFilter}
    filteredPosts={filteredPosts}
    onStartEditPost={startEditPost}
    deletePost={deletePost}
    canEditPost={canEditPost}
    comments={comments}
    openComment={openComment}
    openEditComment={openEditComment}
    onDeleteComment={onDeleteComment}
    canEditComment={canEditComment}
    usersById={usersById}
    followedUsers={followedUsers}
    openUser={openUser}
    sortPosts={sortPosts}
    setPostFormOpen={setPostFormOpen}
    onOpenImage={(src) => setLightboxSrc(src)}
    onOpenLocationFromTag={focusLocationById}
  />
)}


              {/* LOCATIONS */}
              {tab === 'locations' && (
                <LocationsSection
                  country={country}
                  countries={countries}
                  locationsByStars={locationsByStars}
                  locationStars={locationStars}
                  comments={comments}
                  usersById={usersById}
                  giveLocationStar={giveLocationStar}
                  openFromPin={openFromPin}
                  openComment={openComment}
                  openEditComment={openEditComment}
                  openUser={openUser}
                  openAddLocation={openAddLocation}
                  formatShortDate={formatShortDate}
                  currentUserId={currentUser.id}
                  isAdmin={isAdmin}
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
                  isAdmin={isAdmin}
                  onAddEvent={() => {
                    setEditingEvent(null);
                    setEventFormOpen(true);
                  }}
                  onEditEvent={(id) => {
                    const ev = events.find((e) => e.id === id) || null;
                    if (!ev) return;
                    setEditingEvent(ev);
                    setEventFormOpen(true);
                  }}
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
                  isAdmin={isAdmin}
                  onOpenDM={openDM}
                  onAddListing={() => {
                    setEditingListing(null);
                    setListingFormOpen(true);
                  }}
                  onEditListing={startEditListing}
                  onDeleteListing={async (id) => {
                    const target = market.find((m) => m.id === id);
                    if (!target) return;

                    if (!ensureCanManage(target.postedBy?.id)) return;

                    try {
                      await deleteMarketplaceDoc(id);
                      setMarket((prev) =>
                        prev.filter((m) => m.id !== id),
                      );
                    } catch (err) {
                      console.error(
                        'Failed to delete marketplace listing',
                        err,
                      );
                    }
                  }}
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
                  isAdmin={isAdmin}
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
                    const found =
                      collabs.find((c) => c.id === id) || null;
                    setEditingCollab(found);
                    cbImgClear();
                    setCollabFormOpen(true);
                  }}
                  onDeleteCollab={async (id) => {
                    try {
                      await deleteCollabDoc(id);
                      setCollabs((prev) =>
                        prev.filter((c) => c.id !== id),
                      );
                    } catch (err) {
                      console.error(
                        'Failed to delete collaboration',
                        err,
                      );
                    }
                  }}
                />
              )}

              {/* CREATORS HUB */}
              {tab === 'creators' && (
                <CreatorsSection
                  currentUser={currentUser}
                  posts={creatorPosts}
                  sortPosts={sortCreatorPosts}
                  onOpenUser={openUser}
                  onOpenLocation={(locId) => focusLocationById(locId)}
                  onOpenCreateForm={() => {
                    setEditingCreator(null);
                    setCreatorFormOpen(true);
                  }}
                  onEditPost={(post) => {
                    setEditingCreator(post);
                    setCreatorFormOpen(true);
                  }}
                  onDeletePost={async (id) => {
                    setCreatorPosts((prev) =>
                      prev.filter((p) => p.id !== id),
                    );

                    try {
                      await deleteCreatorPostDoc(id);
                      console.log(
                        '[Creators] Deleted from Firestore:',
                        id,
                      );
                    } catch (err) {
                      console.error(
                        '[Creators] Firestore delete failed',
                        err,
                      );
                    }
                  }}
                  canEditPost={(p) =>
                    p.postedBy.id === currentUser.id || isAdmin
                  }
                  onReportPost={(post) => {
                    setNotifications((prev) => [
                      {
                        id: crypto.randomUUID(),
                        kind: 'report_video' as any,
                        createdAt: new Date().toISOString(),
                        read: false,
                        actor: {
                          id: currentUser.id,
                          name: currentUser.name,
                        },
                        text: `reported a creator video: "${post.title}"`,
                        target: { type: 'creators', id: post.id },
                      },
                      ...prev,
                    ]);

                    window.alert(
                      'Thanks. Your report has been sent to Paraverse Admin.',
                    );
                  }}
                />
              )}
            </>
          )}
        </div>
      </section>

      {/* ======================= MODALS ======================= */}

      {/* POST MODAL */}
      <Modal
        open={postFormOpen}
        onClose={() => {
          setPostFormOpen(false);
          setEditingPost(null);
          postImgClear();
          setPostTagUsers([]);
          setSelectedLocId('');
          setLocQuery('');
        }}
      >
        <PostForm
          mode={editingPost ? 'edit' : 'create'}
          initialPost={
            editingPost
              ? {
                  id: editingPost.id,
                  title: editingPost.title,
                  desc: editingPost.desc,
                  linkUrl: (editingPost as any).linkUrl || '',
                  linkKind: (editingPost as any).linkKind,
                  locationId: editingPost.locationId,
                  tagUserIds: editingPost.tagUserIds ?? [],
                }
              : undefined
          }
          handleAddPost={handleAddPost}
          postImg={postImg}
          postImgChange={postImgChange}
          postImgClear={postImgClear}
          postTagUsers={postTagUsers}
          setPostTagUsers={setPostTagUsers}
          taggableUsers={
            followedUsers
              .map((id) => usersById[id])
              .filter((u) => !!u) as { id: string; name: string }[]
          }
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
          locImg={locImg ?? null}
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
      <Modal
        open={eventFormOpen}
        onClose={() => {
          setEventFormOpen(false);
          setEditingEvent(null);
          evImgClear();
        }}
      >
        <EventForm
          handleAddEvent={handleAddEvent}
          evImg={evImg}
          evImgChange={evImgChange}
          country={country}
          countries={countries}
          onCancel={() => {
            setEventFormOpen(false);
            setEditingEvent(null);
            evImgClear();
          }}
          mode={editingEvent ? 'edit' : 'create'}
          initialEvent={
            editingEvent
              ? {
                  id: editingEvent.id,
                  title: editingEvent.title,
                  description: editingEvent.description,
                  countryCode: editingEvent.countryCode,
                  postalCode: editingEvent.postalCode,
                  socialLinks: (editingEvent as any).socialLinks ?? [],
                  imageUrl: editingEvent.imageUrl,
                }
              : undefined
          }
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
  initialItem={editingListing ? mapMarketplaceItemToForm(editingListing) : undefined}
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

      {/* CREATOR MODAL */}
      <Modal
        open={creatorFormOpen}
        onClose={() => {
          setCreatorFormOpen(false);
          setEditingCreator(null);
        }}
      >
        <CreatorForm
          mode={editingCreator ? 'edit' : 'create'}
          initialPost={editingCreator ?? undefined}
          handleAddCreator={handleAddCreator}
          locationsForSelect={creatorLocationOptions}
          onCancel={() => {
            setCreatorFormOpen(false);
            setEditingCreator(null);
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
