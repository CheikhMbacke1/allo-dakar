'use client';

import { useState } from 'react';
import { TrajetLigne } from './trajet-ligne';
import { api, ApiError } from '@/lib/api';
import type { Availability } from '@/lib/types';
import { useSession } from '@/lib/session';
import { useRouter } from 'next/navigation';

export function CarteDisponibilite({ dispo }: { dispo: Availability }) {
  const { user } = useSession();
  const router = useRouter();
  const [reservation, setReservation] = useState(false);
  const [pickupAddress, setPickupAddress] = useState('');
  const [seatsBooked, setSeatsBooked] = useState(1);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [succes, setSucces] = useState(false);

  async function reserver(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    setErreur(null);
    setEnvoi(true);
    try {
      await api.post('/bookings', {
        availabilityId: dispo.id,
        seatsBooked,
        pickupAddress: pickupAddress || undefined,
      });
      setSucces(true);
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="panneau bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <TrajetLigne origine={dispo.originCity} destination={dispo.destinationCity} className="flex-1" />
        <p className="whitespace-nowrap font-display text-2xl font-bold text-encre">
          {Number(dispo.pricePerSeat).toLocaleString('fr-FR')} F<span className="text-sm font-normal">/place</span>
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-body text-sm text-encre/70">
        <span>
          📅 {new Date(dispo.travelDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
        </span>
        <span>🕒 Départ {dispo.departureTime.slice(11, 16)}</span>
        <span>👥 {dispo.seatsAvailable} place(s) restante(s)</span>
        {dispo.homePickupAvailable && <span>🏠 Prise en charge à domicile</span>}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-encre/10 pt-4">
        <div className="font-body text-sm">
          <span className="font-semibold">{dispo.driver.fullName}</span>
          {dispo.driver.driverProfile && (
            <span className="text-encre/60">
              {' '}
              · ⭐ {Number(dispo.driver.driverProfile.ratingAvg).toFixed(1)} (
              {dispo.driver.driverProfile.ratingCount})
            </span>
          )}
        </div>
        {!reservation && !succes && (
          <button onClick={() => setReservation(true)} className="btn-primaire !px-4 !py-2 text-sm">
            Réserver
          </button>
        )}
      </div>

      {succes && (
        <p className="mt-4 border-2 border-savane bg-savane/10 px-4 py-3 font-body text-sm text-savane">
          Demande envoyée ! Suivez son statut dans « Mes réservations ».
        </p>
      )}

      {reservation && !succes && (
        <form onSubmit={reserver} className="mt-4 space-y-4 border-t border-encre/10 pt-4">
          {erreur && (
            <p className="border-2 border-laterite bg-laterite/10 px-3 py-2 font-body text-sm text-laterite">
              {erreur}
            </p>
          )}
          <div>
            <label className="etiquette">Nombre de places</label>
            <input
              type="number"
              min={1}
              max={dispo.seatsAvailable}
              value={seatsBooked}
              onChange={(e) => setSeatsBooked(Number(e.target.value))}
              className="champ"
            />
          </div>
          {dispo.homePickupAvailable && (
            <div>
              <label className="etiquette">Adresse ou point de prise en charge</label>
              <input
                type="text"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Ex : Devant la station Total de Liberté 6"
                className="champ"
              />
            </div>
          )}
          <div className="flex gap-3">
            <button type="submit" disabled={envoi} className="btn-primaire flex-1">
              {envoi ? 'Envoi…' : 'Confirmer la demande'}
            </button>
            <button type="button" onClick={() => setReservation(false)} className="btn-secondaire">
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
