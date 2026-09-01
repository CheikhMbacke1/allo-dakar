'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { useSession } from '@/lib/session';
import Link from 'next/link';

export default function TableauDeBordChauffeurPage() {
  const { user, loading, refresh } = useSession();
  const router = useRouter();
  const [bio, setBio] = useState('');
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  async function devenirChauffeur(e: React.FormEvent) {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      await api.post('/drivers/register', { bio });
      await refresh();
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setEnvoi(false);
    }
  }

  if (!user) return null;

  // Pas encore de profil chauffeur : proposer l'inscription
  if (!user.driverProfile) {
    return (
      <div className="mx-auto max-w-lg px-6 py-14">
        <h1 className="mb-2 font-display text-3xl font-bold">Devenir chauffeur partenaire</h1>
        <p className="mb-8 font-body text-encre/70">
          Décrivez-vous brièvement. Un administrateur validera votre profil avant que vous
          puissiez publier des trajets.
        </p>
        {erreur && (
          <p className="mb-6 border-2 border-laterite bg-laterite/10 px-4 py-3 font-body text-sm text-laterite">
            {erreur}
          </p>
        )}
        <form onSubmit={devenirChauffeur} className="space-y-5">
          <div>
            <label className="etiquette">Présentation (optionnel)</label>
            <textarea
              className="champ"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Ex : Chauffeur depuis 5 ans, trajets réguliers Dakar-Touba."
            />
          </div>
          <button type="submit" disabled={envoi} className="btn-primaire w-full">
            {envoi ? 'Envoi…' : 'Envoyer ma demande'}
          </button>
        </form>
      </div>
    );
  }

  const { status, ratingAvg, ratingCount } = user.driverProfile;

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="mb-2 font-display text-3xl font-bold">Tableau de bord chauffeur</h1>

      <div className="panneau mt-6 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-body text-sm text-encre/60">Statut du compte</p>
            <p className="font-display text-xl font-semibold">
              {status === 'valide' && '✅ Validé'}
              {status === 'en_attente' && '⏳ En attente de validation'}
              {status === 'suspendu' && '⛔ Suspendu'}
              {status === 'rejete' && '❌ Rejeté'}
            </p>
          </div>
          <div className="text-right">
            <p className="font-body text-sm text-encre/60">Note moyenne</p>
            <p className="font-display text-xl font-semibold">
              ⭐ {Number(ratingAvg).toFixed(1)} ({ratingCount})
            </p>
          </div>
        </div>

        {status === 'en_attente' && (
          <p className="mt-4 border-t border-encre/10 pt-4 font-body text-sm text-encre/70">
            Votre profil est en cours de vérification par l&apos;équipe Allo Dakar. Vous pourrez
            publier des trajets dès validation.
          </p>
        )}
      </div>

      {status === 'valide' && (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Link href="/vehicules" className="panneau bg-white p-5 hover:bg-sable-dark">
            <p className="font-display text-lg font-semibold">🚗 Mes véhicules</p>
            <p className="mt-1 font-body text-sm text-encre/60">Gérer vos véhicules enregistrés</p>
          </Link>
          <Link href="/disponibilites" className="panneau bg-white p-5 hover:bg-sable-dark">
            <p className="font-display text-lg font-semibold">🗓️ Mes trajets</p>
            <p className="mt-1 font-body text-sm text-encre/60">Publier une disponibilité</p>
          </Link>
          <Link href="/reservations" className="panneau bg-white p-5 hover:bg-sable-dark">
            <p className="font-display text-lg font-semibold">📋 Réservations</p>
            <p className="mt-1 font-body text-sm text-encre/60">Voir les demandes reçues</p>
          </Link>
        </div>
      )}
    </div>
  );
}
