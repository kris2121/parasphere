'use client';

import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { Ghost, CalendarClock, Handshake } from 'lucide-react';
import { createRoot } from 'react-dom/client';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export type LocationData = {
  id: string;
  title: string;
  type: 'HAUNTING' | 'EVENT' | 'COLLAB';
  lat: number;
  lng: number;
  imageUrl?: string;
  summary?: string;
  address?: string;
  priceInfo?: string;
  website?: string;
  countryCode?: string;
  postalCode?: string;
  verifiedByOwner?: boolean;
};

type Props = {
  locations: LocationData[];
  onOpen?: (loc: LocationData) => void;
  overviewZoom?: number;
  initialCenter?: [number, number];
  heightVh?: { desktop: number; mobile: number };
};

export type LiveMapHandle = {
  // page.tsx calls this when you click a location/event/collab card
  focusOn: (lng: number, lat: number, zoom?: number) => void;
  getCenter: () => [number, number] | null;
};

export default forwardRef<LiveMapHandle, Props>(function LiveMap(
  {
    locations,
    onOpen,
    overviewZoom = 7.8,
    initialCenter = [-2.5, 54.3],
    heightVh = { desktop: 38, mobile: 32 },
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  /* ------------------------------------------------------------------
     Public API: focusOn + getCenter
  ------------------------------------------------------------------ */
  useImperativeHandle(ref, () => ({
    focusOn(lng: number, lat: number, zoom: number = 10) {
      const map = mapRef.current;
      if (!map) return;
      map.flyTo({
        center: [lng, lat],
        zoom,
        essential: true,
      });
    },
    getCenter: () => {
      const map = mapRef.current;
      if (!map) return null;
      const c = map.getCenter();
      return [c.lng, c.lat];
    },
  }));

  /* ------------------------------------------------------------------
     Init map (ONCE – never re-created while this component is mounted)
  ------------------------------------------------------------------ */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: initialCenter,
      zoom: overviewZoom,
      attributionControl: false,
    });

    mapRef.current = map;

    // Zoom / rotate controls bottom-right
    map.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      'bottom-right',
    );

    return () => {
      // Clean up markers + map on unmount
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // ⬇️ empty deps = only run once, not on tab changes
  }, []);

  /* ------------------------------------------------------------------
     Helper: build a Lucide-styled marker element per type
  ------------------------------------------------------------------ */
  function createMarkerElement(type: LocationData['type']): HTMLDivElement {
    const outer = document.createElement('div');
    outer.style.width = '28px';
    outer.style.height = '28px';
    outer.style.borderRadius = '9999px';
    outer.style.display = 'flex';
    outer.style.alignItems = 'center';
    outer.style.justifyContent = 'center';
    outer.style.cursor = 'pointer';
    outer.style.boxShadow =
      '0 0 0 3px rgba(0,0,0,0.7), 0 0 12px rgba(0,0,0,0.9)';

    // background colours matched to the UI:
    // - Haunting: white
    // - Event: purple
    // - Collab: emerald
    if (type === 'HAUNTING') {
      outer.style.background = '#ffffff';
    } else if (type === 'EVENT') {
      outer.style.background = '#a855f7'; // purple-500
    } else {
      outer.style.background = '#22c55e'; // emerald-500
    }

    const iconHolder = document.createElement('div');
    iconHolder.style.display = 'flex';
    iconHolder.style.alignItems = 'center';
    iconHolder.style.justifyContent = 'center';
    iconHolder.style.width = '100%';
    iconHolder.style.height = '100%';
    outer.appendChild(iconHolder);

    const root = createRoot(iconHolder);
    if (type === 'HAUNTING') {
      root.render(
        <Ghost
          size={18}
          strokeWidth={2.4}
          color="#020617"
        />,
      );
    } else if (type === 'EVENT') {
      root.render(
        <CalendarClock
          size={18}
          strokeWidth={2.4}
          color="#0f172a"
        />,
      );
    } else {
      root.render(
        <Handshake
          size={18}
          strokeWidth={2.4}
          color="#022c22"
        />,
      );
    }

    return outer;
  }

  /* ------------------------------------------------------------------
     Render markers whenever locations change (center/zoom unchanged)
  ------------------------------------------------------------------ */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add markers for current locations
    locations.forEach((loc) => {
      const el = createMarkerElement(loc.type);
      el.title = loc.title;

      el.addEventListener('click', () => {
        onOpen?.(loc);
      });

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([loc.lng, loc.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [locations, onOpen]);

  /* ------------------------------------------------------------------
     Render container
  ------------------------------------------------------------------ */
  const mapHeight =
    typeof window !== 'undefined' && window.innerWidth < 768
      ? `${heightVh.mobile}vh`
      : `min(${heightVh.desktop}vh, 700px)`;

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="overflow-hidden rounded-xl border border-neutral-800"
        style={{ width: '100%', height: mapHeight }}
      />
    </div>
  );
});


