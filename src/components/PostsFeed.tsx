'use client';

import PostCard, { DemoPost } from './PostCard';

export default function PostsFeed({
  posts,
  onViewOnMap,
}: {
  posts: DemoPost[];
  onViewOnMap?: (locationId: string) => void;
}) {
  return (
    <div className="grid gap-4">
      {posts.map((p, i) => (
        <PostCard key={i} post={p} onViewOnMap={onViewOnMap} />
      ))}
    </div>
  );
}
