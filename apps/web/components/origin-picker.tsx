'use client';

import { useState } from 'react';
import { MapPicker } from './map-picker';
import { reverseGeocodeVille } from '@/lib/geocode';

interface OriginPickerProps {
  label?: string;
  city: string;
  onCityChange: (city: string) => void;
  placeholder?: string;
  /** Si fourni, la zone/quartier détecté sur la carte est proposé dans ce champ. */
  zone?: string;
  onZoneChange?: (zone: string) => void;
}

/**
 * Champ « ville de départ » classique, avec en plus la possibilité de
 * choisir le point de départ exact sur une carte (clic, glisser-déposer du
 * repère, ou géolocalisation du navigateur). La ville — et la zone si le
 * champ est fourni — sont alors déduites par géocodage inverse et pré-
 * remplies, mais restent modifiables : la carte est une aide, pas une
 * contrainte.
 */
export function OriginPicker({
  label = 'Ville de départ',
  city,
  onCityChange,
  placeholder = 'Dakar',
  zone,
  onZoneChange,
}: OriginPickerProps) {
  const [carteOuverte, setCarteOuverte] = useState(false);
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [recherche, setRecherche] = useState(false);
  const [adresseDetectee, setAdresseDetectee] = useState<string | null>(null);

  async function selectionnerPoint(pointLat: number, pointLng: number) {
    setLat(pointLat);
    setLng(pointLng);
    setRecherche(true);
    const { city: villeDetectee, zone: zoneDetectee, label: adresse } = await reverseGeocodeVille(
      pointLat,
      pointLng,
    );
    if (villeDetectee) onCityChange(villeDetectee);
    if (zoneDetectee && onZoneChange) onZoneChange(zoneDetectee);
    setAdresseDetectee(adresse);
    setRecherche(false);
  }

  return (
    <div className={carteOuverte ? 'sm:col-span-2 lg:col-span-3' : undefined}>
      <div className="flex items-center justify-between">
        <label className="etiquette">{label}</label>
        <button
          type="button"
          onClick={() => setCarteOuverte((v) => !v)}
          className="font-body text-sm font-medium text-atlantique hover:underline"
        >
          {carteOuverte ? 'Fermer la carte' : '📍 Choisir sur la carte'}
        </button>
      </div>

      <input
        required
        className="champ"
        value={city}
        onChange={(e) => onCityChange(e.target.value)}
        placeholder={placeholder}
      />

      {carteOuverte && (
        <div className="mt-2 space-y-2">
          <MapPicker
            initialLat={lat}
            initialLng={lng}
            onChange={selectionnerPoint}
            label="Point de départ exact"
          />
          {recherche && (
            <p className="font-body text-xs text-encre/50">Détection de la ville…</p>
          )}
          {!recherche && adresseDetectee && (
            <p className="font-body text-xs text-encre/60">📍 Position détectée : {adresseDetectee}</p>
          )}
        </div>
      )}
    </div>
  );
}
