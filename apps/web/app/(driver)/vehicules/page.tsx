'use client';

import { useEffect, useState } from 'react';
import { api, ApiError } from '@/lib/api';

interface Vehicle {
  id: string;
  brand?: string;
  model?: string;
  plateNumber: string;
  seats: number;
  vehicleType: string;
}

export default function VehiculesPage() {
  const [vehicules, setVehicules] = useState<Vehicle[] | null>(null);
  const [formOuvert, setFormOuvert] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [seats, setSeats] = useState(4);

  function charger() {
    api.get<Vehicle[]>('/vehicles/mine').then(setVehicules);
  }

  useEffect(charger, []);

  async function ajouter(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      await api.post('/vehicles', { brand, model, plateNumber, seats });
      setBrand('');
      setModel('');
      setPlateNumber('');
      setSeats(4);
      setFormOuvert(false);
      charger();
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setEnvoi(false);
    }
  }

  async function supprimer(id: string) {
    await api.delete(`/vehicles/${id}`);
    charger();
  }

  if (vehicules === null) {
    return <p className="mx-auto max-w-3xl px-6 py-14 font-body text-encre/60">Chargement…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Mes véhicules</h1>
        <button onClick={() => setFormOuvert((v) => !v)} className="btn-secondaire">
          {formOuvert ? 'Fermer' : '+ Ajouter un véhicule'}
        </button>
      </div>

      {formOuvert && (
        <form onSubmit={ajouter} className="panneau mb-8 space-y-4 bg-white p-6">
          {erreur && (
            <p className="border-2 border-laterite bg-laterite/10 px-3 py-2 font-body text-sm text-laterite">
              {erreur}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="etiquette">Marque</label>
              <input className="champ" value={brand} onChange={(e) => setBrand(e.target.value)} />
            </div>
            <div>
              <label className="etiquette">Modèle</label>
              <input className="champ" value={model} onChange={(e) => setModel(e.target.value)} />
            </div>
            <div>
              <label className="etiquette">Numéro d&apos;immatriculation</label>
              <input
                required
                className="champ"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="DK-1234-AB"
              />
            </div>
            <div>
              <label className="etiquette">Nombre de places</label>
              <input
                type="number"
                min={1}
                max={30}
                required
                className="champ"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
              />
            </div>
          </div>
          <button type="submit" disabled={envoi} className="btn-primaire">
            {envoi ? 'Ajout…' : 'Ajouter le véhicule'}
          </button>
        </form>
      )}

      {vehicules.length === 0 ? (
        <p className="font-body text-encre/60">Aucun véhicule enregistré pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {vehicules.map((v) => (
            <div key={v.id} className="panneau flex items-center justify-between bg-white p-4">
              <div>
                <p className="font-display font-semibold">
                  {v.brand} {v.model}
                </p>
                <p className="font-body text-sm text-encre/60">
                  {v.plateNumber} · {v.seats} places · {v.vehicleType}
                </p>
              </div>
              <button
                onClick={() => supprimer(v.id)}
                className="font-body text-sm text-laterite hover:underline"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
