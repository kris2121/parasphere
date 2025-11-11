import StickyNav from "@/components/StickyNav";
import LiveMap from "@/components/LiveMap";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0C0E] text-white">
      <StickyNav />
      <LiveMap />

      <section className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="text-2xl font-semibold mb-2">Favourites & Friends — newest first</h1>
        <p className="text-neutral-400">This feed will switch to UFO / Cryptids / Hauntings when you tap the buttons.</p>
      </section>
    </main>
  );
}
