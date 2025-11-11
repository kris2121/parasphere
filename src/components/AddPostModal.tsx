'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import type { LocationData } from './LiveMap';

// ---------- YouTube helpers ----------
function youtubeIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1) || null;
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] || null;
      if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] || null;
    }
  } catch {}
  return null;
}
function youtubeThumb(url: string): string | null {
  const id = youtubeIdFromUrl(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}
// -------------------------------------

// Minimal shape of an existing post for prefill
type ExistingPost = {
  locationId?: string;
  title?: string;
  desc?: string;           // what happened
  evidence?: string;
  imageDataUrl?: string;   // single image
  videoUrls?: string[];
  taggedFriends?: string[];
};

export default function AddPostModal({
  open,
  onClose,
  onSubmit,
  locations,
  friends,
  existing,          // ← prefill object (optional)
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    locationId: string;
    title: string;
    whatHappened: string;
    evidence?: string;
    imageDataUrl?: string;   // data URL (demo)
    videoUrls: string[];
    taggedFriends: string[];
  }) => void;
  locations: LocationData[];
  friends: string[];
  existing?: ExistingPost;
}) {
  // form state
  const [locationId, setLocationId] = useState(locations[0]?.id ?? '');
  const [title, setTitle] = useState('');
  const [whatHappened, setWhatHappened] = useState('');
  const [evidence, setEvidence] = useState('');

  // media
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(undefined);
  const [dragActive, setDragActive] = useState(false);

  const [videoInput, setVideoInput] = useState('');
  const [videoUrls, setVideoUrls] = useState<string[]>([]);

  // tagging
  const [tagQuery, setTagQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  // Detect edit mode
  const isEditing = !!existing;

  // Prefill on open/existing change
  useEffect(() => {
    if (!open) return;
    if (existing) {
      setLocationId(existing.locationId ?? locations[0]?.id ?? '');
      setTitle(existing.title ?? '');
      setWhatHappened(existing.desc ?? '');
      setEvidence(existing.evidence ?? '');
      setImageDataUrl(existing.imageDataUrl);
      setVideoUrls(existing.videoUrls ?? []);
      setSelectedFriends(existing.taggedFriends ?? []);
    } else {
      // fresh form
      setLocationId(locations[0]?.id ?? '');
      setTitle('');
      setWhatHappened('');
      setEvidence('');
      setImageDataUrl(undefined);
      setVideoUrls([]);
      setSelectedFriends([]);
    }
    setVideoInput('');
    setTagQuery('');
    setDragActive(false);
  }, [open, existing, locations]);

  const filteredFriends = useMemo(() => {
    const q = tagQuery.toLowerCase().trim();
    if (!q) return friends;
    return friends.filter(f => f.toLowerCase().includes(q));
  }, [friends, tagQuery]);

  const liveYTThumb = youtubeThumb(videoInput.trim());

  function toggleFriend(name: string) {
    setSelectedFriends((prev) =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  }

  // read image file into data URL (demo)
  const readImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  // input picker
  function handleImagePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    readImageFile(file);
  }

  // drag & drop
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }
  function onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readImageFile(file);
  }

  function addVideoUrl() {
    const raw = videoInput.trim();
    if (!raw) return;
    try {
      const parsed = new URL(raw);
      if (!/^https?:$/.test(parsed.protocol)) return;
      setVideoUrls((prev) => Array.from(new Set([...prev, raw])));
      setVideoInput('');
    } catch {
      /* ignore invalid url */
    }
  }

  function removeVideoUrl(u: string) {
    setVideoUrls((prev) => prev.filter(x => x !== u));
  }

  function clearPhoto() {
    setImageDataUrl(undefined);
  }

  function submit() {
    if (!locationId || !title || !whatHappened) return;
    onSubmit({
      locationId,
      title,
      whatHappened,
      evidence: evidence || undefined,
      imageDataUrl,
      videoUrls,
      taggedFriends: selectedFriends,
    });
    onClose(); // page handles resetting when reopening
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60">
      <div className="w-full max-w-2xl rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <h3 className="text-lg font-semibold mb-3">{isEditing ? 'Edit Post' : 'New Post'}</h3>

        {/* Location */}
        <label className="block text-sm text-neutral-300 mb-1">Location</label>
        <select
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm mb-3"
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
        >
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.title}</option>
          ))}
        </select>

        {/* Title */}
        <label className="block text-sm text-neutral-300 mb-1">Title</label>
        <input
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm mb-3"
          placeholder="Pendle Hill — late-night footsteps by the stile"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* What happened */}
        <label className="block text-sm text-neutral-300 mb-1">What happened?</label>
        <textarea
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm mb-3 h-28"
          placeholder="Tell us what you experienced…"
          value={whatHappened}
          onChange={(e) => setWhatHappened(e.target.value)}
        />

        {/* Evidence (optional) */}
        <label className="block text-sm text-neutral-300 mb-1">Evidence (optional)</label>
        <textarea
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm mb-3 h-20"
          placeholder="EVP, EMF readings, temperatures, etc."
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
        />

        {/* Media Row */}
        <div className="grid sm:grid-cols-2 gap-3">
          {/* Add Photo (picker + drag&drop) */}
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Add a photo (optional)</label>

            {!imageDataUrl ? (
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={[
                  'relative rounded-lg border border-dashed',
                  dragActive ? 'border-cyan-500 bg-cyan-500/5' : 'border-neutral-700 hover:border-neutral-600',
                  'p-4 text-center'
                ].join(' ')}
              >
                <input type="file" accept="image/*" onChange={handleImagePick} className="hidden" id="pick-photo" />
                <label htmlFor="pick-photo" className="inline-flex items-center gap-2 rounded-md border border-neutral-700 px-3 py-2 text-sm hover:border-neutral-600 cursor-pointer">
                  🖼️ Choose image
                </label>
                <div className="mt-2 text-xs text-neutral-400">…or drag & drop a photo here</div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <img
                  src={imageDataUrl}
                  alt="preview"
                  className="h-16 w-24 object-cover rounded-md border border-neutral-700"
                />
                <button onClick={clearPhoto} className="rounded-md border border-neutral-700 px-2 py-1 text-xs hover:border-neutral-600">
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Add Video Link (with live YouTube thumbnail) */}
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Add a video link (optional)</label>
            <div className="flex gap-2">
              <input
                value={videoInput}
                onChange={(e) => setVideoInput(e.target.value)}
                placeholder="https://youtu.be/…"
                className="flex-1 rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
              />
              <button
                onClick={addVideoUrl}
                className="rounded-md border border-neutral-700 px-3 py-2 text-sm hover:border-neutral-600"
              >
                Add
              </button>
            </div>

            {/* Live preview */}
            {videoInput.trim() && (
              <div className="mt-2">
                {liveYTThumb ? (
                  <div className="relative rounded-lg overflow-hidden border border-neutral-800">
                    <img src={liveYTThumb} alt="" className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full border border-neutral-200/70 bg-black/30 px-3 py-1 text-sm">▶︎ Preview</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-neutral-400 border border-neutral-800 rounded-md px-2 py-1 inline-block">
                    {(() => { try { return new URL(videoInput).hostname; } catch { return 'Link'; } })()} preview
                  </div>
                )}
              </div>
            )}

            {/* Added links list */}
            {videoUrls.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {videoUrls.map((u) => (
                  <span key={u} className="text-xs rounded-full border border-neutral-700 px-2 py-1 text-neutral-300 flex items-center gap-2">
                    {(() => { try { return new URL(u).hostname; } catch { return u; } })()}
                    <button onClick={() => removeVideoUrl(u)} className="text-neutral-500 hover:text-neutral-300">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tag friends */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm text-neutral-300">Tag friends</label>
            <input
              className="rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1 text-sm"
              placeholder="Search friends…"
              value={tagQuery}
              onChange={(e) => setTagQuery(e.target.value)}
            />
          </div>
          <div className="max-h-32 overflow-auto rounded-md border border-neutral-800 p-2 bg-neutral-950">
            {filteredFriends.length === 0 ? (
              <div className="text-xs text-neutral-500">No matches.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredFriends.map((name) => {
                  const active = selectedFriends.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleFriend(name)}
                      className={`text-xs rounded-full px-2 py-1 border ${
                        active
                          ? 'border-cyan-500 bg-cyan-500/15 text-cyan-300'
                          : 'border-neutral-700 text-neutral-300 hover:border-neutral-600'
                      }`}
                    >
                      @{name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:border-neutral-600"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="rounded-md border border-cyan-600 bg-cyan-500/10 px-3 py-1 text-sm hover:bg-cyan-500/20"
          >
            {isEditing ? 'Update post' : 'Publish post'}
          </button>
        </div>
      </div>
    </div>
  );
}




