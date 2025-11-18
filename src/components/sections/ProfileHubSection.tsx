'use client';

import React from 'react';
import {
  MessageSquareText,
  Handshake,
  CalendarClock,
  Store,
  User as UserIcon,
  Mail,
} from 'lucide-react';

import { SectionDisclaimer } from '@/components/ParaverseScope';
import type {
  DemoPost,
  MarketplaceItem,
  EventItem,
  CollabItem,
  NotificationItem,
  DMThread,
} from '@/types/paraverse';
import type { UserMini } from '@/components/UserDrawer';

type ProfileFilter = 'posts' | 'events' | 'marketplace' | 'collabs' | 'messages';

type Props = {
  selectedUserId: string;
  currentUser: { id: string; name: string; avatarUrl?: string };
  usersById: Record<string, UserMini>;

  profileFilter: ProfileFilter;
  setProfileFilter: (v: ProfileFilter) => void;

  postsForSelectedUser: DemoPost[];
  userEventsForSelected: EventItem[];
  userMarketForSelected: MarketplaceItem[];
  userCollabsForSelected: CollabItem[];

  sortedNotifications: NotificationItem[];
  sortedDmThreads: DMThread[];

  formatShortDate: (isoOrMs: string | number) => string;
  handleNotificationClick: (n: NotificationItem) => void;
  openDM: (userId: string) => void;
  openEditProfile: () => void;
};

