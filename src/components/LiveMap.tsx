'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export type SocialLinks = Partial<{
  facebook: string;
  instagram: string;
  tiktok: string;
  x: string;
  youtube: string;
}>;

export type Uploader = { id: string; name: string };

export type LocationData = {
  id: string;
  title: string;
  type: 'HAUNTING' | 'UFO' | 'CRYPTID' | 'EVENT';
  lat: number;
  lng: number;

  // Display & details
  imageUrl?: string;
  summary?: string;

  // Trip-advisor style fields
  address?: string;
  what3words?: string;
  openingHours?: string;
  priceInfo?: string;
  phone?: string;
  email?: string;
  website?: string;
  socials?: SocialLinks;

  // Event-specific (optional; used when type === 'EVENT')
  eventStartISO?: string; // e.g., "2025-12-05T20:00:00Z"
  eventEndISO?: string;   // optional

  uploader?: Uploader;

  // Social (optional) — for events we allow stars/comments too
  stars?: number;
  myStarred?: boolean;
  comments?: { id: string; authorId: string; authorName: string; text: string }[];
};

type Props = {
  locations: LocationData[];
  onOpen?: (loc: LocationData) => void;
  centerSignal?: number;
};

export type LiveMapHandle = {
  focusOn: (lon: number, lat: number, zoom?: number) => void;
};

const LiveMap = forwardRef<LiveMapHandle, Props>(function LiveMap(
  { locations, onOpen, centerSignal = 0 }, ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const geoRef = useRef<mapboxgl.GeolocateControl | null>(null);

  useImperativeHandle(ref, () => ({
    focusOn(lon: number, lat: number, zoom = 9) {
      const map = mapRef.current; if (!map) return;
      map.flyTo({ center: [lon, lat], zoom: Math.max(map.getZoom(), zoom), essential: true });
    },
  }));

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-2.5, 54.3],
      zoom: 5,
      attributionControl: false,
    });
    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'bottom-right');

    const geo = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
      showUserHeading: false,
      showAccuracyCircle: false,
    });
    geoRef.current = geo;
    map.addControl(geo, 'bottom-right');

    map.on('load', () => {
      geo.on('geolocate', (e: GeolocationPosition) => {
        const { latitude, longitude } = e.coords;
        putOrMoveUserMarker(longitude, latitude);
      });
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
      geoRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    locations.forEach((loc) => {
      const el = document.createElement('div');
      el.style.width = '18px';
      el.style.height = '18px';
      el.style.borderRadius = '9999px';
      el.style.background =
        loc.type === 'HAUNTING' ? '#ffffff' :
        loc.type === 'UFO'      ? '#9ee37d' :
        loc.type === 'CRYPTID'  ? '#f2a65a' :
        /* EVENT */               '#b084f9'; // purple
      el.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.6), 0 0 12px rgba(255,255,255,0.35)';
      el.style.cursor = 'pointer';

      el.addEventListener('click', () => {
        onOpen?.(loc);
        map.flyTo({ center: [loc.lng, loc.lat], zoom: Math.max(map.getZoom(), 9), essential: true });
      });

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([loc.lng, loc.lat]).addTo(map);
      markersRef.current.push(marker);
    });
  }, [locations, onOpen]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || centerSignal === 0) return;
    try { geoRef.current?.trigger(); return; } catch {}
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        putOrMoveUserMarker(longitude, latitude);
        map.flyTo({ center: [longitude, latitude], zoom: Math.max(map.getZoom(), 12), essential: true });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 15000 }
    );
  }, [centerSignal]);

  function putOrMoveUserMarker(lon: number, lat: number) {
    const map = mapRef.current; if (!map) return;
    const el = document.createElement('div');
    el.style.width = '14px';
    el.style.height = '14px';
    el.style.borderRadius = '9999px';
    el.style.background = '#00fff6';
    el.style.boxShadow = '0 0 0 3px rgba(0,255,246,0.3), 0 0 18px rgba(0,255,246,0.7)';
    el.style.border = '2px solid rgba(0,0,0,0.8)';
    el.title = 'You are here';

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([lon, lat]).setElement(el);
    } else {
      userMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([lon, lat]).addTo(map);
    }
  }

  return (
    <div className="relative">
      <div
        ref={containerRef}
        style={{ width: '100%', height: '60vh' }}
        className="rounded-xl overflow-hidden border border-neutral-800"
      />
      <div className="pointer-events-none absolute left-3 top-3 z-10">
        <div className="flex flex-wrap gap-3 rounded-lg border border-neutral-800 bg-neutral-950/80 backdrop-blur px-3 py-2 text-xs text-neutral-200">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#ffffff' }} />
            Hauntings
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#9ee37d' }} />
            UFOs
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#f2a65a' }} />
            Cryptids
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#b084f9' }} />
            Events
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#00fff6' }} />
            You
          </span>
        </div>
      </div>
    </div>
  );
});

export default LiveMap;









