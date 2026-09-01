interface TrajetLigneProps {
  origine: string;
  destination: string;
  className?: string;
}

// Le motif central du produit : une route en pointillés entre deux villes,
// avec un point plein à chaque bout. Réutilisé sur les résultats de
// recherche, les cartes de réservation, et le suivi de trajet.
export function TrajetLigne({ origine, destination, className = '' }: TrajetLigneProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <span className="whitespace-nowrap font-display text-lg font-semibold text-encre">
        {origine}
      </span>
      <span className="relative flex h-2 flex-1 min-w-[40px] items-center" aria-hidden="true">
        <span className="h-2 w-2 shrink-0 rounded-full bg-encre" />
        <span
          className="mx-1 h-0 flex-1 border-t-2 border-dotted border-encre/50"
          style={{ borderTopWidth: 2 }}
        />
        <span className="h-2 w-2 shrink-0 rounded-full bg-jaune ring-2 ring-encre" />
      </span>
      <span className="whitespace-nowrap font-display text-lg font-semibold text-encre">
        {destination}
      </span>
    </div>
  );
}
