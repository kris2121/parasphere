'use client';

import React from 'react';
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
  | 'events'
  | 'marketplace'
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
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  currentUser: CurrentUser;
};

export default function ParaverseTopBar({
  tab,
  onSelectTab,
  searchQuery,
  setSearchQuery,
  currentUser,
}: Props) {
  const profileIsActive = tab === 'profile';

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
        {/* Paraverse Logo */}
        <div className="h-10 w-10 shrink-0">
          <img
            src="/logo-cyan.png"
            alt="Paraverse Logo"
            className="h-10 w-10 object-contain"
          />
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search posts or locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64 rounded-md bg-neutral-900 p-2 text-sm text-neutral-300 outline-none"
        />

        {/* Icon-only navigation */}
        <div className="ml-auto flex gap-2">
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
              className={tab === 'locations' ? 'text-white' : 'text-neutral-200'}
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



