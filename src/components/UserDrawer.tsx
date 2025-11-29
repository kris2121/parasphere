'use client';

import { useEffect, useRef, useState } from 'react';

export type SocialLink = {
  id: string;
  label: string; // e.g. 'TikTok'
  url: string;
};

export type UserMini = {
  id: string;
  name: string;
  bio?: string;
  country?: string;
  avatarUrl?: string;
  socialLinks?: SocialLink[];

  // role: user / admin / superadmin
  role?: 'user' | 'admin' | 'superadmin';

  // legacy fields kept so old data doesn’t break anything
  team?: string;
  location?: string;
  website?: string;
};

type Props = {
  open: boolean;
  user?: UserMini;
  stars?: number;
  currentUserId: string;

  // role of the currently logged-in user
  currentUserRole?: 'user' | 'admin' | 'superadmin';

  onGiveStar?: (userId: string) => void;
  onFollow?: (userId: string) => void;
  onMessage?: (userId: string) => void;
  onBlock?: (userId: string) => void;

  // supports reason + notes
  onReport?: (userId: string, reason?: string, notes?: string) => void;

  /** Save callback for edited profile (id preserved) */
  onSave?: (next: UserMini) => void;

  // callback for toggling admin role (handled by parent / Firestore)
  onToggleAdminRole?: (userId: string, nextRole: 'user' | 'admin') => void;

  onClose: () => void;

  /** where to render it; 'center' keeps it inside the map container */
  variant?: 'center' | 'right';

  /** is THIS user already added by the current user? */
  isFollowing?: boolean;
};

const SOCIAL_OPTIONS = [
  'YouTube',
  'TikTok',
  'Instagram',
  'Facebook',
  'X',
  'Reddit',
  'Other',
];

const REPORT_REASONS = [
  'Harassment or abuse',
  'Spam or advertising',
  'Impersonation',
  'Inappropriate / offensive content',
  'Suspicious / scam behaviour',
  'Other',
];

