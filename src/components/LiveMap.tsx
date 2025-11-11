'use client';

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function LiveMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Start in UK, dark style
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-2, 54],
      zoom: 4,
      attributionControl: false,
    });
    mapRef.current = map;

    // Add basic controls
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");

    // Try to center on user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { longitude, latitude } = pos.coords;
          map.flyTo({ center: [longitude, latitude], zoom: 10 });
          new mapboxgl.Marker({ color: "#00FFF6" })
            .setLngLat([longitude, latitude])
            .addTo(map);
        },
        () => {
          /* ignore if blocked */
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sticky wrapper + map canvas
  return (
    <div className="sticky top-[42px] z-40">
      <div className="h-[42vh] w-full border-b border-neutral-800">
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
