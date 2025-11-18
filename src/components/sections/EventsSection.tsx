'use client';

import React from 'react';
import EventsFeed, { EventsFeedEvent } from '@/components/feed/EventsFeed';
import { CountrySelect, SectionDisclaimer } from '@/components/ParaverseScope';

type EventsSectionProps = {
  country: string;
  events: EventsFeedEvent[];
  currentUserId: string;

  setEventFormOpen: (open: boolean) => void;
  onMessageUser: (userId: string) => void;
  onOpenLocation: (locId: string) => void;
  onUpdateEvent: (id: string, patch: Partial<EventsFeedEvent>) => void;
  onDeleteEvent: (id: string) => void;
  onOpenImage: (src: string) => void;

  // NEW: open the poster’s profile
  onOpenUser: (userId: string) => void;
};

export default function EventsSection({
  country,
  events,
  currentUserId,
  setEventFormOpen,
  onMessageUser,
  onOpenLocation,
  onUpdateEvent,
  onDeleteEvent,
  onOpenImage,
  onOpenUser,
}: EventsSectionProps) {
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold text-purple-300">
        Events
      </h1>

      <SectionDisclaimer>
        Events are community-posted. Always confirm details, pricing and access
        directly with the host before travelling.
      </SectionDisclaimer>

      <div className="mb-4">
        <CountrySelect />
      </div>

      <div className="mb-4">
        <button
          onClick={() => setEventFormOpen(true)}
          className="rounded-md border border-purple-400 bg-purple-500/10 px-3 py-1.5 text-sm text-purple-200"
        >
          + Add Event
        </button>
      </div>

      <EventsFeed
        country={country}
        events={events}
        currentUserId={currentUserId}
        onMessageUser={onMessageUser}
        onOpenLocation={onOpenLocation}
        onEditEvent={(id) => {
          // hook for real edit wiring later
          onUpdateEvent(id, {});
          setEventFormOpen(true);
        }}
        onDeleteEvent={onDeleteEvent}
        onOpenImage={onOpenImage}
        onOpenUser={onOpenUser}
      />
    </>
  );
}


