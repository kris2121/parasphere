'use client';

import { useState } from "react";
import StickyNav from "@/components/StickyNav";
import FilterBar from "@/components/FilterBar";
import LiveMap from "@/components/LiveMap";
import CenterButton from "@/components/CenterButton";

export default function Home() {
  const [tab, setTab] = useState<string>("home");
  const [centerSignal, setCenterSignal] = useState(0);

  return (
    <main className="min-h-screen bg-[#0B0C0E] text-white">
      <StickyNav />
      <FilterBar current={tab} onSelect={setTab} />
      <LiveMap centerSignal={centerSignal} />

      {/* Center on Me button */}
      <CenterButton onClick={() => setCenterSignal((n) => n + 1)} />

      <section className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-2">
          {tab === "home" ? "Favourites & Friends — newest first" : tabLabel(tab)}
        </h1>

        <div className="grid gap-4">
          {demoItems(tab).map((item, i) => (
            <article key={i} className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
              <div className="text-cyan-300 text-sm">{item.type}</div>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-neutral-300 text-sm">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function tabLabel(t: string) {
  const labels: Record<string,string> = {
    hauntings: "Hauntings — newest first",
    ufos: "UFOs — newest first",
    cryptids: "Cryptids — newest first",
    events: "Events near you",
    marketplace: "Marketplace — latest posts",
    collaboration: "Collaboration — teams & shared projects",
    search: "Search results",
    profile: "Your profile",
  };
  return labels[t] ?? "Feed";
}

function demoItems(tab: string) {
  switch (tab) {
    case "hauntings":
      return [
        { type: "Location • Haunting", title: "Pendle Hill", desc: "Cold spots and whispers reported." },
        { type: "Review • Haunting", title: "Skirrid Inn", desc: "Shadow figure near the stairs." },
      ];
    case "ufos":
      return [
        { type: "Report • UFO", title: "Lancashire sky lights", desc: "Three orbs moving in triangle formation." },
        { type: "Sighting • UFO", title: "Snowdonia ridge", desc: "Fast zigzag motion, no sound." },
      ];
    case "cryptids":
      return [
        { type: "Sighting • Cryptid", title: "Beast of Bodmin", desc: "Large cat tracks by stream." },
        { type: "Report • Cryptid", title: "Loch Morar", desc: "Long dark shape seen at dusk." },
      ];
    case "events":
      return [
        { type: "Event", title: "Mill Street Barracks Lock-in", desc: "Sat 8pm — booking link inside." },
        { type: "Event", title: "Pendle Night Walk", desc: "Fri 10pm — bring EMF/torches." },
      ];
    case "marketplace":
      return [
        { type: "For Sale", title: "Spirit Box SB7", desc: "Good condition — eBay link." },
        { type: "Wanted", title: "Thermal camera", desc: "Looking for FLIR One." },
      ];
    case "collaboration":
      return [
        { type: "Team • Collaboration", title: "ParaKey x GhostHub", desc: "Joint live-stream planned for next month." },
        { type: "Request • Collaboration", title: "Seeking EMF specialists", desc: "Looking for collaborators in Yorkshire." },
      ];
    default:
      return [
        { type: "Friend • Post", title: "Scott added a photo", desc: "EMF spike NE corner." },
        { type: "Location • Haunting", title: "Coalhouse Fort", desc: "Footsteps in the tunnel." },
      ];
  }
}
