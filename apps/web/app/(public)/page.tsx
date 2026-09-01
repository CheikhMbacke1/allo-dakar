import Link from 'next/link';
import { TrajetLigne } from '@/components/trajet-ligne';

const DESTINATIONS_POPULAIRES = [
  { origine: 'Dakar', destination: 'Touba' },
  { origine: 'Dakar', destination: 'Saint-Louis' },
  { origine: 'Dakar', destination: 'Kaolack' },
  { origine: 'Thiès', destination: 'Mbour' },
];

export default function AccueilPage() {
  return (
    <div>
      {/* Hero : le moment le plus caractéristique — un trajet qui se dessine */}
      <section className="border-b-2 border-encre bg-sable">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="mb-4 inline-block border-2 border-encre bg-jaune px-3 py-1 font-body text-sm font-semibold text-encre">
            Nouveau à Dakar, Touba, Saint-Louis, Kaolack et Mbour
          </p>
          <h1 className="max-w-2xl font-display text-5xl font-bold leading-[1.1] text-encre sm:text-6xl">
            Un chauffeur qui vient vous chercher, où que vous soyez.
          </h1>
          <p className="mt-6 max-w-lg font-body text-lg text-encre/80">
            Réservez un trajet entre villes avec un chauffeur indépendant, directement
            depuis chez vous. Fini l&apos;attente à la gare routière.
          </p>

          <div className="mt-10 panneau max-w-2xl bg-white p-6">
            <TrajetLigne origine="Dakar" destination="Touba" className="mb-6" />
            <Link href="/rechercher" className="btn-primaire w-full sm:w-auto">
              Trouver mon trajet
            </Link>
          </div>
        </div>
      </section>

      {/* Destinations populaires : contenu réel, pas décoratif */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-8 font-display text-2xl font-semibold">Trajets fréquents</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {DESTINATIONS_POPULAIRES.map((d) => (
            <Link
              key={`${d.origine}-${d.destination}`}
              href={`/rechercher?origine=${d.origine}&destination=${d.destination}`}
              className="panneau flex items-center justify-between bg-white p-5 transition-colors hover:bg-sable-dark"
            >
              <TrajetLigne origine={d.origine} destination={d.destination} />
            </Link>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="border-t-2 border-encre bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-10 font-display text-2xl font-semibold">Comment ça marche</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <p className="mb-2 font-display text-3xl font-bold text-jaune-dark">1</p>
              <h3 className="mb-2 font-display text-xl font-semibold">Cherchez votre trajet</h3>
              <p className="font-body text-encre/70">
                Indiquez votre ville de départ, votre destination et la date.
              </p>
            </div>
            <div>
              <p className="mb-2 font-display text-3xl font-bold text-jaune-dark">2</p>
              <h3 className="mb-2 font-display text-xl font-semibold">Réservez votre place</h3>
              <p className="font-body text-encre/70">
                Choisissez un chauffeur disponible et indiquez où il doit vous récupérer.
              </p>
            </div>
            <div>
              <p className="mb-2 font-display text-3xl font-bold text-jaune-dark">3</p>
              <h3 className="mb-2 font-display text-xl font-semibold">Voyagez sereinement</h3>
              <p className="font-body text-encre/70">
                Suivez votre trajet et évaluez votre chauffeur à l&apos;arrivée.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA chauffeurs */}
      <section className="border-t-2 border-encre bg-atlantique">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-14 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">
              Vous avez un véhicule ?
            </h2>
            <p className="mt-2 font-body text-white/80">
              Devenez chauffeur partenaire et publiez vos trajets disponibles.
            </p>
          </div>
          <Link href="/login" className="btn-primaire whitespace-nowrap">
            Devenir chauffeur
          </Link>
        </div>
      </section>
    </div>
  );
}
