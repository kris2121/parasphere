/* ============================================================================
   SOCIAL LINKS
============================================================================ */

export type SocialPlatform =
  | 'YouTube'
  | 'TikTok'
  | 'Instagram'
  | 'Facebook'
  | 'Link';

export type SocialLink = {
  platform: SocialPlatform;
  url: string;
};

/* ============================================================================
   CORE CONTENT TYPES
============================================================================ */

export type DemoPost = {
  id: string;
  type: 'Post';
  title: string;
  desc: string;
  locationId?: string;
  imageUrl?: string;
  linkUrl?: string;

  // what kind of link it is
  linkKind?: 'youtube' | 'tiktok' | 'instagram' | 'facebook' | 'other';

  authorId: string;
  authorName: string;
  tagUserIds?: string[];
  createdAt: number;
};

export type MarketplaceItem = {
  id: string;
  // Internal kind used in forms / DB
  kind: 'For Sale' | 'Wanted';
  title: string;
  description: string;
  imageUrl?: string;

  // legacy / generic link fields
  contactInfo?: string;
  webLink?: string;

  createdAt: number;
  postedBy: { id: string; name: string };
  countryCode?: string;
  postalCode?: string;
  // no socialLinks here; those live on events/collabs/locations instead
};

/**
 * Event items used in EventsFeed + page.tsx
 * (previously extended EventsFeedEvent, now self-contained)
 */
export type EventItem = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;

  countryCode?: string;
  postalCode?: string;
  locationId?: string;

  // multi-link support (primary link usually first)
  socialLinks?: SocialLink[];

  createdAt: number;

  postedBy?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };

  // allow page.tsx / feeds to tack on extra fields safely
  [key: string]: any;
};

export type CollabItem = {
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
  locationId?: string;
  socialLinks?: SocialLink[];
};

export type Comment = {
  id: string;
  key: string; // e.g. "post:123", "loc:456"
  text: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  updatedAt: number;
  imageUrl?: string;
  parentId?: string | null;
  tagUserIds?: string[];
};

/* ======================= MESSAGES & NOTIFICATIONS TYPES ==================== */

export type NotificationKind =
  | 'comment_reply'
  | 'tagged_in_comment'
  | 'market_comment'
  | 'collab_comment'
  | 'follow'
  | 'dm'
  // extra kinds used in page.tsx
  | 'report_creator'
  | 'report_user'
  | 'report_video';

export type NotificationTargetType =
  | 'post'
  | 'event'
  | 'marketplace'
  | 'collab'
  | 'profile'
  // extra targets used in page.tsx
  | 'creator'
  | 'creators';

export type NotificationTarget = {
  type: NotificationTargetType;
  id: string;
};

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  createdAt: string; // ISO string
  read: boolean;
  actor: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  text: string;
  target?: NotificationTarget;
};

export type DMMessage = {
  id: string;
  threadId: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  createdAt: string; // ISO
  read: boolean;
};

export type DMThread = {
  id: string;
  otherUser: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  lastMessageAt: string; // ISO
  messages: DMMessage[];
};



