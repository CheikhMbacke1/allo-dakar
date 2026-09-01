import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingStatus, BOOKING_TRANSITIONS, UserRole, JwtPayload } from '@allo-dakar/shared';

// Transitions que seul le chauffeur peut déclencher (le client ne peut
// que créer la demande et annuler tant qu'elle n'est pas en cours).
const DRIVER_ONLY_TRANSITIONS = new Set<BookingStatus>([
  BookingStatus.CONFIRMEE,
  BookingStatus.CHAUFFEUR_EN_ROUTE,
  BookingStatus.CHAUFFEUR_ARRIVE,
  BookingStatus.EN_COURS,
  BookingStatus.TERMINEE,
]);

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(clientId: string, dto: CreateBookingDto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.$transaction(async (tx: any) => {
      const availability = await tx.availability.findUnique({ where: { id: dto.availabilityId } });
      if (!availability || availability.isCancelled) {
        throw new NotFoundException('Disponibilité introuvable ou annulée.');
      }
      if (availability.driverId === clientId) {
        throw new BadRequestException('Un chauffeur ne peut pas réserver sa propre disponibilité.');
      }
      if (availability.seatsAvailable < dto.seatsBooked) {
        throw new BadRequestException('Places insuffisantes pour cette disponibilité.');
      }

      const booking = await tx.booking.create({
        data: {
          availabilityId: dto.availabilityId,
          clientId,
          seatsBooked: dto.seatsBooked,
          pickupAddress: dto.pickupAddress,
          pickupLat: dto.pickupLat,
          pickupLng: dto.pickupLng,
          pickupInstructions: dto.pickupInstructions,
          status: BookingStatus.DEMANDEE,
          priceTotal: Number(availability.pricePerSeat) * dto.seatsBooked,
        },
      });

      // Les places ne sont décrémentées qu'à la demande (pas à la confirmation)
      // pour éviter le sur-booking pendant que le chauffeur répond ; si le
      // chauffeur refuse (statut -> annulee), on recrédite les places (cf. updateStatus).
      await tx.availability.update({
        where: { id: dto.availabilityId },
        data: { seatsAvailable: { decrement: dto.seatsBooked } },
      });

      return booking;
    });
  }

  async listForClient(clientId: string) {
    return this.prisma.booking.findMany({
      where: { clientId },
      include: { availability: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async listForDriver(driverId: string) {
    return this.prisma.booking.findMany({
      where: { availability: { driverId } },
      include: { availability: true, client: { select: { id: true, fullName: true, phone: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(user: JwtPayload, bookingId: string, dto: UpdateBookingStatusDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { availability: true },
    });
    if (!booking) throw new NotFoundException('Réservation introuvable.');

    const isOwnerClient = booking.clientId === user.sub;
    const isOwnerDriver = booking.availability.driverId === user.sub;
    if (!isOwnerClient && !isOwnerDriver && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Vous n'êtes pas partie prenante de cette réservation.");
    }

    const currentStatus = booking.status as BookingStatus;
    const allowedNext = BOOKING_TRANSITIONS[currentStatus] ?? [];
    if (!allowedNext.includes(dto.status)) {
      throw new BadRequestException(
        `Transition invalide : ${currentStatus} -> ${dto.status}.`,
      );
    }

    if (DRIVER_ONLY_TRANSITIONS.has(dto.status) && !isOwnerDriver && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Seul le chauffeur peut effectuer cette transition.');
    }

    // Si annulation, on recrédite les places disponibles.
    if (dto.status === BookingStatus.ANNULEE) {
      await this.prisma.availability.update({
        where: { id: booking.availabilityId },
        data: { seatsAvailable: { increment: booking.seatsBooked } },
      });
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: dto.status },
    });
  }
}
