'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import type { Availability } from '@/lib/types';
import { CarteDisponibilite } from '@/components/carte-disponibilite';

interface ResultatsPagines {
  results: Availability[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

function RechercheFormulaire() {
  const params = useSearchParams();
  const [originCity, setOriginCity] = useState(params.get('origine') ?? '');
  const [destinationCity, setDestinationCity] = useState(params.get('destination') ?? '');
  const [travelDate, setTravelDate] = useState('');
  const [resultats, setResultats] = useState<Availability[] | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function rechercher(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur(null);
    try {
      const query = new URLSearchParams({ originCity, destinationCity });
      if (travelDate) query.set('travelDate', travelDate);
      const data = await api.get<ResultatsPagines>(`/availabilities/search?${query.toString()}`);
      setResultats(data.results);
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
      setResultats([]);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="mb-8 font-display text-3xl font-bold">Trouver un trajet</h1>

      <form onSubmit={rechercher} className="panneau mb-10 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="etiquette">Départ</label>
            <input
              required
              className="champ"
              value={originCity}
              onChange={(e) => setOriginCity(e.target.value)}
              placeholder="Dakar"
            />
          </div>
          <div>
            <label className="etiquette">Destination</label>
            <input
              required
              className="champ"
              value={destinationCity}
              onChange={(e) => setDestinationCity(e.target.value)}
              placeholder="Touba"
            />
          </div>
          <div>
            <label className="etiquette">Date (optionnel)</label>
            <input
              type="date"
              className="champ"
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" disabled={chargement} className="btn-primaire mt-5 w-full sm:w-auto">
          {chargement ? 'Recherche…' : 'Rechercher'}
        </button>
      </form>

      {erreur && (
        <p className="mb-6 border-2 border-laterite bg-laterite/10 px-4 py-3 font-body text-sm text-laterite">
          {erreur}
        </p>
      )}

      {resultats !== null && (
        <div className="space-y-4">
          {resultats.length === 0 ? (
            <p className="font-body text-encre/60">
              Aucun trajet disponible pour cette recherche. Essayez une autre date.
            </p>
          ) : (
            resultats.map((dispo) => <CarteDisponibilite key={dispo.id} dispo={dispo} />)
          )}
        </div>
      )}
    </div>
  );
}

export default function RecherchePage() {
  return (
    <Suspense>
      <RechercheFormulaire />
    </Suspense>
  );
}
