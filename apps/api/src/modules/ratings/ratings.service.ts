import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { BookingStatus } from '@allo-dakar/shared';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, bookingId: string, dto: CreateRatingDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { availability: true },
    });
    if (!booking) throw new NotFoundException('Réservation introuvable.');
    if (booking.status !== BookingStatus.TERMINEE) {
      throw new BadRequestException("Le trajet doit être terminé pour pouvoir l'évaluer.");
    }

    const isClient = booking.clientId === userId;
    const isDriver = booking.availability.driverId === userId;
    if (!isClient && !isDriver) {
      throw new ForbiddenException("Vous n'étiez pas partie prenante de ce trajet.");
    }
    const ratedUserId = isClient ? booking.availability.driverId : booking.clientId;

    const existing = await this.prisma.rating.findUnique({
      where: { bookingId_ratedBy: { bookingId, ratedBy: userId } },
    });
    if (existing) {
      throw new ConflictException('Vous avez déjà évalué ce trajet.');
    }

    const rating = await this.prisma.rating.create({
      data: { bookingId, ratedBy: userId, ratedUserId, score: dto.score, comment: dto.comment },
    });

    // Recalcule la note moyenne du chauffeur si c'est lui qui est évalué.
    if (isClient) {
      const agg = await this.prisma.rating.aggregate({
        where: { ratedUserId },
        _avg: { score: true },
        _count: true,
      });
      await this.prisma.driverProfile.update({
        where: { userId: ratedUserId },
        data: {
          ratingAvg: agg._avg.score ?? 0,
          ratingCount: agg._count,
        },
      });
    }

    return rating;
  }
}
