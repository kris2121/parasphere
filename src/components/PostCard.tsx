'use client';

function youtubeIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1) || null;
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v'); if (v) return v;
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || null;
      if (u.pathname.startsWith('/embed/'))  return u.pathname.split('/')[2] || null;
    }
  } catch {}
  return null;
}
function youtubeThumb(url: string): string | null {
  const id = youtubeIdFromUrl(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

export type PostType =
  | 'Post • Haunting' | 'Post • UFO' | 'Post • Cryptid'
  | 'Event' | 'For Sale' | 'Wanted'
  | 'Friend • Post' | 'Location • Haunting'
  | 'Sighting • UFO' | 'Sighting • Cryptid' | 'Report • UFO' | 'Report • Cryptid';

export type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
};

export type DemoPost = {
  // identity
  id?: string;
  authorId: string;
  authorName: string;

  // content
  type: PostType;
  title: string;
  desc: string;                 // what happened
  evidence?: string;
  locationId?: string;
  imageDataUrl?: string;        // single image preview
  videoUrls?: string[];         // external links

  // social
  taggedFriends?: string[];

  // stars (our “likes”)
  stars?: number;
  myStarred?: boolean;

  // comments
  comments?: Comment[];
};

export default function PostCard({
  post,
  currentUserId,
  onViewOnMap,
  onEdit,
  onToggleStar,
  onAddComment,
  onDeleteComment,
}: {
  post: DemoPost;
  currentUserId: string;
  onViewOnMap?: (locationId: string) => void;
  onEdit?: () => void;
  onToggleStar?: () => void;
  onAddComment?: (text: string) => void;
  onDeleteComment?: (commentId: string) => void;
}) {
  const videos = post.videoUrls ?? [];
  const canEdit = post.authorId === currentUserId;

  let commentInput = '';

  return (
    <article className="rounded-xl bg-neutral-900 border border-neutral-800 p-4 hover:border-neutral-700 transition">
      {/* IMAGE */}
      {post.imageDataUrl && (
        <div className="mb-3">
          <img
            src={post.imageDataUrl}
            alt=""
            className="w-full max-h-[420px] object-cover rounded-lg border border-neutral-800"
          />
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between mb-1">
        <div className="text-cyan-300 text-xs">{post.type}</div>
        <div className="text-xs text-neutral-400">by {post.authorName}</div>
      </div>
      <h3 className="text-lg font-semibold leading-tight">{post.title}</h3>

      {/* BODY */}
      <p className="text-neutral-300 text-sm mt-1">{post.desc}</p>
      {post.evidence && (
        <p className="text-neutral-400 text-xs mt-2">
          <span className="text-neutral-300">Evidence:</span> {post.evidence}
        </p>
      )}

      {/* VIDEO LINKS */}
      {videos.length > 0 && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {videos.map((u) => {
            const thumb = youtubeThumb(u);
            return thumb ? (
              <a
                key={u}
                href={u}
                target="_blank"
                rel="noopener noreferrer"
                className="group block relative rounded-lg overflow-hidden border border-neutral-800"
                title={u}
              >
                <img src={thumb} alt="" className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full border border-neutral-200/70 bg-black/30 px-3 py-1 text-sm">
                    ▶︎ Watch
                  </div>
                </div>
              </a>
            ) : (
              <a
                key={u}
                href={u}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-neutral-700 px-3 py-2 text-sm text-neutral-300 hover:border-neutral-600"
                title={u}
              >
                🔗 {new URL(u).hostname}
              </a>
            );
          })}
        </div>
      )}

      {/* TAGGED FRIENDS */}
      {post.taggedFriends && post.taggedFriends.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {post.taggedFriends.map((name, i) => (
            <span
              key={i}
              className="text-[11px] rounded-full border border-neutral-700 px-2 py-0.5 text-neutral-300"
            >
              @{name}
            </span>
          ))}
        </div>
      )}

      {/* ACTIONS */}
      <div className="mt-3 flex items-center gap-2">
        {post.locationId && onViewOnMap && (
          <button
            onClick={() => onViewOnMap(post.locationId!)}
            className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:border-cyan-500 hover:bg-cyan-500/10"
          >
            View on map
          </button>
        )}

        {/* Star = our “like” */}
        {onToggleStar && (
          <button
            onClick={onToggleStar}
            className={`rounded-md border px-3 py-1 text-sm ${
              post.myStarred
                ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
                : 'border-neutral-700 hover:border-neutral-600'
            }`}
            title={post.myStarred ? 'Unstar' : 'Star'}
          >
            ⭐ {post.stars ?? 0}
          </button>
        )}

        {/* Edit only for author */}
        {canEdit && onEdit && (
          <button
            onClick={onEdit}
            className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:border-cyan-500 hover:bg-cyan-500/10"
          >
            Edit
          </button>
        )}
      </div>

      {/* COMMENTS */}
      {post.comments && post.comments.length > 0 && (
        <div className="mt-4 space-y-2">
          {post.comments.map((c) => {
            const canDelete = c.authorId === currentUserId || canEdit;
            return (
              <div key={c.id} className="flex items-start gap-2">
                <div className="flex-1 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm">
                  <div className="text-xs text-neutral-400 mb-0.5">{c.authorName}</div>
                  <div className="text-neutral-200">{c.text}</div>
                </div>
                {canDelete && onDeleteComment && (
                  <button
                    onClick={() => onDeleteComment(c.id)}
                    className="text-neutral-500 hover:text-neutral-300 text-sm"
                    title="Remove comment"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add comment */}
      {onAddComment && (
        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const input = (e.currentTarget.elements.namedItem('cmt') as HTMLInputElement);
            const val = input.value.trim();
            if (val) onAddComment(val);
            input.value = '';
          }}
        >
          <input
            name="cmt"
            placeholder="Write a comment…"
            className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 placeholder-neutral-500 outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            className="rounded-md border border-neutral-700 px-3 py-2 text-sm hover:border-neutral-600"
          >
            Post
          </button>
        </form>
      )}
    </article>
  );
}




