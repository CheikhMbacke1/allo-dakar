'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Booking, BookingStatus } from '@/lib/types';
import { TrajetLigne } from '@/components/trajet-ligne';
import { StatutBadge } from '@/components/statut-badge';

// Prochaine action possible pour le chauffeur, selon le statut courant.
const PROCHAINE_ACTION: Partial<Record<BookingStatus, { label: string; next: BookingStatus }>> = {
  demandee: { label: 'Confirmer', next: 'confirmee' },
  en_attente: { label: 'Confirmer', next: 'confirmee' },
  confirmee: { label: 'Je pars', next: 'chauffeur_en_route' },
  chauffeur_en_route: { label: 'Je suis arrivé', next: 'chauffeur_arrive' },
  chauffeur_arrive: { label: 'Démarrer le trajet', next: 'en_cours' },
  en_cours: { label: 'Terminer le trajet', next: 'terminee' },
};

export default function ReservationsChauffeurPage() {
  const [reservations, setReservations] = useState<Booking[] | null>(null);

  function charger() {
    api.get<Booking[]>('/bookings/driver').then(setReservations);
  }

  useEffect(charger, []);

  async function changerStatut(id: string, status: BookingStatus) {
    await api.patch(`/bookings/${id}/status`, { status });
    charger();
  }

  if (reservations === null) {
    return <p className="mx-auto max-w-3xl px-6 py-14 font-body text-encre/60">Chargement…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="mb-8 font-display text-3xl font-bold">Réservations reçues</h1>

      {reservations.length === 0 ? (
        <p className="font-body text-encre/60">Aucune réservation pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {reservations.map((r) => {
            const action = PROCHAINE_ACTION[r.status];
            return (
              <div key={r.id} className="panneau bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <TrajetLigne
                    origine={r.availability.originCity}
                    destination={r.availability.destinationCity}
                    className="flex-1"
                  />
                  <StatutBadge statut={r.status} />
                </div>
                <div className="mt-3 space-y-1 font-body text-sm text-encre/70">
                  <p>Client : {r.client?.fullName} · {r.client?.phone}</p>
                  <p>{r.seatsBooked} place(s) · {Number(r.priceTotal).toLocaleString('fr-FR')} F</p>
                  {r.pickupLat != null && r.pickupLng != null && (
                    <p>
                      📍{' '}
                      <a
                        href={`https://www.google.com/maps?q=${r.pickupLat},${r.pickupLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-atlantique underline"
                      >
                        Voir le point de prise en charge sur la carte
                      </a>
                    </p>
                  )}
                  {r.pickupInstructions && <p>💬 {r.pickupInstructions}</p>}
                </div>
                <div className="mt-4 flex gap-3">
                  {action && (
                    <button
                      onClick={() => changerStatut(r.id, action.next)}
                      className="btn-primaire !px-4 !py-2 text-sm"
                    >
                      {action.label}
                    </button>
                  )}
                  {(r.status === 'demandee' || r.status === 'en_attente') && (
                    <button
                      onClick={() => changerStatut(r.id, 'annulee')}
                      className="font-body text-sm text-laterite hover:underline"
                    >
                      Refuser
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
