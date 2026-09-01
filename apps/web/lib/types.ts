export type UserRole = 'client' | 'chauffeur' | 'admin' | 'support';
export type DriverStatus = 'en_attente' | 'valide' | 'suspendu' | 'rejete';
export type BookingStatus =
  | 'demandee'
  | 'en_attente'
  | 'confirmee'
  | 'chauffeur_en_route'
  | 'chauffeur_arrive'
  | 'en_cours'
  | 'terminee'
  | 'annulee';

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  demandee: 'Demande envoyée',
  en_attente: 'En attente de confirmation',
  confirmee: 'Confirmée',
  chauffeur_en_route: 'Chauffeur en route',
  chauffeur_arrive: 'Chauffeur arrivé',
  en_cours: 'Trajet en cours',
  terminee: 'Trajet terminé',
  annulee: 'Annulée',
};

export interface CurrentUser {
  id: string;
  phone: string;
  fullName: string;
  role: UserRole;
  driverProfile?: { status: DriverStatus; ratingAvg: number; ratingCount: number } | null;
}

export interface Availability {
  id: string;
  originCity: string;
  originZone?: string | null;
  destinationCity: string;
  travelDate: string;
  departureTime: string;
  seatsAvailable: number;
  seatsTotal: number;
  pricePerSeat: string;
  homePickupAvailable: boolean;
  notes?: string | null;
  driver: { id: string; fullName: string; driverProfile?: { ratingAvg: string; ratingCount: number } };
  vehicle?: { brand?: string; model?: string; seats: number } | null;
}

export interface Booking {
  id: string;
  status: BookingStatus;
  seatsBooked: number;
  priceTotal: string;
  pickupAddress?: string | null;
  pickupLat?: number | null;
  pickupLng?: number | null;
  pickupInstructions?: string | null;
  createdAt: string;
  availability: Availability;
  client?: { id: string; fullName: string; phone: string };
}
