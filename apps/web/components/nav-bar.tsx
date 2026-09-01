'use client';

import Link from 'next/link';
import { useSession } from '@/lib/session';

export function NavBar() {
  const { user, loading, logout } = useSession();

  return (
    <header className="border-b-2 border-encre bg-sable">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl font-bold text-encre">
          Allo Dakar
        </Link>

        <nav className="flex items-center gap-6 font-body text-sm font-medium">
          {!loading && !user && (
            <>
              <Link href="/rechercher" className="hover:text-atlantique">
                Trouver un trajet
              </Link>
              <Link href="/login" className="btn-secondaire !px-4 !py-2">
                Se connecter
              </Link>
            </>
          )}

          {user?.role === 'client' && (
            <>
              <Link href="/rechercher" className="hover:text-atlantique">
                Rechercher
              </Link>
              <Link href="/mes-reservations" className="hover:text-atlantique">
                Mes réservations
              </Link>
              <button onClick={logout} className="hover:text-laterite">
                Déconnexion
              </button>
            </>
          )}

          {user?.role === 'chauffeur' && (
            <>
              <Link href="/tableau-de-bord" className="hover:text-atlantique">
                Tableau de bord
              </Link>
              <Link href="/disponibilites" className="hover:text-atlantique">
                Mes trajets
              </Link>
              <Link href="/reservations" className="hover:text-atlantique">
                Réservations
              </Link>
              <button onClick={logout} className="hover:text-laterite">
                Déconnexion
              </button>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <Link href="/chauffeurs" className="hover:text-atlantique">
                Chauffeurs à valider
              </Link>
              <Link href="/statistiques" className="hover:text-atlantique">
                Statistiques
              </Link>
              <button onClick={logout} className="hover:text-laterite">
                Déconnexion
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
