// Types et constantes partagés entre l'API, le web et le mobile.
// IMPORTANT : ces valeurs doivent rester strictement synchronisées avec
// les enums définis dans apps/api/prisma/schema.prisma.

export enum UserRole {
  CLIENT = 'client',
  CHAUFFEUR = 'chauffeur',
  ADMIN = 'admin',
  SUPPORT = 'support',
}

export enum DriverStatus {
  EN_ATTENTE = 'en_attente',
  VALIDE = 'valide',
  SUSPENDU = 'suspendu',
  REJETE = 'rejete',
}

export enum VehicleType {
  BERLINE = 'berline',
  SUV = 'suv',
  MINIBUS = 'minibus',
  AUTRE = 'autre',
}

// Machine à états des réservations. Les transitions valides sont
// centralisées ici pour que le mobile/web n'aient jamais à deviner
// quel bouton afficher : le backend est la seule source de vérité,
// mais le front peut s'appuyer sur cette table pour l'UI.
export enum BookingStatus {
  DEMANDEE = 'demandee',
  EN_ATTENTE = 'en_attente',
  CONFIRMEE = 'confirmee',
  CHAUFFEUR_EN_ROUTE = 'chauffeur_en_route',
  CHAUFFEUR_ARRIVE = 'chauffeur_arrive',
  EN_COURS = 'en_cours',
  TERMINEE = 'terminee',
  ANNULEE = 'annulee',
}

export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.DEMANDEE]: [BookingStatus.EN_ATTENTE, BookingStatus.ANNULEE],
  [BookingStatus.EN_ATTENTE]: [BookingStatus.CONFIRMEE, BookingStatus.ANNULEE],
  [BookingStatus.CONFIRMEE]: [BookingStatus.CHAUFFEUR_EN_ROUTE, BookingStatus.ANNULEE],
  [BookingStatus.CHAUFFEUR_EN_ROUTE]: [BookingStatus.CHAUFFEUR_ARRIVE, BookingStatus.ANNULEE],
  [BookingStatus.CHAUFFEUR_ARRIVE]: [BookingStatus.EN_COURS, BookingStatus.ANNULEE],
  [BookingStatus.EN_COURS]: [BookingStatus.TERMINEE],
  [BookingStatus.TERMINEE]: [],
  [BookingStatus.ANNULEE]: [],
};

export enum NotificationType {
  NEW_AVAILABILITY = 'new_availability',
  BOOKING_STATUS = 'booking_status',
  MESSAGE = 'message',
}

export interface JwtPayload {
  sub: string; // user id
  role: UserRole;
  phone: string;
}
