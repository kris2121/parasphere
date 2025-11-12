'use client';

import PostCard from './PostCard';
import type { DemoPost } from '@/types'; // keep your existing import(s)

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

