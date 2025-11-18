// lib/geocodePostal.ts

export async function geocodePostal(
  countryCode: string,
  postalCode: string,
): Promise<{ lng: number; lat: number } | null> {
  const trimmed = postalCode.trim();
  if (!trimmed) return null;

  const query = encodeURIComponent(trimmed);
  const country = encodeURIComponent(countryCode.toUpperCase());

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?country=${country}&limit=1&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const first = data?.features?.[0];
    if (!first || !Array.isArray(first.center)) return null;
    const [lng, lat] = first.center;
    return { lng, lat };
  } catch {
    return null;
  }
}
