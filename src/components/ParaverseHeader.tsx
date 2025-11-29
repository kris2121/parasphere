'use client';

import React from 'react';
import {
  Home,
  Ghost,
  Handshake,
  CalendarClock,
  Store,
  User,
  Clapperboard,
  Bell,
  MessageCircle,
} from 'lucide-react';

export type TabKey =
  | 'home'
  | 'locations'
  | 'events'
  | 'marketplace'
  | 'creators'
  | 'collaboration'
  | 'profile';

type CurrentUser = {
  id: string;
  name: string;
  avatarUrl?: string;
};

type Props = {
  tab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  currentUser: CurrentUser;

  // Badge counts
  unreadNotifications?: number;
  unreadMessages?: number;

  // Handlers
  onOpenMessagesHub?: () => void;

  // Click handler for the Paraverse logo (Support / Admin)
  onLogoClick: () => void;

  // Auth handlers
  onLogout?: () => void;
};

export default function ParaverseTopBar({
  tab,
  onSelectTab,
  currentUser,
  unreadNotifications = 0,
  unreadMessages = 0,
  onOpenMessagesHub,
  onLogoClick,
  onLogout,
}: Props) {
  const profileIsActive = tab === 'profile';

  const profileIcon = currentUser.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentUser.avatarUrl}
      alt={currentUser.name}
      className="h-6 w-6 rounded-full object-cover"
    />
  ) : (
    <User
      size={18}
      className={profileIsActive ? 'text-red-300' : 'text-red-400'}
    />
  );

  const hasNotif = unreadNotifications > 0;
  const hasMessages = unreadMessages > 0;

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800/60 bg-[#0B0C0E]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        {/* Paraverse Logo + wordmark (CLICKABLE) */}
        <button
          type="button"
          onClick={onLogoClick}
          title="Support"
          className="flex items-center gap-2 rounded-full border border-transparent px-1 py-1 transition hover:border-cyan-500/70 hover:bg-neutral-900/70"
        >
          <div className="h-10 w-10 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-cyan.png"
              alt="Paraverse Logo"
              className="h-10 w-10 object-contain"
            />
          </div>
          <span className="hidden text-xs font-semibold tracking-[0.18em] text-cyan-300/90 sm:inline">
            PARAVERSE
          </span>
        </button>

        {/* Center nav icons */}
        <nav className="mx-auto flex items-center gap-2">
          {/* Home (cyan) */}
          <button
            type="button"
            title="Home"
            onClick={() => onSelectTab('home')}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              tab === 'home'
                ? 'border-cyan-500/70 bg-cyan-500/10'
                : 'border-transparent hover:border-neutral-700 hover:bg-neutral-900'
            }`}
          >
            <Home
              size={18}
              className={tab === 'home' ? 'text-cyan-300' : 'text-cyan-400'}
            />
          </button>

          {/* Locations (white ghost) */}
          <button
            type="button"
            title="Locations"
            onClick={() => onSelectTab('locations')}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              tab === 'locations'
                ? 'border-white/70 bg-white/10'
                : 'border-transparent hover:border-neutral-700 hover:bg-neutral-900'
            }`}
          >
            <Ghost
              size={18}
              className={
                tab === 'locations' ? 'text-white' : 'text-neutral-200'
              }
            />
          </button>

          {/* Collaboration (green) */}
          <button
            type="button"
            title="Collaborations"
            onClick={() => onSelectTab('collaboration')}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              tab === 'collaboration'
                ? 'border-green-500/70 bg-green-500/10'
                : 'border-transparent hover:border-neutral-700 hover:bg-neutral-900'
            }`}
          >
            <Handshake
              size={18}
              className={
                tab === 'collaboration' ? 'text-green-300' : 'text-green-400'
              }
            />
          </button>

          {/* Events (purple) */}
          <button
            type="button"
            title="Events"
            onClick={() => onSelectTab('events')}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              tab === 'events'
                ? 'border-purple-500/70 bg-purple-500/10'
                : 'border-transparent hover:border-neutral-700 hover:bg-neutral-900'
            }`}
          >
            <CalendarClock
              size={18}
              className={
                tab === 'events' ? 'text-purple-300' : 'text-purple-400'
              }
            />
          </button>

          {/* Marketplace (yellow) */}
          <button
            type="button"
            title="Marketplace"
            onClick={() => onSelectTab('marketplace')}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              tab === 'marketplace'
                ? 'border-amber-400/70 bg-amber-400/10'
                : 'border-transparent hover:border-neutral-700 hover:bg-neutral-900'
            }`}
          >
            <Store
              size={18}
              className={
                tab === 'marketplace' ? 'text-amber-300' : 'text-amber-400'
              }
            />
          </button>

          {/* Creators (orange) */}
          <button
            type="button"
            title="Creators Hub"
            onClick={() => onSelectTab('creators')}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              tab === 'creators'
                ? 'border-orange-400/70 bg-orange-500/10'
                : 'border-transparent hover:border-neutral-700 hover:bg-neutral-900'
            }`}
          >
            <Clapperboard
              size={18}
              className={
                tab === 'creators' ? 'text-orange-300' : 'text-orange-400'
              }
            />
          </button>
        </nav>

        {/* Right side - auth, notifications, messages, profile */}
        <div className="flex items-center gap-2">
          {/* Sign out pill (only if handler provided) */}
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/60 px-3 py-1 text-xs font-semibold text-neutral-200 hover:border-red-500/70 hover:text-red-300"
            >
              Sign out
            </button>
          )}

          {/* Notifications bell – NOW WIRED SAME AS MESSAGES */}
          <button
            type="button"
            title="Notifications"
            onClick={() => onOpenMessagesHub && onOpenMessagesHub()}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-cyan-500/60 hover:text-cyan-200"
          >
            <Bell size={17} />
            {hasNotif && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </span>
            )}
          </button>

          {/* Messages - opens profile hub on Messages filter */}
          <button
            type="button"
            title="Messages"
            onClick={() => onOpenMessagesHub && onOpenMessagesHub()}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-cyan-500/60 hover:text-cyan-200"
          >
            <MessageCircle size={17} />
            {hasMessages && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-cyan-500 px-1 text-[9px] font-semibold text-black">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </button>

          {/* Profile (red / avatar) */}
          <button
            type="button"
            title="Profile"
            onClick={() => onSelectTab('profile')}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              profileIsActive
                ? 'border-red-500/70 bg-red-500/10'
                : 'border-transparent hover:border-neutral-700 hover:bg-neutral-900'
            }`}
          >
            {profileIcon}
          </button>
        </div>
      </div>
    </header>
  );
}
