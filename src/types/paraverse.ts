import type { EventsFeedEvent } from '@/components/feed/EventsFeed';

/* ============================================================================
   TYPES
============================================================================ */

export type DemoPost = {
  id: string;
  type: 'Post';
  title: string;
  desc: string;
  locationId?: string;
  imageUrl?: string;
  linkUrl?: string;

  // 👇 NEW: what kind of link it is
  linkKind?: 'youtube' | 'tiktok' | 'instagram' | 'facebook' | 'other';

  authorId: string;
  authorName: string;
  tagUserIds?: string[];
  createdAt: number;
};


export type MarketplaceItem = {
  id: string;
  kind: 'Product' | 'Service';
  title: string;
  description: string;
  imageUrl?: string;

  contactInfo?: string; // kept for backwards compatibility
  webLink?: string;     // single standard link

  createdAt: number;
  postedBy: { id: string; name: string };
  countryCode?: string;
  postalCode?: string;
  // 🔥 remove socialLinks – we don't need it for marketplace anymore
};


export type EventItem = EventsFeedEvent & {
  locationId?: string;
  socialLinks?: SocialLink[];
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
  text: string;
  authorId: string;
  authorName: string;
  createdAt: number;
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
  | 'dm';

export type NotificationTargetType =
  | 'post'
  | 'event'
  | 'marketplace'
  | 'collab'
  | 'profile';

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
