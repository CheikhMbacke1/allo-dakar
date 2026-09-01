'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken, ApiError } from '@/lib/api';
import { useSession } from '@/lib/session';

type Etape = 'telephone' | 'code';

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useSession();

  const [etape, setEtape] = useState<Etape>('telephone');
  const [phone, setPhone] = useState('+221');
  const [code, setCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [besoinNom, setBesoinNom] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  async function demanderCode(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);
    try {
      await api.post('/auth/otp/request', { phone });
      setEtape('code');
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setChargement(false);
    }
  }

  async function verifierCode(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setChargement(true);
    try {
      const { accessToken } = await api.post<{ accessToken: string; isNewUser: boolean }>(
        '/auth/otp/verify',
        { phone, code, fullName: besoinNom ? fullName : undefined },
      );
      setToken(accessToken);
      await refresh();
      router.push('/');
    } catch (err) {
      if (err instanceof ApiError && err.message.includes('Nom complet requis')) {
        setBesoinNom(true);
        setErreur('Première connexion : indiquez votre nom pour créer votre compte.');
      } else {
        setErreur(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
      }
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="mb-2 font-display text-3xl font-bold">
        {etape === 'telephone' ? 'Connexion' : 'Vérification'}
      </h1>
      <p className="mb-8 font-body text-encre/70">
        {etape === 'telephone'
          ? 'Entrez votre numéro pour recevoir un code de vérification.'
          : `Un code a été envoyé au ${phone}.`}
      </p>

      {erreur && (
        <div className="mb-6 border-2 border-laterite bg-laterite/10 px-4 py-3 font-body text-sm text-laterite">
          {erreur}
        </div>
      )}

      {etape === 'telephone' ? (
        <form onSubmit={demanderCode} className="space-y-5">
          <div>
            <label htmlFor="phone" className="etiquette">
              Numéro de téléphone
            </label>
            <input
              id="phone"
              type="tel"
              required
              className="champ"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+221771234567"
            />
          </div>
          <button type="submit" disabled={chargement} className="btn-primaire w-full">
            {chargement ? 'Envoi en cours…' : 'Recevoir le code'}
          </button>
        </form>
      ) : (
        <form onSubmit={verifierCode} className="space-y-5">
          <div>
            <label htmlFor="code" className="etiquette">
              Code reçu par SMS
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              required
              className="champ tracking-[0.3em]"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="0000"
              maxLength={6}
            />
          </div>

          {besoinNom && (
            <div>
              <label htmlFor="fullName" className="etiquette">
                Nom complet
              </label>
              <input
                id="fullName"
                type="text"
                required
                className="champ"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Amadou Diallo"
              />
            </div>
          )}

          <button type="submit" disabled={chargement} className="btn-primaire w-full">
            {chargement ? 'Vérification…' : 'Valider'}
          </button>
          <button
            type="button"
            onClick={() => setEtape('telephone')}
            className="w-full text-center font-body text-sm text-encre/60 hover:text-encre"
          >
            Changer de numéro
          </button>
        </form>
      )}
    </div>
  );
}
