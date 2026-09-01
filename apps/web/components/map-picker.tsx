'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import type { Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onChange: (lat: number, lng: number) => void;
}

// Centre par défaut : Dakar. Le repère se recentre automatiquement dès
// que l'utilisateur clique sur la carte, le déplace, ou utilise sa
// position exacte via la géolocalisation du navigateur.
const DAKAR_CENTRE = { lat: 14.6937, lng: -17.4441 };

export function MapPicker({ initialLat, initialLng, onChange }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const [localisationEnCours, setLocalisationEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let annule = false;

    (async () => {
      // Import dynamique : Leaflet manipule `window` au chargement, donc
      // impossible de l'importer statiquement dans un contexte Next.js
      // qui pré-rend aussi côté serveur.
      const L = (await import('leaflet')).default;
      if (annule || !containerRef.current || mapRef.current) return;

      // Les icônes par défaut de Leaflet pointent vers des fichiers locaux
      // que le bundler ne résout pas automatiquement : on les sert depuis
      // un CDN pour éviter tout problème d'assets manquants.
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const depart = {
        lat: initialLat ?? DAKAR_CENTRE.lat,
        lng: initialLng ?? DAKAR_CENTRE.lng,
      };

      const map = L.map(containerRef.current).setView([depart.lat, depart.lng], 13);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([depart.lat, depart.lng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onChange(e.latlng.lat, e.latlng.lng);
      });

      // On ne signale la position initiale par défaut que si l'utilisateur
      // n'a pas déjà une position choisie (évite d'écraser une valeur reprise
      // d'un précédent rendu).
      if (initialLat === undefined || initialLng === undefined) {
        onChange(depart.lat, depart.lng);
      }
    })();

    return () => {
      annule = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function utiliserMaPosition() {
    if (!navigator.geolocation) {
      setErreur("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setErreur(null);
    setLocalisationEnCours(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (mapRef.current && markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
          mapRef.current.setView([latitude, longitude], 17);
        }
        onChange(latitude, longitude);
        setLocalisationEnCours(false);
      },
      () => {
        setErreur(
          "Impossible d'obtenir votre position exacte. Vérifiez l'autorisation de localisation, ou placez le repère manuellement sur la carte.",
        );
        setLocalisationEnCours(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="etiquette !mb-0">Point de prise en charge exact</label>
        <button
          type="button"
          onClick={utiliserMaPosition}
          disabled={localisationEnCours}
          className="font-body text-sm font-medium text-atlantique hover:underline disabled:opacity-50"
        >
          {localisationEnCours ? 'Localisation…' : '📍 Utiliser ma position exacte'}
        </button>
      </div>

      {erreur && <p className="mb-2 font-body text-xs text-laterite">{erreur}</p>}

      <div ref={containerRef} className="h-64 w-full border-2 border-encre" />

      <p className="mt-1 font-body text-xs text-encre/50">
        Déplacez le repère ou touchez la carte pour ajuster précisément l&apos;endroit où le
        chauffeur doit vous récupérer.
      </p>
    </div>
  );
}
