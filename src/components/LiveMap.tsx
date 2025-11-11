'use client';

import { useEffect, useRef } from 'react';

type Props = {
  centerSignal: number; // when this number changes, we center on user
};

export default function LiveMap({ centerSignal }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    // ensure Mapbox CSS is present (CDN)
    if (!document.getElementById('mapbox-gl-css')) {
      const link = document.createElement('link');
      link.id = 'mapbox-gl-css';
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      document.head.appendChild(link);
    }

    (async () => {
      const mapboxgl = (await import('mapbox-gl')).default;
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

      if (!containerRef.current || cancelled) return;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-2, 54], // UK
        zoom: 4,
        attributionControl: false,
      });
      mapRef.current = map;

      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
      map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // initial try to center
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { longitude, latitude } = pos.coords;
            map.flyTo({ center: [longitude, latitude], zoom: 10 });
            new mapboxgl.Marker({ color: '#00FFF6' }).setLngLat([longitude, latitude]).addTo(map);
          },
          () => {},
          { enableHighAccuracy: true, timeout: 5000 }
        );
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // when centerSignal changes, re-center on user
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { longitude, latitude } = pos.coords;
          map.flyTo({ center: [longitude, latitude], zoom: 12 });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [centerSignal]);

  return (
    <div className="sticky top-[84px] z-40">
      <div className="h-[42vh] w-full border-b border-neutral-800">
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
