'use client';

import PostCard from './PostCard';

// Inline DemoPost type to avoid '@/types' import
export type DemoPost = {
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
  tagLocationIds?: string[];
  createdAt: number;
};

type Props = {
  posts: DemoPost[];
  /** current user id used by PostCard for ownership / stars / etc. */
  currentUserId?: string;
  onViewOnMap?: (locationId: string) => void;
};

export default function PostsFeed({ posts, currentUserId, onViewOnMap }: Props) {
  // fallback so we always pass a string to PostCard
  const uid = currentUserId ?? 'u_current';

  return (
    <div className="grid gap-4">
      {posts.map((p, i) => (
        <PostCard
          key={p.id ?? i}
          post={p}
          currentUserId={uid}
          onViewOnMap={onViewOnMap}
        />
      ))}
    </div>
  );
}