export default function ProfileHubSection({
  selectedUserId,
  currentUser,
  usersById,
  profileFilter,
  setProfileFilter,
  postsForSelectedUser,
  userEventsForSelected,
  userMarketForSelected,
  userCollabsForSelected,
  sortedNotifications,
  sortedDmThreads,
  formatShortDate,
  handleNotificationClick,
  openDM,
  openEditProfile,
}: Props) {
  const user = usersById[selectedUserId] ?? {
    id: selectedUserId,
    name: 'User',
  };

  const isSelf = selectedUserId === currentUser.id;

  return (
    <>
      {/* Title */}
      <h1 className="text-2xl font-semibold text-red-300">
        {isSelf ? 'Paraverse Profile' : `${user.name} — profile & posts`}
      </h1>

      {/* Red info / rules bar */}
      <div className="mt-3">
        <SectionDisclaimer>
          {isSelf
            ? 'Central hub to manage your profile info, posts, listings, reviews, notifications and messages.'
            : 'You are viewing a user’s public profile and activity. Interact respectfully and report any abusive behaviour.'}
        </SectionDisclaimer>
      </div>

      {/* Icon nav bar: posts / collabs / events / marketplace / profile / messages */}
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        {/* POSTS – cyan / blue */}
        <button
          type="button"
          onClick={() => setProfileFilter('posts')}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${
            profileFilter === 'posts'
              ? 'border-cyan-500 bg-cyan-500/20 text-cyan-50 shadow-md'
              : 'border-cyan-500 bg-cyan-500/5 text-cyan-300'
          }`}
        >
          <MessageSquareText size={14} className="shrink-0" />
          <span>Posts</span>
        </button>

        {/* COLLABS – green */}
        <button
          type="button"
          onClick={() => setProfileFilter('collabs')}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${
            profileFilter === 'collabs'
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-50 shadow-md'
              : 'border-emerald-500 bg-emerald-500/5 text-emerald-300'
          }`}
        >
          <Handshake size={14} className="shrink-0" />
          <span>Collaborations</span>
        </button>

        {/* EVENTS – purple */}
        <button
          type="button"
          onClick={() => setProfileFilter('events')}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${
            profileFilter === 'events'
              ? 'border-purple-500 bg-purple-500/20 text-purple-50 shadow-md'
              : 'border-purple-500 bg-purple-500/5 text-purple-300'
          }`}
        >
          <CalendarClock size={14} className="shrink-0" />
          <span>Events</span>
        </button>

        {/* MARKETPLACE – yellow */}
        <button
          type="button"
          onClick={() => setProfileFilter('marketplace')}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${
            profileFilter === 'marketplace'
              ? 'border-yellow-500 bg-yellow-500/20 text-yellow-50 shadow-md'
              : 'border-yellow-500 bg-yellow-500/5 text-yellow-300'
          }`}
        >
          <Store size={14} className="shrink-0" />
          <span>Marketplace</span>
        </button>

        {/* PROFILE – red, only for your own hub */}
        {isSelf && (
          <button
            type="button"
            onClick={openEditProfile}
            className="inline-flex items-center gap-1 rounded-full border border-red-500 bg-red-500/15 px-3 py-1 text-red-200 hover:bg-red-500/25"
          >
            <UserIcon size={14} className="shrink-0" />
            <span>Profile</span>
          </button>
        )}

        {/* MESSAGES – white: for you = messages view, for others = DM */}
        <button
          type="button"
          onClick={() => {
            if (isSelf) {
              setProfileFilter('messages');
            } else {
              openDM(selectedUserId);
            }
          }}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${
            isSelf && profileFilter === 'messages'
              ? 'border-neutral-200 bg-neutral-200/20 text-neutral-50 shadow-md'
              : 'border-neutral-400 bg-neutral-400/5 text-neutral-200'
          }`}
        >
          <Mail size={14} className="shrink-0" />
          <span>Messages</span>
        </button>
      </div>

      {/* Extra actions for OTHER users only (Block / Report) */}
      {!isSelf && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() =>
              alert(`Block user: ${user.name} (coming soon)`)
            }
            className="rounded-full border border-neutral-600 bg-neutral-900 px-3 py-1.5 font-medium text-neutral-200 hover:bg-neutral-800"
          >
            Block
          </button>
          <button
            type="button"
            onClick={() =>
              alert(`Report user: ${user.name} (coming soon)`)
            }
            className="rounded-full border border-red-500/70 bg-red-500/10 px-3 py-1.5 font-medium text-red-200 hover:bg-red-500/20"
          >
            Report
          </button>
        </div>
      )}

      {/* CONTENT AREA FOR PROFILE HUB */}
      <div className="mt-6 space-y-6">
        {/* POSTS VIEW */}
        {profileFilter === 'posts' && (
          <div>
            <h2 className="mb-2 text-sm font-semibold text-cyan-200">
              {isSelf ? 'Your recent posts' : `${user.name}'s posts`}
            </h2>
            {postsForSelectedUser.length === 0 ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
                {isSelf
                  ? 'You have not posted anything yet.'
                  : 'This user has not posted anything yet.'}
              </div>
            ) : (
              <div className="space-y-3">
                {postsForSelectedUser.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-white">
                        {p.title}
                      </h3>
                      <span className="text-[11px] text-neutral-500">
                        {formatShortDate(p.createdAt)}
                      </span>
                    </div>
                    {p.desc && (
                      <p className="mt-1 text-xs text-neutral-300 line-clamp-3">
                        {p.desc}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EVENTS VIEW */}
        {profileFilter === 'events' && (
          <div>
            <h2 className="mb-2 text-sm font-semibold text-purple-200">
              {isSelf
                ? 'Events you have posted'
                : `${user.name}'s events`}
            </h2>
            {userEventsForSelected.length === 0 ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
                No events found for this user.
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                {userEventsForSelected.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-lg border border-neutral-800 bg-neutral-900 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-white">
                        {ev.title}
                      </h3>
                      <span className="text-[11px] text-neutral-500">
                        {ev.startISO
                          ? formatShortDate(ev.startISO)
                          : ''}
                      </span>
                    </div>
                    {ev.locationText && (
                      <p className="mt-1 text-xs text-neutral-300">
                        {ev.locationText}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MARKETPLACE VIEW */}
        {profileFilter === 'marketplace' && (
          <div>
            <h2 className="mb-2 text-sm font-semibold text-yellow-200">
              {isSelf
                ? 'Your marketplace listings'
                : `${user.name}'s listings`}
            </h2>
            {userMarketForSelected.length === 0 ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
                No marketplace listings for this user.
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                {userMarketForSelected.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-neutral-800 bg-neutral-900 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-white">
                        {item.title}
                      </h3>
                      <span className="text-[11px] text-neutral-500">
                        {item.kind}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-300 line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* COLLABS VIEW */}
        {profileFilter === 'collabs' && (
          <div>
            <h2 className="mb-2 text-sm font-semibold text-emerald-200">
              {isSelf
                ? 'Your collaboration posts'
                : `${user.name}'s collaboration posts`}
            </h2>
            {userCollabsForSelected.length === 0 ? (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
                No collaboration posts for this user.
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                {userCollabsForSelected.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-lg border border-neutral-800 bg-neutral-900 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-white">
                        {c.title}
                      </h3>
                      {c.dateISO && (
                        <span className="text-[11px] text-neutral-500">
                          {formatShortDate(c.dateISO)}
                        </span>
                      )}
                    </div>
                    {c.locationText && (
                      <p className="mt-1 text-xs text-neutral-300">
                        {c.locationText}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MESSAGES VIEW – ONLY FOR SELF */}
        {profileFilter === 'messages' && isSelf && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Notifications */}
            <div>
              <h2 className="mb-2 text-sm font-semibold text-neutral-100">
                Notifications
              </h2>
              {sortedNotifications.length === 0 ? (
                <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
                  No notifications yet.
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  {sortedNotifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleNotificationClick(n)}
                      className={`flex w-full flex-col items-start rounded-lg border p-3 text-left transition ${
                        n.read
                          ? 'border-neutral-800 bg-neutral-900 hover:border-neutral-600 hover:bg-neutral-900/80'
                          : 'border-red-500/70 bg-red-500/10 hover:border-red-400 hover:bg-red-500/20'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <div className="text-xs font-semibold text-red-100">
                          {n.actor.name}
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          {formatShortDate(n.createdAt)}
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-neutral-200">
                        {n.text}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Messages */}
            <div>
              <h2 className="mb-2 text-sm font-semibold text-neutral-100">
                Direct messages
              </h2>
              {sortedDmThreads.length === 0 ? (
                <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
                  No messages yet.
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  {sortedDmThreads.map((t) => {
                    const last = t.messages[t.messages.length - 1];
                    const hasUnread = t.messages.some(
                      (m) =>
                        !m.read && m.toUserId === currentUser.id,
                    );
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => openDM(t.otherUser.id)}
                        className={`flex w-full flex-col items-start rounded-lg border p-3 text-left hover:border-cyan-500/60 hover:bg-neutral-900 ${
                          hasUnread
                            ? 'border-cyan-600/70 bg-cyan-500/5'
                            : 'border-neutral-800 bg-neutral-900'
                        }`}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-white">
                            {t.otherUser.name}
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            {formatShortDate(t.lastMessageAt)}
                          </span>
                        </div>
                        {last && (
                          <p className="mt-1 line-clamp-2 text-xs text-neutral-300">
                            {last.text}
                          </p>
                        )}
                        {hasUnread && (
                          <span className="mt-1 inline-flex items-center rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-200">
                            New
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
