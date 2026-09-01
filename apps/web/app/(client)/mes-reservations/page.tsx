'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Booking } from '@/lib/types';
import { TrajetLigne } from '@/components/trajet-ligne';
import { StatutBadge } from '@/components/statut-badge';
import { useSession } from '@/lib/session';
import { useRouter } from 'next/navigation';

export default function MesReservationsPage() {
  const { user, loading: sessionLoading } = useSession();
  const router = useRouter();
  const [reservations, setReservations] = useState<Booking[] | null>(null);

  useEffect(() => {
    if (!sessionLoading && !user) router.push('/login');
  }, [sessionLoading, user, router]);

  useEffect(() => {
    if (user) api.get<Booking[]>('/bookings/mine').then(setReservations);
  }, [user]);

  async function annuler(id: string) {
    await api.patch(`/bookings/${id}/status`, { status: 'annulee' });
    setReservations((prev) => prev?.map((r) => (r.id === id ? { ...r, status: 'annulee' } : r)) ?? null);
  }

  if (!user || reservations === null) {
    return <p className="mx-auto max-w-3xl px-6 py-14 font-body text-encre/60">Chargement…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="mb-8 font-display text-3xl font-bold">Mes réservations</h1>

      {reservations.length === 0 ? (
        <p className="font-body text-encre/60">
          Vous n&apos;avez pas encore de réservation. Trouvez un trajet pour commencer.
        </p>
      ) : (
        <div className="space-y-4">
          {reservations.map((r) => (
            <div key={r.id} className="panneau bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <TrajetLigne
                  origine={r.availability.originCity}
                  destination={r.availability.destinationCity}
                  className="flex-1"
                />
                <StatutBadge statut={r.status} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 font-body text-sm text-encre/70">
                <span>{r.seatsBooked} place(s)</span>
                <span>{Number(r.priceTotal).toLocaleString('fr-FR')} F</span>
                <span>Chauffeur : {r.availability.driver.fullName}</span>
              </div>
              {(r.status === 'demandee' || r.status === 'en_attente') && (
                <button
                  onClick={() => annuler(r.id)}
                  className="mt-4 font-body text-sm font-medium text-laterite hover:underline"
                >
                  Annuler la réservation
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
