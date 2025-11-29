'use client';

import React from 'react';
import type { EventItem } from '@/types/paraverse';
import EventsFeed from '@/components/feed/EventsFeed';
import {
  CountrySelect,
  SectionDisclaimer,
} from '@/components/ParaverseScope';

type Props = {
  country: string | null;
  events: EventItem[];
  currentUserId: string;

  // NEW: admin flag so admin can edit/delete any event
  isAdmin: boolean;

  onAddEvent: () => void;
  onEditEvent: (id: string) => void;
  onMessageUser: (userId: string) => void;
  onOpenLocation: (locationId: string) => void;
  onUpdateEvent: (id: string, patch: Partial<EventItem>) => void; // not used here but kept
  onDeleteEvent: (id: string) => void;
  onOpenImage: (src: string) => void;
  onOpenUser: (id: string) => void;
};

export default function EventsSection({
  country,
  events,
  currentUserId,
  isAdmin,
  onAddEvent,
  onEditEvent,
  onMessageUser,
  onOpenLocation,
  onUpdateEvent,
  onDeleteEvent,
  onOpenImage,
  onOpenUser,
}: Props) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-purple-300">
        Events
      </h1>

      {/* Behaviour / rules disclaimer */}
      <div className="mt-3">
        <SectionDisclaimer>
          Events are community-submitted. Always confirm details with
          the organiser directly and investigate safely.
        </SectionDisclaimer>
      </div>

      {/* Country scope pill */}
      <div className="mb-3 mt-2">
        <CountrySelect />
      </div>

      {/* Add Event button */}
      <div className="mt-1">
        <button
          onClick={onAddEvent}
          className="rounded-md border border-purple-500 bg-purple-500/10 px-3 py-1.5 text-sm font-medium text-purple-300 hover:bg-purple-500/20"
        >
          + Add event
        </button>
      </div>

      {/* Feed list */}
      <EventsFeed
        events={events}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        onEditEvent={onEditEvent}
        onDeleteEvent={onDeleteEvent}
        onOpenLocation={onOpenLocation}
        onOpenImage={onOpenImage}
        onOpenUser={onOpenUser}
        onMessageUser={onMessageUser}
      />
    </div>
  );
}





