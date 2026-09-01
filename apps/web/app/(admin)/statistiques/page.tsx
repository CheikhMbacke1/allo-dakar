'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Stats {
  clientsCount: number;
  activeDriversCount: number;
  tripsCount: number;
  cancellationRate: number;
  topDestinations: { city: string; count: number }[];
}

export default function StatistiquesPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get<Stats>('/admin/stats/overview').then(setStats);
  }, []);

  if (!stats) {
    return <p className="mx-auto max-w-4xl px-6 py-14 font-body text-encre/60">Chargement…</p>;
  }

  const chiffres = [
    { label: 'Clients inscrits', valeur: stats.clientsCount },
    { label: 'Chauffeurs actifs', valeur: stats.activeDriversCount },
    { label: 'Trajets terminés', valeur: stats.tripsCount },
    { label: "Taux d'annulation", valeur: `${Math.round(stats.cancellationRate * 100)}%` },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="mb-8 font-display text-3xl font-bold">Statistiques</h1>

      <div className="grid gap-4 sm:grid-cols-4">
        {chiffres.map((c) => (
          <div key={c.label} className="panneau bg-white p-5">
            <p className="font-display text-3xl font-bold text-jaune-dark">{c.valeur}</p>
            <p className="mt-1 font-body text-sm text-encre/70">{c.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 mt-10 font-display text-xl font-semibold">Destinations principales</h2>
      {stats.topDestinations.length === 0 ? (
        <p className="font-body text-encre/60">Pas encore assez de données.</p>
      ) : (
        <div className="panneau bg-white">
          {stats.topDestinations.map((d, i) => (
            <div
              key={d.city}
              className={`flex items-center justify-between px-5 py-3 font-body ${
                i > 0 ? 'border-t border-encre/10' : ''
              }`}
            >
              <span>{d.city}</span>
              <span className="font-semibold">{d.count} trajet(s)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
