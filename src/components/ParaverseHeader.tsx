'use client';

import React, { useState } from 'react';
import {
  Home,
  Ghost,
  Handshake,
  CalendarClock,
  Store,
  User,
} from 'lucide-react';

export type TabKey =
  | 'home'
  | 'locations'
  | 'collaboration'
  | 'events'
  | 'marketplace'
  | 'profile';

type CurrentUser = {
  id: string;
  name: string;
  avatarUrl?: string;
};

type Props = {
  tab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  currentUser: CurrentUser;

  // NEW: optional unread counts
  unreadNotifications?: number;
  unreadMessages?: number;

  // NEW: let header open the Messages hub directly
  onOpenMessagesHub?: () => void;
};

export default function ParaverseHeader({
  tab,
  onSelectTab,
  searchQuery,
  setSearchQuery,
  currentUser,
  unreadNotifications = 0,
  unreadMessages = 0,
  onOpenMessagesHub,
}: Props) {
  const [showPopover, setShowPopover] = useState(false);

  const profileIsActive = tab === 'profile';
  const totalUnread = Math.max(
    0,
    (unreadNotifications || 0) + (unreadMessages || 0),
  );

  const handleClickProfile = () => {
    onSelectTab('profile');
    setShowPopover((prev) => !prev);
  };

  const profileIcon = currentUser.avatarUrl ? (
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

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800/60 bg-[#0B0C0E]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        {/* Logo */}
        <div className="h-10 w-10 shrink-0">
          <img
            src="/logo-cyan.png"
            alt="Paraverse Logo"
            className="h-10 w-10 object-contain"
          />
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search posts or locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64 rounded-md bg-neutral-900 p-2 text-sm text-neutral-300 outline-none"
        />

        <div className="ml-auto flex gap-2">
          {/* Home (cyan) */}
          <button
            type="button"
            title="Home"
            onClick={() => {
              setShowPopover(false);
              onSelectTab('home');
            }}
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
            onClick={() => {
              setShowPopover(false);
              onSelectTab('locations');
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
              tab === 'locations'
                ? 'border-white/80 bg-white/10'
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
            onClick={() => {
              setShowPopover(false);
              onSelectTab('collaboration');
            }}
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
            onClick={() => {
              setShowPopover(false);
              onSelectTab('events');
            }}
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
            onClick={() => {
              setShowPopover(false);
              onSelectTab('marketplace');
            }}
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

          {/* Profile (red) + badge + popover */}
          <div className="relative">
            <button
              type="button"
              title="Profile"
              onClick={handleClickProfile}
              className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                profileIsActive
                  ? 'border-red-500/70 bg-red-500/10'
                  : 'border-transparent hover:border-neutral-700 hover:bg-neutral-900'
              }`}
            >
              <div className="relative flex h-6 w-6 items-center justify-center">
                {profileIcon}

                {totalUnread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white shadow-md">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
                )}
              </div>
            </button>

            {/* Activity popover */}
            {showPopover && totalUnread > 0 && (
              <div className="absolute right-0 z-50 mt-2 w-64 rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs shadow-xl">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
                  Activity
                </div>

                <div className="space-y-1.5 text-[11px] text-neutral-200">
                  <div className="flex items-center justify-between">
                    <span>Notifications</span>
                    <span className="font-semibold text-cyan-300">
                      {unreadNotifications}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Messages</span>
                    <span className="font-semibold text-cyan-300">
                      {unreadMessages}
                    </span>
                  </div>
                </div>

                {/* RED pill → opens Messages tab in profile hub */}
                <button
                  type="button"
                  onClick={() => {
                    setShowPopover(false);
                    if (onOpenMessagesHub) {
                      onOpenMessagesHub();
                    } else {
                      onSelectTab('profile');
                    }
                  }}
                  className="mt-3 w-full rounded-md border border-red-500 bg-red-500/10 px-2 py-1.5 text-[11px] font-medium text-red-200 hover:bg-red-500/20"
                >
                  Messages
                </button>

                <p className="mt-2 text-[10px] text-neutral-500">
                  Full details are shown in your Paraverse Profile hub.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

