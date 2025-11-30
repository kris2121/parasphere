import type { EventsFeedEvent } from '@/components/feed/EventsFeed';

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
   CORE FEED TYPES
============================================================================ */

export type DemoPost = {
  id: string;
  type: 'Post';
  title: string;
  desc: string;
  locationId?: string;
  imageUrl?: string;
  linkUrl?: string;

  // What kind of external link this post has (for icons / routing)
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

  // Legacy / compatibility fields
  contactInfo?: string;
  webLink?: string; // single standard link

  createdAt: number;
  postedBy: { id: string; name: string };
  countryCode?: string;
  postalCode?: string;
  // NOTE: socialLinks removed for marketplace – not needed here
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

/* ============================================================================
   MESSAGES & NOTIFICATIONS
============================================================================ */

export type NotificationKind =
  | 'comment_reply'
  | 'tagged_in_comment'
  | 'market_comment'
  | 'collab_comment'
  | 'follow'
  | 'dm'
  // Extra kinds used in page.tsx (reports etc.)
  | 'report_creator'
  | 'report_user'
  | 'report_video';

export type NotificationTargetType =
  | 'post'
  | 'event'
  | 'marketplace'
  | 'collab'
  | 'profile'
  // Extra targets used in page.tsx
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


