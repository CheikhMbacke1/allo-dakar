import type { BookingStatus } from '@/lib/types';
import { BOOKING_STATUS_LABELS } from '@/lib/types';

const STYLES: Record<BookingStatus, string> = {
  demandee: 'bg-jaune/20 text-jaune-dark border-jaune-dark',
  en_attente: 'bg-jaune/20 text-jaune-dark border-jaune-dark',
  confirmee: 'bg-atlantique/10 text-atlantique border-atlantique',
  chauffeur_en_route: 'bg-atlantique/10 text-atlantique border-atlantique',
  chauffeur_arrive: 'bg-atlantique/10 text-atlantique border-atlantique',
  en_cours: 'bg-savane/10 text-savane border-savane',
  terminee: 'bg-savane/10 text-savane border-savane',
  annulee: 'bg-laterite/10 text-laterite border-laterite',
};

export function StatutBadge({ statut }: { statut: BookingStatus }) {
  return (
    <span
      className={`inline-block whitespace-nowrap border-2 px-3 py-1 font-body text-xs font-semibold ${STYLES[statut]}`}
    >
      {BOOKING_STATUS_LABELS[statut]}
    </span>
  );
}
