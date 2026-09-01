'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface ChauffeurEnAttente {
  userId: string;
  bio?: string;
  user: { fullName: string; phone: string; createdAt: string };
}

export default function ChauffeursAValiderPage() {
  const [chauffeurs, setChauffeurs] = useState<ChauffeurEnAttente[] | null>(null);

  function charger() {
    api.get<ChauffeurEnAttente[]>('/drivers/pending').then(setChauffeurs);
  }

  useEffect(charger, []);

  async function traiter(userId: string, status: 'valide' | 'rejete') {
    await api.patch(`/drivers/${userId}/review`, { status });
    charger();
  }

  if (chauffeurs === null) {
    return <p className="mx-auto max-w-3xl px-6 py-14 font-body text-encre/60">Chargement…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="mb-8 font-display text-3xl font-bold">Chauffeurs à valider</h1>

      {chauffeurs.length === 0 ? (
        <p className="font-body text-encre/60">Aucune demande en attente. 🎉</p>
      ) : (
        <div className="space-y-4">
          {chauffeurs.map((c) => (
            <div key={c.userId} className="panneau bg-white p-5">
              <p className="font-display text-lg font-semibold">{c.user.fullName}</p>
              <p className="font-body text-sm text-encre/60">{c.user.phone}</p>
              {c.bio && <p className="mt-2 font-body text-sm text-encre/80">{c.bio}</p>}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => traiter(c.userId, 'valide')}
                  className="btn-primaire !px-4 !py-2 text-sm"
                >
                  Valider
                </button>
                <button
                  onClick={() => traiter(c.userId, 'rejete')}
                  className="font-body text-sm text-laterite hover:underline"
                >
                  Rejeter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
