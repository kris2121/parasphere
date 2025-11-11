'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export type LocationData = {
  id: string;
  title: string;
  type: "HAUNTING" | "UFO" | "CRYPTID" | "EVENT";
  lat: number;
  lng: number;
  imageUrl?: string;
  summary?: string;
  address?: string;
  priceInfo?: string;
  website?: string;

  // NEW: for EVENT pins (optional)
  startISO?: string;
  endISO?: string;
};

type Props = {
  locations: LocationData[];
  onOpen?: (loc: LocationData) => void;
  overviewZoom?: number;
  initialCenter?: [number, number];
  heightVh?: { desktop: number; mobile: number };
};

export type LiveMapHandle = {
  /** keep map still by design */
  focusOn: (_lng: number, _lat: number, _zoom?: number) => void;
  /** current map center (lng, lat) */
  getCenter: () => [number, number] | null;
};

export default forwardRef<LiveMapHandle, Props>(function LiveMap(
  { locations, onOpen, overviewZoom = 5.8, initialCenter = [-2.5, 54.3], heightVh = { desktop: 48, mobile: 40 } },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const geoRef = useRef<mapboxgl.GeolocateControl | null>(null);

  useImperativeHandle(ref, () => ({
    focusOn() {/* no-op */},
    getCenter: () => {
      const m = mapRef.current;
      if (!m) return null;
      const c = m.getCenter();
      return [c.lng, c.lat];
    },
  }));

  function putOrMoveUserMarker(lon: number, lat: number) {
    const map = mapRef.current;
    if (!map) return;
    const el = document.createElement('div');
    el.style.width = '14px';
    el.style.height = '14px';
    el.style.borderRadius = '9999px';
    el.style.background = '#00fff6';
    el.style.boxShadow = '0 0 0 3px rgba(0,255,246,0.3), 0 0 18px rgba(0,255,246,0.7)';
    el.style.border = '2px solid rgba(0,0,0,0.8)';
    el.title = 'You are here';
    if (userMarkerRef.current) userMarkerRef.current.setLngLat([lon, lat]).setElement(el);
    else userMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' }).setLngLat([lon, lat]).addTo(map);
  }

  // init map
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
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => putOrMoveUserMarker(pos.coords.longitude, pos.coords.latitude),
          () => {},
          { enableHighAccuracy: true, timeout: 7000, maximumAge: 15000 }
        );
      }
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
  }, [initialCenter, overviewZoom]);

  // render markers (never move camera)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    locations.forEach((loc) => {
      const el = document.createElement('div');
      el.style.width = '18px';
      el.style.height = '18px';
      el.style.borderRadius = '9999px';
      el.style.background =
        loc.type === 'HAUNTING' ? '#ffffff'
        : loc.type === 'UFO' ? '#9ee37d'
        : loc.type === 'EVENT' ? '#b18cff'
        : '#f2a65a';
      el.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.6), 0 0 12px rgba(255,255,255,0.35)';
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => onOpen?.(loc));
      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([loc.lng, loc.lat])
        .addTo(map);
      markersRef.current.push(marker);
    });
  }, [locations, onOpen]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="rounded-xl overflow-hidden border border-neutral-800"
        style={{ width: '100%', height: `min(${heightVh.desktop}vh, 700px)` }}
      />
      <style jsx>{`
        @media (max-width: 768px) {
          div[ref="containerRef"] { height: ${heightVh.mobile}vh; }
        }
      `}</style>

      {/* Legend bottom-center */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-3 z-10">
        <div className="flex gap-4 rounded-lg border border-neutral-800 bg-neutral-950/80 backdrop-blur px-4 py-2 text-xs text-neutral-200">
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{background:'#ffffff'}} />Hauntings</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{background:'#9ee37d'}} />UFOs</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{background:'#f2a65a'}} />Cryptids</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{background:'#b18cff'}} />Events</span>
          <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-full" style={{background:'#00fff6'}} />You</span>
        </div>
      </div>
    </div>
  );
});















