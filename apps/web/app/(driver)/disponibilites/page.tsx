'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';
import { TrajetLigne } from '@/components/trajet-ligne';
import { OriginPicker } from '@/components/origin-picker';
import type { Availability } from '@/lib/types';

interface Vehicle {
  id: string;
  brand?: string;
  model?: string;
}

export default function DisponibilitesPage() {
  const [dispos, setDispos] = useState<Availability[] | null>(null);
  const [vehicules, setVehicules] = useState<Vehicle[]>([]);
  const [formOuvert, setFormOuvert] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const [originCity, setOriginCity] = useState('');
  const [originZone, setOriginZone] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [seatsTotal, setSeatsTotal] = useState(4);
  const [pricePerSeat, setPricePerSeat] = useState(5000);
  const [homePickupAvailable, setHomePickupAvailable] = useState(false);
  const [vehicleId, setVehicleId] = useState('');

  function charger() {
    api.get<Availability[]>('/availabilities/mine').then(setDispos);
  }

  useEffect(() => {
    charger();
    api.get<Vehicle[]>('/vehicles/mine').then(setVehicules);
  }, []);

  async function publier(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      await api.post('/availabilities', {
        originCity,
        originZone: originZone || undefined,
        destinationCity,
        travelDate,
        departureTime,
        seatsTotal,
        pricePerSeat,
        homePickupAvailable,
        vehicleId: vehicleId || undefined,
      });
      setFormOuvert(false);
      charger();
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setEnvoi(false);
    }
  }

  async function annuler(id: string) {
    await api.patch(`/availabilities/${id}/cancel`);
    charger();
  }

  if (dispos === null) {
    return <p className="mx-auto max-w-3xl px-6 py-14 font-body text-encre/60">Chargement…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Mes trajets</h1>
        <button onClick={() => setFormOuvert((v) => !v)} className="btn-secondaire">
          {formOuvert ? 'Fermer' : '+ Publier un trajet'}
        </button>
      </div>

      {formOuvert && (
        <form onSubmit={publier} className="panneau mb-8 space-y-4 bg-white p-6">
          {erreur && (
            <p className="border-2 border-laterite bg-laterite/10 px-3 py-2 font-body text-sm text-laterite">
              {erreur}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <OriginPicker
              city={originCity}
              onCityChange={setOriginCity}
              zone={originZone}
              onZoneChange={setOriginZone}
            />
            <div>
              <label className="etiquette">Destination</label>
              <input required className="champ" value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} placeholder="Touba" />
            </div>
            <div className="sm:col-span-2">
              <label className="etiquette">Zone / quartier de départ (optionnel)</label>
              <input
                className="champ"
                value={originZone}
                onChange={(e) => setOriginZone(e.target.value)}
                placeholder="Ex : Sacré-Cœur 3"
              />
            </div>
            <div>
              <label className="etiquette">Date</label>
              <input required type="date" className="champ" value={travelDate} onChange={(e) => setTravelDate(e.target.value)} />
            </div>
            <div>
              <label className="etiquette">Heure de départ</label>
              <input required type="time" className="champ" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} />
            </div>
            <div>
              <label className="etiquette">Places disponibles</label>
              <input required type="number" min={1} max={30} className="champ" value={seatsTotal} onChange={(e) => setSeatsTotal(Number(e.target.value))} />
            </div>
            <div>
              <label className="etiquette">Prix par place (FCFA)</label>
              <input required type="number" min={0} className="champ" value={pricePerSeat} onChange={(e) => setPricePerSeat(Number(e.target.value))} />
            </div>
            {vehicules.length > 0 && (
              <div className="sm:col-span-2">
                <label className="etiquette">Véhicule</label>
                <select className="champ" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
                  <option value="">— Sélectionner —</option>
                  {vehicules.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <label className="flex items-center gap-2 font-body text-sm">
            <input type="checkbox" checked={homePickupAvailable} onChange={(e) => setHomePickupAvailable(e.target.checked)} />
            Je propose la prise en charge à domicile
          </label>
          <button type="submit" disabled={envoi} className="btn-primaire">
            {envoi ? 'Publication…' : 'Publier ce trajet'}
          </button>
        </form>
      )}

      {dispos.length === 0 ? (
        <p className="font-body text-encre/60">Aucun trajet publié pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {dispos.map((d) => (
            <div key={d.id} className="panneau bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <TrajetLigne origine={d.originCity} destination={d.destinationCity} className="flex-1" />
                <p className="font-display text-lg font-bold">
                  {Number(d.pricePerSeat).toLocaleString('fr-FR')} F
                </p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 font-body text-sm text-encre/70">
                <span>📅 {new Date(d.travelDate).toLocaleDateString('fr-FR')}</span>
                <span>👥 {d.seatsAvailable}/{d.seatsTotal} places</span>
              </div>
              <button
                onClick={() => annuler(d.id)}
                className="mt-3 font-body text-sm text-laterite hover:underline"
              >
                Annuler ce trajet
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
