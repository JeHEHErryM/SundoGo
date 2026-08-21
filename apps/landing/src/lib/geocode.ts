const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

/** Resolves coordinates to a human-readable place name via Mapbox Geocoding. */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  if (!TOKEN) return "Selected location";
  try {
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
      `${lng},${lat}.json?types=address,poi,neighborhood,locality,place&limit=1&access_token=${TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) return "Selected location";
    const json = await res.json();
    return json?.features?.[0]?.place_name ?? "Selected location";
  } catch {
    return "Selected location";
  }
}

/** Searches place names near a center point via Mapbox Geocoding. */
export async function searchPlaces(
  query: string,
  center: { lat: number; lng: number },
): Promise<Array<{ name: string; lat: number; lng: number }>> {
  if (!TOKEN || !query.trim()) return [];
  try {
    const url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
      `${encodeURIComponent(query)}.json?proximity=${center.lng},${center.lat}` +
      `&types=address,poi,neighborhood,locality,place&limit=5&access_token=${TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const json = (await res.json()) as {
      features?: Array<{ place_name: string; center: [number, number] }>;
    };
    return (json?.features ?? []).map((f) => ({
      name: f.place_name,
      lat: f.center[1],
      lng: f.center[0],
    }));
  } catch {
    return [];
  }
}