export default function UserDrawer({
  open,
  user,
  stars = 0,
  currentUserId,
  currentUserRole,
  onGiveStar,
  onFollow,
  onMessage,
  onBlock,
  onReport,
  onSave,
  onToggleAdminRole,
  onClose,
  variant = 'center',
  isFollowing = false,
}: Props) {
  const u: UserMini = user ?? { id: currentUserId, name: 'You' };
  const isOwner = u.id === currentUserId;

  // role state for the viewed user (defaults to 'user' if missing)
  const [role, setRole] = useState<'user' | 'admin' | 'superadmin'>(
    (u.role as 'user' | 'admin' | 'superadmin') ?? 'user',
  );

  // editable fields (local state)
  const [name, setName] = useState(u.name ?? '');
  const [bio, setBio] = useState(u.bio ?? '');
  const [country, setCountry] = useState(u.country ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(u.avatarUrl);

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    u.socialLinks ?? [],
  );

  const [newSocialLabel, setNewSocialLabel] =
    useState<string>('TikTok');
  const [newSocialUrl, setNewSocialUrl] = useState<string>('');

  // reporting UI state
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportNotes, setReportNotes] = useState('');

  // countries for autocomplete
  const [countries, setCountries] = useState<
    Array<{ code: string; name: string }>
  >([]);

  useEffect(() => {
    let ok = true;
    fetch('/countries.json')
      .then((r) => r.json())
      .then((list) => {
        if (!ok) return;
        if (Array.isArray(list)) {
          setCountries(list);
        }
      })
      .catch(() => {
        if (!ok) return;
        setCountries([
          { code: 'GB', name: 'United Kingdom' },
          { code: 'US', name: 'United States' },
          { code: 'CA', name: 'Canada' },
          { code: 'AU', name: 'Australia' },
        ]);
      });

    return () => {
      ok = false;
    };
  }, []);

  // hydrate when "user" changes
  useEffect(() => {
    setName(u.name ?? '');
    setBio(u.bio ?? '');
    setCountry(u.country ?? '');
    setAvatarUrl(u.avatarUrl);
    setSocialLinks(u.socialLinks ?? []);

    // sync role from user object
    setRole((u.role as 'user' | 'admin' | 'superadmin') ?? 'user');

    // reset report form when switching user
    setIsReporting(false);
    setReportReason('');
    setReportNotes('');
  }, [u.id, u.name, u.bio, u.country, u.avatarUrl, u.socialLinks, u.role]);

  // esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // avatar upload
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleAvatarClick() {
    if (!isOwner) return;
    fileInputRef.current?.click();
  }

  function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setAvatarUrl(reader.result);
    };
    reader.readAsDataURL(f);
    e.target.value = '';
  }

  function handleAddSocialLink() {
    const urlRaw = newSocialUrl.trim();
    if (!urlRaw) return;

    const url =
      urlRaw.startsWith('http://') || urlRaw.startsWith('https://')
        ? urlRaw
        : `https://${urlRaw}`;

    setSocialLinks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: newSocialLabel,
        url,
      },
    ]);
    setNewSocialUrl('');
  }

  function handleRemoveSocialLink(id: string) {
    setSocialLinks((prev) => prev.filter((l) => l.id !== id));
  }

  function handleSaveProfile() {
    onSave?.({
      ...u,
      name: name.trim() || 'User',
      bio: bio.trim() || undefined,
      country: country.trim() || undefined,
      avatarUrl,
      socialLinks: socialLinks.length ? socialLinks : undefined,
      role, // keep role on the object so parent can persist it if needed
    });
  }

  function resetReportState() {
    setIsReporting(false);
    setReportReason('');
    setReportNotes('');
  }

  function handleSubmitReport() {
    if (!reportReason) return;
    onReport?.(u.id, reportReason, reportNotes.trim() || undefined);
    resetReportState();
  }

  // Only superadmin can see / use the Admin toggle, and never on themselves
  const canToggleAdmin =
    !isOwner && currentUserRole === 'superadmin' && !!onToggleAdminRole;

  function handleAdminToggleClick() {
    if (!canToggleAdmin) return;

    const nextRole: 'user' | 'admin' =
      role === 'admin' ? 'user' : 'admin';
    setRole(nextRole);
    onToggleAdminRole?.(u.id, nextRole);
  }

  if (!open) return null;

  const Panel = (
    <div
      className="w-full max-w-md overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-3">
        {/* avatar */}
        <button
          type="button"
          onClick={handleAvatarClick}
          title={isOwner ? 'Click to change profile photo' : 'Profile photo'}
          className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-neutral-800 bg-neutral-900"
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={u.name || 'avatar'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
              IMG
            </div>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarFile}
          className="hidden"
        />

        <div className="min-w-0">
          <div className="truncate text-xs text-neutral-400">
            {isOwner ? 'Editing Profile' : 'Profile'}
          </div>
          <div className="truncate text-lg font-semibold">
            {u.name || 'User'}
          </div>
          {/* role label removed from header UI */}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Admin role toggle (superadmin only, on other users) */}
          {canToggleAdmin && (
            <button
              type="button"
              onClick={handleAdminToggleClick}
              className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                role === 'admin'
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-100'
                  : 'border-neutral-600 bg-neutral-800 text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              {role === 'admin' ? 'Admin: ON' : 'Admin: OFF'}
            </button>
          )}

          {/* ⭐ Stars still supported if you want them later */}
          {!isOwner && onGiveStar && (
            <button
              className="rounded-md border border-yellow-600/60 bg-yellow-500/10 px-2 py-1 text-xs text-yellow-300 hover:bg-yellow-500/20"
              onClick={() => onGiveStar(u.id)}
            >
              ★ {stars > 0 ? `(${stars})` : ''}
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-700 px-2.5 py-1.5 text-sm hover:bg-neutral-900"
          >
            Close
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[80vh] overflow-y-auto px-4 pb-5 pt-4 text-sm">
        {/* Owner view (editable) */}
        {isOwner ? (
          <div className="grid gap-3">
            {/* Display name */}
            <label className="grid gap-1">
              <span className="text-xs text-neutral-400">
                Display name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none"
                placeholder="Your display name"
              />
            </label>

            {/* Bio */}
            <label className="grid gap-1">
              <span className="text-xs text-neutral-400">Bio</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-[100px] rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none"
                placeholder="A short introduction…"
              />
            </label>

            {/* Social links manager */}
            <div className="grid gap-2">
              <span className="text-xs text-neutral-400">
                Social links
              </span>

              {/* Existing links */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((link) => (
                    <span
                      key={link.id}
                      className="inline-flex items-center gap-1 rounded-full border border-cyan-500/60 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-200"
                    >
                      <span>{link.label}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialLink(link.id)}
                        className="text-[11px] text-neutral-300 hover:text-white"
                        title="Remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Add link row */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={newSocialLabel}
                  onChange={(e) => setNewSocialLabel(e.target.value)}
                  className="rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs"
                >
                  {SOCIAL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <input
                  value={newSocialUrl}
                  onChange={(e) => setNewSocialUrl(e.target.value)}
                  placeholder="Paste profile URL"
                  className="min-w-[180px] flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSocialLink}
                  className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-300 hover:bg-cyan-500/20"
                >
                  Add link
                </button>
              </div>
            </div>

            {/* Country (autocomplete) */}
            <label className="grid gap-1">
              <span className="text-xs text-neutral-400">Country</span>
              <input
                list="profile-countries"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Country"
                className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none"
              />
              <datalist id="profile-countries">
                {countries.map((c) => (
                  <option
                    key={c.code}
                    value={c.name}
                    label={`${c.name} (${c.code})`}
                  />
                ))}
              </datalist>
            </label>

            {/* Profile photo (explicit picker) */}
            <div className="grid gap-1">
              <span className="text-xs text-neutral-400">
                Profile photo
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-white"
              />
              {avatarUrl && (
                <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-950 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl}
                    alt="preview"
                    className="max-h-48 w-auto rounded-md border border-neutral-800"
                  />
                </div>
              )}
              <p className="mt-1 text-xs text-neutral-500">
                You can also click the avatar at the top to change your
                photo.
              </p>
            </div>

            {/* Owner buttons */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 pt-3">
              <button
                type="button"
                onClick={() =>
                  window.confirm(
                    'Account deletion will be added in a later version.',
                  ) && undefined
                }
                className="rounded-md border border-red-500/70 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20"
              >
                Delete account
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs hover:bg-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-300 hover:bg-cyan-500/20"
                >
                  Save profile
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Viewer view (read-only) */
          <div className="grid gap-3 text-sm">
            <div>
              <div className="text-xs text-neutral-500">
                Display name
              </div>
              <div className="mt-0.5 text-base font-semibold">
                {u.name || 'User'}
              </div>
              {/* role label removed from viewer UI */}
            </div>

            {u.bio && (
              <div>
                <div className="text-xs text-neutral-500">Bio</div>
                <p className="mt-0.5 whitespace-pre-line text-sm text-neutral-200">
                  {u.bio}
                </p>
              </div>
            )}

            {u.country && (
              <div>
                <div className="text-xs text-neutral-500">Country</div>
                <div className="mt-0.5 text-sm text-neutral-200">
                  {u.country}
                </div>
              </div>
            )}

            {u.socialLinks && u.socialLinks.length > 0 && (
              <div>
                <div className="text-xs text-neutral-500">Links</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {u.socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-full border border-cyan-500/60 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-200 hover:bg-cyan-500/20"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* REPORT PANEL */}
            {isReporting && (
              <div className="mt-2 w-full rounded-md border border-red-500/40 bg-red-500/5 p-3 text-xs text-neutral-200">
                <div className="mb-2 font-semibold text-red-200">
                  Report this user
                </div>

                <label className="mb-2 block">
                  <span className="text-[11px] text-neutral-400">
                    Reason
                  </span>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="mt-0.5 w-full rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-xs outline-none"
                  >
                    <option value="">Select a reason…</option>
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="mb-2 block">
                  <span className="text-[11px] text-neutral-400">
                    Additional details (optional)
                  </span>
                  <textarea
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    rows={3}
                    className="mt-0.5 w-full rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-xs outline-none"
                    placeholder="Describe what happened…"
                  />
                </label>

                <div className="mt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={resetReportState}
                    className="rounded-md border border-neutral-700 px-3 py-1.5 text-[11px] hover:bg-neutral-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!reportReason}
                    onClick={handleSubmitReport}
                    className={`rounded-md border px-3 py-1.5 text-[11px] ${
                      reportReason
                        ? 'border-red-500 bg-red-500/20 text-red-100 hover:bg-red-500/30'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    Submit report
                  </button>
                </div>
              </div>
            )}

            {/* Viewer buttons: Add / Message / Block / Report */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 pt-3">
              <div className="flex gap-2">
                {/* ADD / ADDED BUTTON */}
                <button
                  type="button"
                  onClick={() => onFollow?.(u.id)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                    isFollowing
                      ? 'border border-cyan-300 bg-cyan-500/20 text-cyan-50'
                      : 'border border-cyan-500 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
                  }`}
                >
                  {isFollowing ? 'Added' : 'Add'}
                </button>

                <button
                  type="button"
                  onClick={() => onMessage?.(u.id)}
                  className="rounded-md border border-neutral-500 bg-neutral-800 px-3 py-1.5 text-xs hover:bg-neutral-900"
                >
                  Message
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsReporting((prev) => !prev);
                  }}
                  className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs hover:bg-neutral-900"
                >
                  {isReporting ? 'Close report' : 'Report'}
                </button>
                <button
                  type="button"
                  onClick={() => onBlock?.(u.id)}
                  className="rounded-md border border-red-500/70 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20"
                >
                  Block
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // centered variant (bounded by parent map container)
  if (variant === 'center') {
    return (
      <>
        <div
          className="absolute inset-0 z-[95] bg-black/60"
          onClick={onClose}
        />
        <div className="absolute inset-0 z-[96] flex items-start justify-center p-3 md:p-6">
          {Panel}
        </div>
      </>
    );
  }

  // fallback: slide-in right
  return (
    <>
      <div
        className="fixed inset-0 z-[95] bg-black/60"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-[96] flex items-start justify-end p-3 md:p-4">
        {Panel}
      </div>
    </>
  );
}

