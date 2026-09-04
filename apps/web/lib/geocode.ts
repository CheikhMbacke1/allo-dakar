export interface ReverseGeocodeResult {
  city: string | null;
  zone: string | null;
  label: string | null;
}

/**
 * Géocodage inverse via Nominatim (OpenStreetMap, gratuit, sans clé).
 * Retourne une ville normalisée (pour matcher les recherches par nom de
 * ville) et une zone/quartier plus précis quand disponible, en plus de
 * l'adresse complète lisible.
 *
 * Best-effort : en cas d'échec réseau ou de réponse incomplète, les champs
 * valent `null` et l'appelant doit laisser l'utilisateur saisir/corriger
 * manuellement — les coordonnées choisies sur la carte restent valides
 * indépendamment du résultat du géocodage.
 */
export async function reverseGeocodeVille(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=fr`,
    );
    if (!res.ok) return { city: null, zone: null, label: null };
    const data = await res.json();
    const addr = data?.address ?? {};
    const city: string | null = addr.city || addr.town || addr.municipality || addr.village || addr.county || null;
    const zone: string | null = addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district || null;
    return { city, zone, label: data?.display_name ?? null };
  } catch {
    return { city: null, zone: null, label: null };
  }
}
